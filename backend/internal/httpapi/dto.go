package httpapi

import "calculator/backend/internal/calculator"

// CalculateRequest is the JSON body accepted by POST /api/v1/calculate.
type CalculateRequest struct {
	Operation calculator.Operation `json:"operation"`
	// Pointers distinguish a missing operand from an explicit 0.
	A *float64 `json:"a"`
	B *float64 `json:"b"`
}

// CalculateResponse is returned on success.
type CalculateResponse struct {
	Result float64 `json:"result"`
}

// ErrorResponse is returned for every failed request.
type ErrorResponse struct {
	Error string `json:"error"`
}
