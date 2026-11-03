package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// withCORS adds CORS headers to HTTP requests
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	mux := http.NewServeMux()

	// REST Endpoints
	mux.HandleFunc("/health", HealthHandler)
	mux.HandleFunc("/api/orchestrator/health", HealthHandler)
	mux.HandleFunc("/api/livekit/token", LiveKitTokenHandler)
	mux.HandleFunc("/api/orchestrator/room", RoomInfoHandler)

	// WebSocket Endpoint
	mux.HandleFunc("/ws", WebSocketHandler)
	mux.HandleFunc("/api/orchestrator/ws", WebSocketHandler)

	server := &http.Server{
		Addr:         fmt.Sprintf("0.0.0.0:%s", port),
		Handler:      withCORS(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("[Connectt Orchestrator] Starting on http://0.0.0.0:%s", port)
		log.Printf("[Connectt Orchestrator] LiveKit token issuer ready")
		log.Printf("[Connectt Orchestrator] WebSocket room hub ready at /ws")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-stop
	log.Println("[Connectt Orchestrator] Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	log.Println("[Connectt Orchestrator] Server exited cleanly")
}
