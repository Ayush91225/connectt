package main

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// LiveKitConfig stores credentials for LiveKit SFU instances
type LiveKitConfig struct {
	Host      string
	APIKey    string
	APISecret string
}

func getLiveKitConfig() LiveKitConfig {
	host := os.Getenv("LIVEKIT_URL")
	if host == "" {
		host = "wss://livekit.connectt.live"
	}
	apiKey := os.Getenv("LIVEKIT_API_KEY")
	if apiKey == "" {
		apiKey = "devkey"
	}
	apiSecret := os.Getenv("LIVEKIT_API_SECRET")
	if apiSecret == "" {
		apiSecret = "secret99_connectt_livekit_secure_token"
	}

	return LiveKitConfig{
		Host:      host,
		APIKey:    apiKey,
		APISecret: apiSecret,
	}
}

// VideoGrants represents the LiveKit video claim permissions
type VideoGrants struct {
	Room           string `json:"room,omitempty"`
	RoomJoin       bool   `json:"roomJoin,omitempty"`
	CanPublish     bool   `json:"canPublish,omitempty"`
	CanSubscribe   bool   `json:"canSubscribe,omitempty"`
	CanPublishData bool   `json:"canPublishData,omitempty"`
	Hidden         bool   `json:"hidden,omitempty"`
	Recorder       bool   `json:"recorder,omitempty"`
}

// LiveKitClaims represents standard LiveKit JWT claims
type LiveKitClaims struct {
	jwt.RegisteredClaims
	Video VideoGrants `json:"video"`
	Name  string      `json:"name,omitempty"`
}

// GenerateLiveKitToken produces a signed LiveKit JWT access token
func GenerateLiveKitToken(room, identity, name string) (string, error) {
	if room == "" || identity == "" {
		return "", errors.New("room and identity are required")
	}

	cfg := getLiveKitConfig()
	now := time.Now()

	claims := LiveKitClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    cfg.APIKey,
			Subject:   identity,
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
			NotBefore: jwt.NewNumericDate(now.Add(-1 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
		Video: VideoGrants{
			Room:           room,
			RoomJoin:       true,
			CanPublish:     true,
			CanSubscribe:   true,
			CanPublishData: true,
		},
		Name: name,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token.Header["kid"] = cfg.APIKey

	signedToken, err := token.SignedString([]byte(cfg.APISecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign livekit token: %w", err)
	}

	return signedToken, nil
}
