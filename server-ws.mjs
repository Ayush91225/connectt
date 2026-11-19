/**
 * server-ws.mjs
 * Custom Next.js server with WebSocket signaling support.
 *
 * Usage:  node server-ws.mjs
 * URL:    ws://localhost:3000/ws?roomId=...&userId=...&userName=...
 *
 * Supported message types (JSON, field "type"):
 *   HEARTBEAT, PARTICIPANT_UPDATE, PARTICIPANT_JOINED, ANNOUNCE_PRESENCE,
 *   STATE_SYNC, PARTICIPANT_LEFT, LEAVE, PRESENTATION_START,
 *   PRESENTATION_STOP, TOOL_SYNC, WHITEBOARD_DRAW, CHAT
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.PORT || '3000', 10);
const PING_INTERVAL_MS = 25_000; // heartbeat every 25 s
const dev = process.env.NODE_ENV !== 'production';

// ── Room state ────────────────────────────────────────────────────────────────
// rooms: Map<roomId, Set<ClientMeta>>
// ClientMeta: { ws, userId, userName, roomId, alive }
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  return rooms.get(roomId);
}

function broadcast(roomId, payload, excludeWs = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(payload);
  for (const client of room) {
    if (client.ws !== excludeWs && client.ws.readyState === 1 /* OPEN */) {
      client.ws.send(data);
    }
  }
}

function findClientMeta(ws) {
  for (const room of rooms.values()) {
    for (const meta of room) {
      if (meta.ws === ws) return meta;
    }
  }
  return null;
}

function removeClient(meta) {
  const room = rooms.get(meta.roomId);
  if (!room) return;
  room.delete(meta);
  if (room.size === 0) rooms.delete(meta.roomId);
}

// ── Next.js app setup ─────────────────────────────────────────────────────────
const app = next({ dev, port: PORT });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

// ── WebSocket server ──────────────────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  const { query } = parse(req.url, true);
  const roomId   = query.roomId   || 'default';
  const userId   = query.userId   || `user-${Date.now()}`;
  const userName = query.userName || 'Anonymous';

  const meta = { ws, roomId, userId, userName, alive: true };
  const room = getOrCreateRoom(roomId);
  room.add(meta);

  console.log(`[ws] CONNECT  userId=${userId} userName=${userName} room=${roomId} (${room.size} total)`);

  // ── Send ROSTER to the new joiner ──────────────────────────────────────────
  const participants = [...room]
    .filter(c => c.ws !== ws)
    .map(c => ({ userId: c.userId, userName: c.userName }));

  ws.send(JSON.stringify({
    type: 'ROSTER',
    roomId,
    participants,
    timestamp: Date.now(),
  }));

  // ── Announce new participant to existing room members ──────────────────────
  broadcast(roomId, {
    type:      'PARTICIPANT_JOINED',
    roomId,
    userId,
    userName,
    timestamp: Date.now(),
  }, ws);

  // ── Message handler ────────────────────────────────────────────────────────
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return; // ignore malformed JSON
    }

    const { type } = msg;

    // Client heartbeat acknowledgement — just pong back
    if (type === 'HEARTBEAT') {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() }));
      }
      return;
    }

    // Client is leaving gracefully
    if (type === 'LEAVE') {
      handleDisconnect(meta);
      ws.close();
      return;
    }

    // All other supported message types → broadcast to room
    const BROADCAST_TYPES = new Set([
      'PARTICIPANT_UPDATE',
      'ANNOUNCE_PRESENCE',
      'STATE_SYNC',
      'PRESENTATION_START',
      'PRESENTATION_STOP',
      'TOOL_SYNC',
      'WHITEBOARD_DRAW',
      'CHAT',
      'HOST_CONTROL',
      'RTC_OFFER',
      'RTC_ANSWER',
      'RTC_ICE',
    ]);

    if (BROADCAST_TYPES.has(type)) {
      broadcast(roomId, {
        userId: meta.userId,
        userName: meta.userName,
        ...msg,
        timestamp: Date.now()
      }, ws);
    }
  });

  // ── Pong keeps the connection alive ───────────────────────────────────────
  ws.on('pong', () => {
    meta.alive = true;
  });

  // ── Disconnect handler ────────────────────────────────────────────────────
  ws.on('close', () => handleDisconnect(meta));
  ws.on('error', (err) => {
    console.error(`[ws] ERROR userId=${userId} room=${roomId}:`, err.message);
    handleDisconnect(meta);
  });
});

function handleDisconnect(meta) {
  const { roomId, userId, userName } = meta;
  if (!rooms.get(roomId)?.has(meta)) return; // already removed

  removeClient(meta);
  console.log(`[ws] DISCONNECT userId=${userId} room=${roomId} (${rooms.get(roomId)?.size ?? 0} remaining)`);

  broadcast(roomId, {
    type:      'PARTICIPANT_LEFT',
    roomId,
    userId,
    userName,
    timestamp: Date.now(),
  });
}

// ── Heartbeat ping loop ───────────────────────────────────────────────────────
const pingInterval = setInterval(() => {
  for (const room of rooms.values()) {
    for (const meta of room) {
      if (!meta.alive) {
        // No pong received since last ping → terminate
        console.log(`[ws] DEAD CONNECTION terminated userId=${meta.userId}`);
        meta.ws.terminate();
        handleDisconnect(meta);
        continue;
      }
      meta.alive = false;
      if (meta.ws.readyState === 1) meta.ws.ping();
    }
  }
}, PING_INTERVAL_MS);

wss.on('close', () => clearInterval(pingInterval));

// ── HTTP upgrade → WebSocket ──────────────────────────────────────────────────
httpServer.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url);
  if (pathname === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// ── Start listening ───────────────────────────────────────────────────────────
httpServer.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`[server-ws] Ready on http://localhost:${PORT} (dev=${dev})`);
  console.log(`[server-ws] WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
