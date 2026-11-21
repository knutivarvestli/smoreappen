import { describe, expect, it } from 'vitest'
import { formatTemp, formatTempRange, parseTemp } from './format'

describe('formatTemp', () => {
  it('uses a real minus sign', () => {
    expect(formatTemp(-7)).toBe('−7 °C')
    expect(formatTemp(-7)).not.toContain('-')
  })
  it('shows plus for positive and nothing for zero', () => {
    expect(formatTemp(3)).toBe('+3 °C')
    expect(formatTemp(0)).toBe('0 °C')
  })
  it('uses a decimal comma', () => {
    expect(formatTemp(-2.5)).toBe('−2,5 °C')
  })
  it('never guesses a missing value', () => {
    expect(formatTemp(null)).toBe('Ikke oppgitt')
  })
})

describe('formatTempRange', () => {
  it('formats a range', () => {
    expect(formatTempRange(-8, -3)).toBe('−8 til −3 °C')
    expect(formatTempRange(0, 2)).toBe('0 til +2 °C')
  })
  it('handles missing ends', () => {
    expect(formatTempRange(null, null)).toBe('Ikke oppgitt')
    expect(formatTempRange(-20, null)).toBe('Fra −20 °C')
  })
})

describe('parseTemp', () => {
  it.each([
    ['-7', -7],
    ['−7', -7],
    ['–7,5', -7.5],
    ['+3', 3],
    ['0', 0],
    [' -12 °C ', -12],
  ])('parses %s', (input, want) => {
    expect(parseTemp(input)).toBe(want)
  })
  it.each(['', '-', 'kald', '7-'])('rejects %s', (input) => {
    expect(parseTemp(input)).toBeNull()
  })
})
