package config

import (
	"os"
	"testing"
)

func TestLoad(t *testing.T) {
	tests := []struct {
		name     string
		env      string
		unset    bool
		wantPort int
		wantErr  bool
	}{
		{name: "unset uses default", unset: true, wantPort: 8080},
		{name: "empty uses default", env: "", wantPort: 8080},
		{name: "custom port", env: "3000", wantPort: 3000},
		{name: "max port", env: "65535", wantPort: 65535},
		{name: "non-numeric", env: "abc", wantErr: true},
		{name: "zero", env: "0", wantErr: true},
		{name: "negative", env: "-1", wantErr: true},
		{name: "above range", env: "65536", wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setenv registers restoration of the original value, including after Unsetenv.
			t.Setenv("PORT", tt.env)
			if tt.unset {
				os.Unsetenv("PORT")
			}

			cfg, err := Load()

			if tt.wantErr {
				if err == nil {
					t.Fatalf("Load() with PORT=%q: expected error, got config %+v", tt.env, cfg)
				}
				return
			}
			if err != nil {
				t.Fatalf("Load() with PORT=%q: unexpected error: %v", tt.env, err)
			}
			if cfg.Port != tt.wantPort {
				t.Errorf("Load() with PORT=%q: Port = %d, want %d", tt.env, cfg.Port, tt.wantPort)
			}
		})
	}
}
