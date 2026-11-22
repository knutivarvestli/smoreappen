import { describe, expect, it } from 'vitest'
import { tolk, trengerOppklaring } from './tolk'

describe('tolk', () => {
  it('reads discipline, temperature and snow origin', () => {
    expect(tolk('Hva har fungert best på kunstsnø rundt −7 °C på skøyteski?')).toEqual({
      disiplin: 'skoyting', temp: -7, toleranse: 3, opprinnelse: 'kunstsno',
    })
  })
  it('understands «minus 10 grader» and classic', () => {
    const f = tolk('Beste feste klassisk minus 10 grader')
    expect(f.disiplin).toBe('klassisk')
    expect(f.temp).toBe(-10)
  })
})

describe('trengerOppklaring', () => {
  it('never interprets «kald» without a number silently', () => {
    const q = 'Hva funker når det er kaldt på skøyting?'
    const o = trengerOppklaring(q, tolk(q))
    expect(o?.sporsmal).toBe('Hva mener du med kald?')
    expect(o?.valg.length).toBeGreaterThanOrEqual(2)
    expect(o?.valg.length).toBeLessThanOrEqual(4)
  })
  it('asks for discipline when it is missing', () => {
    const q = 'Beste glid i dag'
    expect(trengerOppklaring(q, tolk(q))?.sporsmal).toBe('Gjelder det klassisk eller skøyting?')
  })
  it('asks nothing when the question is clear', () => {
    const q = 'Skøyting −7 °C kunstsnø'
    expect(trengerOppklaring(q, tolk(q))).toBeNull()
  })
})
