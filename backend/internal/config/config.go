// Package config loads server settings from the environment.
package config

import (
	"fmt"
	"os"
	"strconv"
)

const defaultPort = 8080

// Config holds the server settings.
type Config struct {
	Port int
}

// Load reads PORT from the environment, falling back to 8080 when it is unset.
func Load() (Config, error) {
	raw := os.Getenv("PORT")
	if raw == "" {
		return Config{Port: defaultPort}, nil
	}

	port, err := strconv.Atoi(raw)
	if err != nil || port < 1 || port > 65535 {
		return Config{}, fmt.Errorf("invalid PORT %q: must be a number between 1 and 65535", raw)
	}
	return Config{Port: port}, nil
}
