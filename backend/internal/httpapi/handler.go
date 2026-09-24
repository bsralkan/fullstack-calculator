package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"math"
	"net/http"

	"calculator/backend/internal/calculator"
)

// A valid request is three short fields; anything larger is rejected.
const maxBodyBytes = 1 << 10

func handleCalculate(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var req CalculateRequest
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request body")
		return
	}
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		writeError(w, http.StatusBadRequest, "request body must contain a single JSON object")
		return
	}
	if req.A == nil || req.B == nil {
		writeError(w, http.StatusBadRequest, "a and b are required")
		return
	}

	result, err := calculator.Calculate(req.Operation, *req.A, *req.B)
	switch {
	case errors.Is(err, calculator.ErrUnsupportedOperation), errors.Is(err, calculator.ErrDivisionByZero):
		writeError(w, http.StatusBadRequest, err.Error())
		return
	case err != nil:
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	// JSON cannot represent Inf or NaN.
	if math.IsInf(result, 0) || math.IsNaN(result) {
		writeError(w, http.StatusUnprocessableEntity, "result is out of range")
		return
	}

	writeJSON(w, http.StatusOK, CalculateResponse{Result: result})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{Error: message})
}
