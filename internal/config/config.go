// Package config reads runtime configuration from environment variables.
// Secrets are only ever read from the environment and never logged.
package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port               string
	DatabaseURL        string
	SessionSecret      string
	AdminEmail         string
	AppBaseURL         string
	EmailAPIKey        string
	EmailFrom          string
	AnthropicAPIKey    string
	LLMModel           string
	LLMDailyCallLimit  int
	UploadDir          string
	DevInsecureCookies bool // allow non-Secure cookies on http://localhost during development
}

// Load reads configuration from the environment. Only DATABASE_URL is
// required for every command; other values are validated where they are used.
func Load() (Config, error) {
	c := Config{
		Port:            getenv("PORT", "8080"),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		SessionSecret:   os.Getenv("SESSION_SECRET"),
		AdminEmail:      os.Getenv("ADMIN_EMAIL"),
		AppBaseURL:      os.Getenv("APP_BASE_URL"),
		EmailAPIKey:     os.Getenv("EMAIL_API_KEY"),
		EmailFrom:       os.Getenv("EMAIL_FROM"),
		AnthropicAPIKey: os.Getenv("ANTHROPIC_API_KEY"),
		LLMModel:        os.Getenv("LLM_MODEL"),
		UploadDir:       os.Getenv("UPLOAD_DIR"),
	}
	limit, err := strconv.Atoi(getenv("LLM_DAILY_CALL_LIMIT", "100"))
	if err != nil || limit < 0 {
		return c, fmt.Errorf("LLM_DAILY_CALL_LIMIT must be a non-negative integer")
	}
	c.LLMDailyCallLimit = limit
	c.DevInsecureCookies = os.Getenv("DEV_INSECURE_COOKIES") == "true"

	if c.DatabaseURL == "" {
		return c, fmt.Errorf("DATABASE_URL is not set")
	}
	return c, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
