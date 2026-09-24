package calculator

import (
	"errors"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name    string
		op      Operation
		a, b    float64
		want    float64
		wantErr error
	}{
		{name: "add", op: Add, a: 2, b: 3, want: 5},
		{name: "subtract", op: Subtract, a: 10, b: 4, want: 6},
		{name: "multiply", op: Multiply, a: 3, b: 4, want: 12},
		{name: "divide", op: Divide, a: 10, b: 4, want: 2.5},
		{name: "decimals", op: Add, a: 1.5, b: 2.25, want: 3.75},
		{name: "negatives", op: Multiply, a: -3, b: 4, want: -12},
		{name: "division by zero", op: Divide, a: 1, b: 0, wantErr: ErrDivisionByZero},
		{name: "unsupported operation", op: Operation("modulo"), a: 1, b: 2, wantErr: ErrUnsupportedOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.op, tt.a, tt.b)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("Calculate(%q, %v, %v) error = %v, want %v", tt.op, tt.a, tt.b, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("Calculate(%q, %v, %v) unexpected error: %v", tt.op, tt.a, tt.b, err)
			}
			if got != tt.want {
				t.Errorf("Calculate(%q, %v, %v) = %v, want %v", tt.op, tt.a, tt.b, got, tt.want)
			}
		})
	}
}
