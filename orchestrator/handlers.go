package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

var startTime = time.Now()

// JSONResponse sends standard JSON response
func JSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// HealthHandler returns service health and metrics
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	uptime := time.Since(startTime).Round(time.Second).String()
	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"status":    "healthy",
		"service":   "connectt-orchestrator",
		"version":   "1.0.0",
		"uptime":    uptime,
		"rooms":     globalHub.TotalRooms(),
		"clients":   globalHub.TotalClients(),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// LiveKitTokenHandler issues LiveKit access tokens
func LiveKitTokenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		JSONResponse(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	var room, identity, name string

	if r.Method == http.MethodGet {
		q := r.URL.Query()
		room = q.Get("room")
		identity = q.Get("identity")
		name = q.Get("name")
		if name == "" {
			name = identity
		}
	} else {
		var req struct {
			Room     string `json:"room"`
			Identity string `json:"identity"`
			Name     string `json:"name"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON body"})
			return
		}
		room = req.Room
		identity = req.Identity
		name = req.Name
		if name == "" {
			name = identity
		}
	}

	if room == "" || identity == "" {
		JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "room and identity parameters are required"})
		return
	}

	token, err := GenerateLiveKitToken(room, identity, name)
	if err != nil {
		JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	cfg := getLiveKitConfig()
	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"token":     token,
		"serverUrl": cfg.Host,
		"room":      room,
		"identity":  identity,
		"name":      name,
	})
}

// RoomInfoHandler returns room presence and metadata
func RoomInfoHandler(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("roomId")
	if roomID == "" {
		JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "roomId parameter required"})
		return
	}

	room, exists := globalHub.GetRoom(roomID)
	if !exists {
		JSONResponse(w, http.StatusOK, map[string]interface{}{
			"roomId":       roomID,
			"exists":       false,
			"participants": []interface{}{},
			"presentation": nil,
		})
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"roomId":       room.ID,
		"exists":       true,
		"createdAt":    room.CreatedAt,
		"participants": room.GetParticipantList(),
		"presentation": room.Presentation,
		"metadata":     room.Metadata,
	})
}

// WebSocketHandler upgrades HTTP request to full-duplex WebSocket
func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	roomID := q.Get("roomId")
	userID := q.Get("userId")
	userName := q.Get("userName")

	if roomID == "" || userID == "" {
		http.Error(w, "roomId and userId are required query parameters", http.StatusBadRequest)
		return
	}

	if userName == "" {
		userName = userID
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[Orchestrator WS Error]: %v", err)
		return
	}

	room := globalHub.GetOrCreateRoom(roomID)

	client := &Client{
		ID:         userID,
		UserID:     userID,
		UserName:   userName,
		RoomID:     roomID,
		IsCameraOn: false,
		IsMicOn:    true,
		JoinedAt:   time.Now(),
		LastSeen:   time.Now(),
		conn:       conn,
		send:       make(chan []byte, 256),
		room:       room,
	}

	room.register <- client

	go client.writePump()
	go client.readPump()
}
