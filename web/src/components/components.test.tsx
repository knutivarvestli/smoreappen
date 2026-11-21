import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { ConfidenceBadge } from './Badges'
import { PickRow } from './PickRow'
import { TemperatureInput } from './TemperatureInput'

afterEach(cleanup)

function Temp({ start = -7 as number | null, optional = false }) {
  const [v, setV] = useState<number | null>(start)
  return (
    <>
      <TemperatureInput label="Lufttemperatur" value={v} onChange={setV} optional={optional} />
      <output data-testid="verdi">{v === null ? 'null' : String(v)}</output>
    </>
  )
}

describe('TemperatureInput', () => {
  it('shows a real minus sign', () => {
    render(<Temp />)
    expect(screen.getByLabelText('Lufttemperatur')).toHaveProperty('value', '−7')
  })

  it('steps with the − and + buttons', async () => {
    render(<Temp />)
    await userEvent.click(screen.getByRole('button', { name: /Øk lufttemperatur/ }))
    expect(screen.getByTestId('verdi').textContent).toBe('-6')
    await userEvent.click(screen.getByRole('button', { name: /Senk lufttemperatur/ }))
    await userEvent.click(screen.getByRole('button', { name: /Senk lufttemperatur/ }))
    expect(screen.getByTestId('verdi').textContent).toBe('-8')
  })

  it('accepts typed values with a hyphen and normalises them', async () => {
    render(<Temp />)
    const input = screen.getByLabelText('Lufttemperatur')
    await userEvent.clear(input)
    await userEvent.type(input, '-12{Enter}')
    expect(screen.getByTestId('verdi').textContent).toBe('-12')
    expect(input).toHaveProperty('value', '−12')
  })

  it('shows an error for text that is not a number', async () => {
    render(<Temp />)
    const input = screen.getByLabelText('Lufttemperatur')
    await userEvent.clear(input)
    await userEvent.type(input, 'kald{Enter}')
    expect(screen.getByRole('alert').textContent).toContain('Skriv temperaturen som et tall')
    expect(screen.getByTestId('verdi').textContent).toBe('-7')
  })

  it('lets an optional value stay «Ikke oppgitt»', () => {
    render(<Temp start={null} optional />)
    expect(screen.getByLabelText('Lufttemperatur').getAttribute('placeholder')).toBe('Ikke oppgitt')
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Ikke oppgitt')
  })
})

describe('PickRow', () => {
  const opts = [
    { value: 'naturlig', label: 'Naturlig' },
    { value: 'kunstsno', label: 'Kunstsnø' },
  ] as const

  function Single() {
    const [v, setV] = useState<'naturlig' | 'kunstsno' | null>('naturlig')
    return <PickRow label="Snøopprinnelse" options={[...opts]} value={v} onChange={setV} />
  }

  it('shows only the chosen row until opened, and closes after a single choice', async () => {
    render(<Single />)
    const row = screen.getByRole('button', { name: /Snøopprinnelse/ })
    expect(row.getAttribute('aria-expanded')).toBe('false')
    expect(row.textContent).toContain('Naturlig')
    expect(screen.queryByLabelText('Kunstsnø')).toBeNull()

    await userEvent.click(row)
    expect(row.getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(screen.getByLabelText('Kunstsnø'))
    expect(row.getAttribute('aria-expanded')).toBe('false')
    expect(row.textContent).toContain('Kunstsnø')
  })
})

describe('ConfidenceBadge', () => {
  it('always has text, not only colour', () => {
    render(<ConfidenceBadge level="ett" />)
    expect(screen.getByText('Ett renn')).toBeTruthy()
  })
})
