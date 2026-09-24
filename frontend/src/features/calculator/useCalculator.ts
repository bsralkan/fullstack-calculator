import { useReducer } from 'react'
import { calculate } from '../../api/calculator'
import { ApiError } from '../../api/client'
import type { Operation } from '../../types/calculator'

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

interface CalculatorState {
  display: string
  operand: number | null
  operation: Operation | null
  // True after an operator or result, so the next digit starts a new number.
  startNewNumber: boolean
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'digit'; digit: Digit }
  | { type: 'decimal' }
  | { type: 'operation'; operation: Operation }
  | { type: 'clear' }
  | { type: 'calculateStart' }
  | { type: 'calculateSuccess'; result: number; nextOperation: Operation | null }
  | { type: 'calculateFailure'; error: string }

interface PendingCalculation {
  operation: Operation
  a: number
  b: number
}

const initialState: CalculatorState = {
  display: '0',
  operand: null,
  operation: null,
  startNewNumber: true,
  loading: false,
  error: null,
}

function reducer(state: CalculatorState, action: Action): CalculatorState {
  if (state.loading && action.type !== 'calculateSuccess' && action.type !== 'calculateFailure') {
    return state
  }

  switch (action.type) {
    case 'digit': {
      const display =
        state.startNewNumber || state.display === '0' ? action.digit : state.display + action.digit
      return { ...state, display, startNewNumber: false, error: null }
    }
    case 'decimal':
      if (state.startNewNumber) {
        return { ...state, display: '0.', startNewNumber: false, error: null }
      }
      if (state.display.includes('.')) {
        return state
      }
      return { ...state, display: state.display + '.', error: null }
    case 'operation':
      return {
        ...state,
        operand: state.operand ?? Number(state.display),
        operation: action.operation,
        startNewNumber: true,
        error: null,
      }
    case 'clear':
      return initialState
    case 'calculateStart':
      return { ...state, loading: true, error: null }
    case 'calculateSuccess':
      return {
        display: String(action.result),
        operand: action.nextOperation ? action.result : null,
        operation: action.nextOperation,
        startNewNumber: true,
        loading: false,
        error: null,
      }
    case 'calculateFailure':
      return { ...state, loading: false, error: action.error, startNewNumber: true }
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  function pendingCalculation(): PendingCalculation | null {
    const { operation, operand, display, startNewNumber, loading } = state
    if (loading || operation === null || operand === null || startNewNumber) {
      return null
    }
    return { operation, a: operand, b: Number(display) }
  }

  async function run({ operation, a, b }: PendingCalculation, nextOperation: Operation | null) {
    dispatch({ type: 'calculateStart' })
    try {
      const result = await calculate(operation, a, b)
      dispatch({ type: 'calculateSuccess', result, nextOperation })
    } catch (err) {
      const error = err instanceof ApiError ? err.message : 'Something went wrong'
      dispatch({ type: 'calculateFailure', error })
    }
  }

  async function selectOperation(operation: Operation) {
    const pending = pendingCalculation()
    if (pending) {
      await run(pending, operation)
    } else {
      dispatch({ type: 'operation', operation })
    }
  }

  async function equals() {
    const pending = pendingCalculation()
    if (pending) {
      await run(pending, null)
    }
  }

  return {
    display: state.display,
    operation: state.operation,
    loading: state.loading,
    error: state.error,
    inputDigit: (digit: Digit) => dispatch({ type: 'digit', digit }),
    inputDecimal: () => dispatch({ type: 'decimal' }),
    selectOperation,
    equals,
    clear: () => dispatch({ type: 'clear' }),
  }
}
