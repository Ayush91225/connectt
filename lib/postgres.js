// PostgreSQL Persistence Engine for Connectt
// Connected directly to high-performance local PostgreSQL instance on EC2 (Zero extra cloud cost)
import { Pool } from 'pg';

let pool = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL ||
      'postgresql://postgres:spacespostgrespassword2026@127.0.0.1:5432/spaces_navchetna';

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000
    });

    pool.on('error', (err) => {
      console.warn('[Postgres Pool Error]:', err.message);
    });
  }
  return pool;
}

/**
 * Upsert room in Postgres
 */
export async function pgUpsertRoom(roomId, title = 'Meeting Room', hostName = 'Host', metadata = {}) {
  try {
    const p = getPool();
    const query = `
      INSERT INTO connectt_rooms (room_id, title, host_name, metadata, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (room_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        metadata = connectt_rooms.metadata || EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await p.query(query, [roomId, title, hostName, JSON.stringify(metadata)]);
    return res.rows[0];
  } catch (err) {
    console.warn(`[pgUpsertRoom Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Record or update active participant presence
 */
export async function pgRecordPresence(roomId, sessionId, userName, isCameraOn = false, isMicOn = true, isSpeaking = false) {
  try {
    const p = getPool();
    // Ensure room exists first
    await pgUpsertRoom(roomId);

    const query = `
      INSERT INTO connectt_participants (room_id, session_id, user_name, is_camera_on, is_mic_on, is_speaking, last_seen_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (room_id, session_id)
      DO UPDATE SET
        user_name = EXCLUDED.user_name,
        is_camera_on = EXCLUDED.is_camera_on,
        is_mic_on = EXCLUDED.is_mic_on,
        is_speaking = EXCLUDED.is_speaking,
        last_seen_at = NOW()
      RETURNING *;
    `;
    const res = await p.query(query, [roomId, sessionId, userName, isCameraOn, isMicOn, isSpeaking]);
    return res.rows[0];
  } catch (err) {
    console.warn(`[pgRecordPresence Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Get active participants (active within last 35 seconds)
 */
export async function pgGetActiveParticipants(roomId) {
  try {
    const p = getPool();
    const query = `
      SELECT session_id as "id", session_id as "sessionId", user_name as "userName",
             is_camera_on as "isCameraOn", is_mic_on as "isMicOn", is_speaking as "isSpeaking",
             last_seen_at as "lastSeenAt"
      FROM connectt_participants
      WHERE room_id = $1 AND last_seen_at > NOW() - INTERVAL '35 seconds'
      ORDER BY joined_at ASC;
    `;
    const res = await p.query(query, [roomId]);
    return res.rows;
  } catch (err) {
    console.warn(`[pgGetActiveParticipants Warning]: ${err.message}`);
    return [];
  }
}

/**
 * Remove participant when leaving
 */
export async function pgRemovePresence(roomId, sessionId) {
  try {
    const p = getPool();
    await p.query('DELETE FROM connectt_participants WHERE room_id = $1 AND session_id = $2', [roomId, sessionId]);
    return true;
  } catch (err) {
    console.warn(`[pgRemovePresence Warning]: ${err.message}`);
    return false;
  }
}

/**
 * Save in-person / meeting notes
 */
export async function pgSaveNote(roomId, authorName, content) {
  try {
    const p = getPool();
    const query = `
      INSERT INTO connectt_notes (room_id, author_name, content, updated_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const res = await p.query(query, [roomId, authorName, content]);
    return res.rows[0];
  } catch (err) {
    console.warn(`[pgSaveNote Warning]: ${err.message}`);
    return null;
  }
}
