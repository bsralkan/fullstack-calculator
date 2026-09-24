// Package calculator implements the arithmetic operations supported by the API.
package calculator

import (
	"errors"
	"fmt"
)

// Operation identifies an arithmetic operation.
type Operation string

const (
	Add      Operation = "add"
	Subtract Operation = "subtract"
	Multiply Operation = "multiply"
	Divide   Operation = "divide"
)

var (
	ErrDivisionByZero       = errors.New("division by zero")
	ErrUnsupportedOperation = errors.New("unsupported operation")
)

// Calculate applies op to a and b.
func Calculate(op Operation, a, b float64) (float64, error) {
	switch op {
	case Add:
		return a + b, nil
	case Subtract:
		return a - b, nil
	case Multiply:
		return a * b, nil
	case Divide:
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		return a / b, nil
	default:
		return 0, fmt.Errorf("%w: %q", ErrUnsupportedOperation, op)
	}
}
