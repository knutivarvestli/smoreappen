// «Passer nå» logic, docs/SPEC_NEW.md 5.5. A suggestion only: the user always chooses.
import type { Snotype } from './domene'

export type Fit = 'ok' | 'snow' | 'no' | 'na'

export type FitProduct = {
  tempFra: number | null
  tempTil: number | null
  snoRader: { tags: Snotype[]; fra: number; til: number }[]
}

/**
 * ok   = temperature and snow type match («Passer nå»)
 * snow = temperature matches a row, but for another snow type («Annen snøtype»)
 * no   = outside the stated range («Utenfor område»)
 * na   = temperature not stated: no badge, never guess
 *
 * With no snow type chosen, a temperature match counts as ok.
 */
export function fit(p: FitProduct, temp: number | null, snotyper: Snotype[]): Fit {
  if (temp === null) return 'na'
  if (p.snoRader.length > 0) {
    const tempRows = p.snoRader.filter((r) => r.fra <= temp && temp <= r.til)
    if (tempRows.length === 0) return 'no'
    if (snotyper.length === 0) return 'ok'
    return tempRows.some((r) => r.tags.some((t) => snotyper.includes(t))) ? 'ok' : 'snow'
  }
  const { tempFra: lo, tempTil: hi } = p
  if (lo === null && hi === null) return 'na'
  if (lo !== null && temp < lo) return 'no'
  if (hi !== null && temp > hi) return 'no'
  return 'ok'
}

const ORDER: Record<Fit, number> = { ok: 0, snow: 1, na: 2, no: 3 }

/** Sorting: ok, snow, na, no. */
export function byFit(a: Fit, b: Fit): number {
  return ORDER[a] - ORDER[b]
}
