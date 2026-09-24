import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculate } from '../../api/calculator'
import { ApiError } from '../../api/client'
import { Calculator } from './Calculator'

vi.mock('../../api/calculator', () => ({ calculate: vi.fn() }))
const calculateMock = vi.mocked(calculate)

function setup() {
  const user = userEvent.setup()
  const { container } = render(<Calculator />)
  const display = () => container.querySelector('output')?.textContent
  const press = async (...names: string[]) => {
    for (const name of names) {
      await user.click(screen.getByRole('button', { name }))
    }
  }
  return { user, display, press }
}

beforeEach(() => {
  calculateMock.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('Calculator', () => {
  it('calculates with the buttons and shows the API result', async () => {
    calculateMock.mockResolvedValue(15)
    const { display, press } = setup()

    await press('1', '2', 'Add')
    expect(screen.getByRole('button', { name: 'Add' }).getAttribute('aria-pressed')).toBe('true')

    await press('3', 'Equals')

    expect(calculateMock).toHaveBeenCalledWith('add', 12, 3)
    expect(await screen.findByText('15')).toBeTruthy()
    expect(display()).toBe('15')
  })

  it('shows the API error message', async () => {
    calculateMock.mockRejectedValue(new ApiError('division by zero', 400))
    const { press } = setup()

    await press('1', 'Divide', '0', 'Equals')

    expect(await screen.findByText('division by zero')).toBeTruthy()
  })

  it('clears the display and selected operation', async () => {
    const { display, press } = setup()

    await press('1', '2', 'Add', '3', 'Clear')

    expect(display()).toBe('0')
    expect(screen.getByRole('button', { name: 'Add' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('supports a calculation entered with the keyboard', async () => {
    calculateMock.mockResolvedValue(36)
    const { user, display } = setup()

    await user.keyboard('12*3{Enter}')

    expect(calculateMock).toHaveBeenCalledTimes(1)
    expect(calculateMock).toHaveBeenCalledWith('multiply', 12, 3)
    expect(await screen.findByText('36')).toBeTruthy()
    expect(display()).toBe('36')
  })
})
