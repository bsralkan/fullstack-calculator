package httpapi

import "net/http"

// NewRouter returns the HTTP handler with all API routes registered.
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/calculate", handleCalculate)
	return mux
}
