package httpapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantBody   string
	}{
		{
			name:       "add",
			body:       `{"operation":"add","a":2,"b":3}`,
			wantStatus: http.StatusOK,
			wantBody:   `{"result":5}`,
		},
		{
			name:       "decimals and negatives",
			body:       `{"operation":"subtract","a":-1.5,"b":2}`,
			wantStatus: http.StatusOK,
			wantBody:   `{"result":-3.5}`,
		},
		{
			name:       "divide",
			body:       `{"operation":"divide","a":10,"b":4}`,
			wantStatus: http.StatusOK,
			wantBody:   `{"result":2.5}`,
		},
		{
			name:       "malformed JSON",
			body:       `{"operation":"add",`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"invalid JSON request body"}`,
		},
		{
			name:       "trailing whitespace allowed",
			body:       "{\"operation\":\"add\",\"a\":2,\"b\":3}\n",
			wantStatus: http.StatusOK,
			wantBody:   `{"result":5}`,
		},
		{
			name:       "trailing JSON object",
			body:       `{"operation":"add","a":1,"b":2}{"operation":"add","a":3,"b":4}`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"request body must contain a single JSON object"}`,
		},
		{
			name:       "trailing data",
			body:       `{"operation":"add","a":1,"b":2} extra`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"request body must contain a single JSON object"}`,
		},
		{
			name:       "unknown field",
			body:       `{"operation":"add","a":1,"b":2,"c":3}`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"invalid JSON request body"}`,
		},
		{
			name:       "missing operand",
			body:       `{"operation":"add","a":1}`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"a and b are required"}`,
		},
		{
			name:       "unsupported operation",
			body:       `{"operation":"modulo","a":1,"b":2}`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"unsupported operation: \"modulo\""}`,
		},
		{
			name:       "division by zero",
			body:       `{"operation":"divide","a":1,"b":0}`,
			wantStatus: http.StatusBadRequest,
			wantBody:   `{"error":"division by zero"}`,
		},
		{
			name:       "result overflow",
			body:       `{"operation":"multiply","a":1e308,"b":10}`,
			wantStatus: http.StatusUnprocessableEntity,
			wantBody:   `{"error":"result is out of range"}`,
		},
	}

	router := NewRouter()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(tt.body))
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, want %q", ct, "application/json")
			}
			if got := strings.TrimSpace(rec.Body.String()); got != tt.wantBody {
				t.Errorf("body = %s, want %s", got, tt.wantBody)
			}
		})
	}
}
