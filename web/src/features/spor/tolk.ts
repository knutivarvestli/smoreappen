// Prototype interpretation of a question into a filter. The real version uses
// the language model behind an interface and only returns a validated filter;
// numbers and ranking are always computed in code, never by the model.
import type { Disiplin, Snoopprinnelse } from '../../lib/domene'
import { parseTemp } from '../../lib/format'

export type Filter = {
  disiplin: Disiplin | null
  temp: number | null
  toleranse: number
  opprinnelse: Snoopprinnelse | null
}

export type Oppklaring = { sporsmal: string; valg: { label: string; patch: Partial<Filter> }[] }

export function tolk(sporsmal: string): Filter {
  const q = sporsmal.toLowerCase()
  const disiplin: Disiplin | null = /sk(ø|o)yt|skate/.test(q) ? 'skoyting' : /klassisk/.test(q) ? 'klassisk' : null

  let temp: number | null = null
  const m = q.match(/(minus|pluss|[−–+-])?\s*(\d+(?:[.,]\d+)?)\s*(°|grader|c\b)/)
  if (m) {
    const n = parseTemp(m[2])
    if (n !== null) temp = m[1] === 'minus' || m[1] === '−' || m[1] === '–' || m[1] === '-' ? -n : n
  }

  const opprinnelse: Snoopprinnelse | null = /kunstsn/.test(q) ? 'kunstsno' : /natursn|naturlig/.test(q) ? 'naturlig' : null
  return { disiplin, temp, toleranse: 3, opprinnelse }
}

/** «Kald» without a number is never interpreted silently. Missing discipline: ask. */
export function trengerOppklaring(sporsmal: string, f: Filter): Oppklaring | null {
  const q = sporsmal.toLowerCase()
  if (f.temp === null && /kald|kaldt/.test(q)) {
    return {
      sporsmal: 'Hva mener du med kald?',
      valg: [
        { label: 'Rundt −5 °C', patch: { temp: -5 } },
        { label: 'Rundt −10 °C', patch: { temp: -10 } },
        { label: 'Under −15 °C', patch: { temp: -18 } },
      ],
    }
  }
  if (f.disiplin === null) {
    return {
      sporsmal: 'Gjelder det klassisk eller skøyting?',
      valg: [
        { label: 'Klassisk', patch: { disiplin: 'klassisk' } },
        { label: 'Skøyting', patch: { disiplin: 'skoyting' } },
      ],
    }
  }
  return null
}
