import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculate } from '../../api/calculator'
import { ApiError } from '../../api/client'
import { useCalculator, type Digit } from './useCalculator'

vi.mock('../../api/calculator', () => ({ calculate: vi.fn() }))
const calculateMock = vi.mocked(calculate)

type Calculator = { current: ReturnType<typeof useCalculator> }

function enter(calc: Calculator, keys: string) {
  for (const key of keys) {
    act(() => {
      if (key === '.') calc.current.inputDecimal()
      else calc.current.inputDigit(key as Digit)
    })
  }
}

function setup() {
  return renderHook(() => useCalculator()).result
}

beforeEach(() => {
  calculateMock.mockReset()
})

describe('useCalculator', () => {
  it('builds numbers from digits and a single decimal point', () => {
    const calc = setup()
    expect(calc.current.display).toBe('0')

    enter(calc, '012.5.')
    expect(calc.current.display).toBe('12.5')

    act(() => calc.current.clear())
    enter(calc, '.5')
    expect(calc.current.display).toBe('0.5')
  })

  it('sends the operation to the API on equals and shows the result', async () => {
    calculateMock.mockResolvedValue(15)
    const calc = setup()

    enter(calc, '12')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    await act(() => calc.current.equals())

    expect(calculateMock).toHaveBeenCalledWith('add', 12, 3)
    expect(calc.current.display).toBe('15')
    expect(calc.current.operation).toBeNull()
  })

  it('shows loading while the request is pending and ignores input', async () => {
    let resolve!: (value: number) => void
    calculateMock.mockReturnValue(new Promise((r) => (resolve = r)))
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    let pending!: Promise<void>
    act(() => {
      pending = calc.current.equals()
    })

    expect(calc.current.loading).toBe(true)
    enter(calc, '9')
    expect(calc.current.display).toBe('3')

    await act(async () => {
      resolve(5)
      await pending
    })
    expect(calc.current.loading).toBe(false)
    expect(calc.current.display).toBe('5')
  })

  it('continues from the previous result', async () => {
    calculateMock.mockResolvedValueOnce(5).mockResolvedValueOnce(20)
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    await act(() => calc.current.equals())
    await act(() => calc.current.selectOperation('multiply'))
    enter(calc, '4')
    await act(() => calc.current.equals())

    expect(calculateMock).toHaveBeenLastCalledWith('multiply', 5, 4)
    expect(calc.current.display).toBe('20')
  })

  it('starts a new number when typing after a result', async () => {
    calculateMock.mockResolvedValue(5)
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    await act(() => calc.current.equals())
    enter(calc, '7')

    expect(calc.current.display).toBe('7')
  })

  it('calculates the pending operation when chaining operators', async () => {
    calculateMock.mockResolvedValueOnce(5).mockResolvedValueOnce(20)
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    await act(() => calc.current.selectOperation('multiply'))

    expect(calculateMock).toHaveBeenCalledWith('add', 2, 3)
    expect(calc.current.display).toBe('5')
    expect(calc.current.operation).toBe('multiply')

    enter(calc, '4')
    await act(() => calc.current.equals())
    expect(calculateMock).toHaveBeenLastCalledWith('multiply', 5, 4)
    expect(calc.current.display).toBe('20')
  })

  it('replaces the operation when an operator is pressed twice', async () => {
    calculateMock.mockResolvedValue(6)
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    await act(() => calc.current.selectOperation('multiply'))
    enter(calc, '3')
    await act(() => calc.current.equals())

    expect(calculateMock).toHaveBeenCalledTimes(1)
    expect(calculateMock).toHaveBeenCalledWith('multiply', 2, 3)
  })

  it('shows API errors and lets the user correct the input', async () => {
    calculateMock
      .mockRejectedValueOnce(new ApiError('division by zero', 400))
      .mockResolvedValueOnce(5)
    const calc = setup()

    enter(calc, '10')
    await act(() => calc.current.selectOperation('divide'))
    enter(calc, '0')
    await act(() => calc.current.equals())

    expect(calc.current.error).toBe('division by zero')
    expect(calc.current.loading).toBe(false)

    enter(calc, '2')
    expect(calc.current.error).toBeNull()
    expect(calc.current.display).toBe('2')

    await act(() => calc.current.equals())
    expect(calculateMock).toHaveBeenLastCalledWith('divide', 10, 2)
    expect(calc.current.display).toBe('5')
  })

  it('shows a generic message for unexpected errors', async () => {
    calculateMock.mockRejectedValue(new Error('boom'))
    const calc = setup()

    enter(calc, '1')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '2')
    await act(() => calc.current.equals())

    expect(calc.current.error).toBe('Something went wrong')
  })

  it('clears the display and pending operation', async () => {
    const calc = setup()

    enter(calc, '2')
    await act(() => calc.current.selectOperation('add'))
    enter(calc, '3')
    act(() => calc.current.clear())

    expect(calc.current.display).toBe('0')
    expect(calc.current.operation).toBeNull()

    await act(() => calc.current.equals())
    expect(calculateMock).not.toHaveBeenCalled()
  })
})
