package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all cross-origins for seamless web & mobile integration
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client represents a connected user in a room
type Client struct {
	ID         string    `json:"id"`
	UserID     string    `json:"userId"`
	UserName   string    `json:"userName"`
	RoomID     string    `json:"roomId"`
	IsCameraOn bool      `json:"isCameraOn"`
	IsMicOn    bool      `json:"isMicOn"`
	IsSpeaking bool      `json:"isSpeaking"`
	JoinedAt   time.Time `json:"joinedAt"`
	LastSeen   time.Time `json:"lastSeen"`

	conn *websocket.Conn
	send chan []byte
	room *Room
}

// Room represents an active meeting session
type Room struct {
	ID           string                 `json:"id"`
	CreatedAt    time.Time              `json:"createdAt"`
	Clients      map[string]*Client     `json:"clients"`
	Presentation map[string]interface{} `json:"presentation,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`

	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mutex      sync.RWMutex
}

// Hub manages all rooms across the orchestrator
type Hub struct {
	rooms map[string]*Room
	mutex sync.RWMutex
}

var globalHub = &Hub{
	rooms: make(map[string]*Room),
}

func (h *Hub) GetOrCreateRoom(roomID string) *Room {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	room, exists := h.rooms[roomID]
	if !exists {
		room = &Room{
			ID:           roomID,
			CreatedAt:    time.Now(),
			Clients:      make(map[string]*Client),
			Presentation: nil,
			Metadata:     make(map[string]interface{}),
			register:     make(chan *Client),
			unregister:   make(chan *Client),
			broadcast:    make(chan []byte, 256),
		}
		h.rooms[roomID] = room
		go room.run()
		log.Printf("[Orchestrator] Room created: %s", roomID)
	}
	return room
}

func (h *Hub) GetRoom(roomID string) (*Room, bool) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	room, exists := h.rooms[roomID]
	return room, exists
}

func (h *Hub) TotalRooms() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.rooms)
}

func (h *Hub) TotalClients() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	total := 0
	for _, room := range h.rooms {
		room.mutex.RLock()
		total += len(room.Clients)
		room.mutex.RUnlock()
	}
	return total
}

func (r *Room) run() {
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-r.register:
			r.mutex.Lock()
			r.Clients[client.ID] = client
			r.mutex.Unlock()

			// Send current room roster to joining client
			roster := r.GetParticipantList()
			rosterMsg, _ := json.Marshal(map[string]interface{}{
				"type":         "ROSTER",
				"roomId":       r.ID,
				"participants": roster,
				"presentation": r.Presentation,
			})
			select {
			case client.send <- rosterMsg:
			default:
			}

			// Broadcast join event to everyone else
			joinNotice, _ := json.Marshal(map[string]interface{}{
				"type":       "PARTICIPANT_JOINED",
				"roomId":     r.ID,
				"id":         client.ID,
				"userId":     client.UserID,
				"userName":   client.UserName,
				"isCameraOn": client.IsCameraOn,
				"isMicOn":    client.IsMicOn,
			})
			r.broadcastToOthers(client.ID, joinNotice)

		case client := <-r.unregister:
			r.mutex.Lock()
			if _, exists := r.Clients[client.ID]; exists {
				delete(r.Clients, client.ID)
				close(client.send)

				// Clear presentation if leaving user was presenter
				if r.Presentation != nil {
					if presenter, ok := r.Presentation["presenter"].(string); ok && presenter == client.UserName {
						r.Presentation = nil
					}
				}
			}
			clientCount := len(r.Clients)
			r.mutex.Unlock()

			leaveNotice, _ := json.Marshal(map[string]interface{}{
				"type":     "PARTICIPANT_LEFT",
				"roomId":   r.ID,
				"id":       client.ID,
				"userId":   client.UserID,
				"userName": client.UserName,
			})
			r.broadcastToOthers(client.ID, leaveNotice)

			if clientCount == 0 {
				log.Printf("[Orchestrator] Room %s is now empty", r.ID)
			}

		case message := <-r.broadcast:
			r.mutex.RLock()
			for _, client := range r.Clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(r.Clients, client.ID)
				}
			}
			r.mutex.RUnlock()

		case <-ticker.C:
			// Cleanup stale clients (inactive > 45s)
			now := time.Now()
			r.mutex.Lock()
			for id, c := range r.Clients {
				if now.Sub(c.LastSeen) > 45*time.Second {
					log.Printf("[Orchestrator] Evicting stale client %s (%s)", c.UserName, id)
					delete(r.Clients, id)
					close(c.send)
				}
			}
			r.mutex.Unlock()
		}
	}
}

func (r *Room) broadcastToOthers(senderID string, message []byte) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	for id, client := range r.Clients {
		if id == senderID {
			continue
		}
		select {
		case client.send <- message:
		default:
		}
	}
}

func (r *Room) GetParticipantList() []map[string]interface{} {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	list := make([]map[string]interface{}, 0, len(r.Clients))
	for _, c := range r.Clients {
		list = append(list, map[string]interface{}{
			"id":         c.ID,
			"userId":     c.UserID,
			"userName":   c.UserName,
			"isCameraOn": c.IsCameraOn,
			"isMicOn":    c.IsMicOn,
			"isSpeaking": c.IsSpeaking,
			"joinedAt":   c.JoinedAt,
		})
	}
	return list
}

func (c *Client) readPump() {
	defer func() {
		c.room.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512 * 1024) // 512 KB limit for whiteboard/signals
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		c.LastSeen = time.Now()
		return nil
	})

	for {
		_, rawMsg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		c.LastSeen = time.Now()

		var msg map[string]interface{}
		if err := json.Unmarshal(rawMsg, &msg); err != nil {
			continue
		}

		msgType, _ := msg["type"].(string)

		switch msgType {
		case "HEARTBEAT":
			if cam, ok := msg["isCameraOn"].(bool); ok {
				c.IsCameraOn = cam
			}
			if mic, ok := msg["isMicOn"].(bool); ok {
				c.IsMicOn = mic
			}
			if spk, ok := msg["isSpeaking"].(bool); ok {
				c.IsSpeaking = spk
			}

		case "PARTICIPANT_UPDATE":
			if cam, ok := msg["isCameraOn"].(bool); ok {
				c.IsCameraOn = cam
			}
			if mic, ok := msg["isMicOn"].(bool); ok {
				c.IsMicOn = mic
			}
			if spk, ok := msg["isSpeaking"].(bool); ok {
				c.IsSpeaking = spk
			}
			c.room.broadcastToOthers(c.ID, rawMsg)

		case "PRESENTATION_START":
			c.room.mutex.Lock()
			c.room.Presentation = msg
			c.room.mutex.Unlock()
			c.room.broadcastToOthers(c.ID, rawMsg)

		case "PRESENTATION_STOP":
			c.room.mutex.Lock()
			c.room.Presentation = nil
			c.room.mutex.Unlock()
			c.room.broadcastToOthers(c.ID, rawMsg)

		case "CHAT", "TOOL_SYNC", "WHITEBOARD_DRAW", "SIGNAL":
			// Forward real-time message instantly to all peers
			c.room.broadcastToOthers(c.ID, rawMsg)
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(20 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
