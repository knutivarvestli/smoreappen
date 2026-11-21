import { describe, expect, it } from 'vitest'
import { byFit, fit, type Fit, type FitProduct } from './fit'

// Test cases from docs/INNHENTING.md «Passer-logikk, testtilfeller».
const vp50: FitProduct = {
  tempFra: -3,
  tempTil: 0,
  snoRader: [
    { tags: ['nysno', 'finkornet'], fra: -3, til: 0 },
    { tags: ['gammel_omdannet'], fra: -6, til: -1 },
  ],
}
const skigo: FitProduct = { tempFra: -20, tempTil: 2, snoRader: [] }
const bindevoks: FitProduct = { tempFra: null, tempTil: null, snoRader: [] }

describe('fit', () => {
  it('VP50 Pro, −2 °C, finkornet → ok', () => expect(fit(vp50, -2, ['finkornet'])).toBe('ok'))
  it('VP50 Pro, −5 °C, finkornet → snow', () => expect(fit(vp50, -5, ['finkornet'])).toBe('snow'))
  it('VP50 Pro, −5 °C, gammel/omdannet → ok', () => expect(fit(vp50, -5, ['gammel_omdannet'])).toBe('ok'))
  it('VP50 Pro, +3 °C → no', () => expect(fit(vp50, 3, ['finkornet'])).toBe('no'))
  it('Skigo, −7 °C, any snow type → ok', () => {
    expect(fit(skigo, -7, ['vat'])).toBe('ok')
    expect(fit(skigo, -7, [])).toBe('ok')
  })
  it('bindevoks without temperature → na', () => expect(fit(bindevoks, -5, ['finkornet'])).toBe('na'))
  it('missing race temperature → na', () => expect(fit(skigo, null, [])).toBe('na'))
  it('sorts ok, snow, na, no', () => {
    const list: Fit[] = ['no', 'na', 'ok', 'snow']
    expect([...list].sort(byFit)).toEqual(['ok', 'snow', 'na', 'no'])
  })
})
