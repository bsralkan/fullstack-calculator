import type { Operation } from '../../types/calculator'
import type { Digit } from './useCalculator'

const OPERATION_KEYS: Record<Operation, { symbol: string; label: string }> = {
  add: { symbol: '+', label: 'Add' },
  subtract: { symbol: '−', label: 'Subtract' },
  multiply: { symbol: '×', label: 'Multiply' },
  divide: { symbol: '÷', label: 'Divide' },
}

interface KeypadProps {
  activeOperation: Operation | null
  busy: boolean
  onDigit: (digit: Digit) => void
  onDecimal: () => void
  onOperation: (operation: Operation) => void
  onEquals: () => void
  onClear: () => void
}

export function Keypad({
  activeOperation,
  busy,
  onDigit,
  onDecimal,
  onOperation,
  onEquals,
  onClear,
}: KeypadProps) {
  const digitKey = (digit: Digit, extraClass = '') => (
    <button type="button" className={`key key--digit ${extraClass}`} onClick={() => onDigit(digit)}>
      {digit}
    </button>
  )

  const operationKey = (operation: Operation) => (
    <button
      type="button"
      className="key key--operation"
      aria-label={OPERATION_KEYS[operation].label}
      aria-pressed={activeOperation === operation}
      onClick={() => onOperation(operation)}
    >
      {OPERATION_KEYS[operation].symbol}
    </button>
  )

  return (
    <div className="keypad" role="group" aria-label="Keypad" aria-busy={busy}>
      <button type="button" className="key key--clear" aria-label="Clear" onClick={onClear}>
        AC
      </button>
      {operationKey('divide')}

      {digitKey('7')}
      {digitKey('8')}
      {digitKey('9')}
      {operationKey('multiply')}

      {digitKey('4')}
      {digitKey('5')}
      {digitKey('6')}
      {operationKey('subtract')}

      {digitKey('1')}
      {digitKey('2')}
      {digitKey('3')}
      {operationKey('add')}

      {digitKey('0', 'key--wide')}
      <button type="button" className="key key--digit" aria-label="Decimal point" onClick={onDecimal}>
        .
      </button>
      <button type="button" className="key key--equals" aria-label="Equals" onClick={onEquals}>
        =
      </button>
    </div>
  )
}
