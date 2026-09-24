import { useEffect } from 'react'
import './Calculator.css'
import { Display } from './Display'
import { Keypad } from './Keypad'
import { useCalculator, type Digit } from './useCalculator'

function isDigit(key: string): key is Digit {
  return key.length === 1 && key >= '0' && key <= '9'
}

export function Calculator() {
  const calc = useCalculator()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Leave browser shortcuts such as Ctrl+- (zoom) alone.
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const { key } = event
      if (isDigit(key)) calc.inputDigit(key)
      else if (key === '.') calc.inputDecimal()
      else if (key === '+') void calc.selectOperation('add')
      else if (key === '-') void calc.selectOperation('subtract')
      else if (key === '*') void calc.selectOperation('multiply')
      else if (key === '/') void calc.selectOperation('divide')
      else if (key === 'Enter' || key === '=') void calc.equals()
      else if (key === 'Escape') calc.clear()
      else return

      // Also stops Enter from clicking the focused button, which would double the input.
      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [calc])

  return (
    <section className="calculator" aria-label="Calculator">
      <Display value={calc.display} loading={calc.loading} error={calc.error} />
      <Keypad
        activeOperation={calc.operation}
        busy={calc.loading}
        onDigit={calc.inputDigit}
        onDecimal={calc.inputDecimal}
        onOperation={calc.selectOperation}
        onEquals={calc.equals}
        onClear={calc.clear}
      />
    </section>
  )
}
