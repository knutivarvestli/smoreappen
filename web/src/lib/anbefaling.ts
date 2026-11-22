// Picks the top wax tips across own experience and others' approved tips.
// Own experience counts most (SPEC_NEW.md, claude.md): solid and some
// experience always rank above others' tips; a single race («Ett renn»)
// ranks below others' tips with high confidence.
// Prototype logic; the real ranking (similarity, shrinkage) is backend work.
import type { Konfidens } from './domene'

export type Sikkerhet = 'hoy' | 'middels' | 'lav'

export const VEKT_EGEN: Record<Konfidens, number> = { solid: 3, noe: 2, ett: 1 }
export const VEKT_ANDRE: Record<Sikkerhet, number> = { hoy: 1.5, middels: 1, lav: 0.5 }

export type EgenKandidat = { id: string; konfidens: Konfidens; antall: number }
export type AndreKandidat = { id: string; sikkerhet: Sikkerhet; fra: number | null; til: number | null }

export type Anbefaling<E, A> =
  | { kilde: 'min'; vekt: number; data: E }
  | { kilde: 'andre'; vekt: number; data: A }

/** Distance from the temperature to the middle of a range; unknown range sorts last. */
function avstand(temp: number | null, fra: number | null, til: number | null): number {
  if (temp === null || fra === null || til === null) return Number.POSITIVE_INFINITY
  return Math.abs(temp - (fra + til) / 2)
}

export function toppAnbefalinger<E extends EgenKandidat, A extends AndreKandidat>(
  egne: E[],
  andre: A[],
  temp: number | null,
  antall = 3,
): Anbefaling<E, A>[] {
  const liste: Anbefaling<E, A>[] = [
    ...egne.map((data) => ({ kilde: 'min' as const, vekt: VEKT_EGEN[data.konfidens], data })),
    ...andre.map((data) => ({ kilde: 'andre' as const, vekt: VEKT_ANDRE[data.sikkerhet], data })),
  ]
  return liste
    .sort((a, b) => {
      if (b.vekt !== a.vekt) return b.vekt - a.vekt
      // Same weight: own experience first, then more races, then closest temperature.
      if (a.kilde !== b.kilde) return a.kilde === 'min' ? -1 : 1
      if (a.kilde === 'min' && b.kilde === 'min') return b.data.antall - a.data.antall
      if (a.kilde === 'andre' && b.kilde === 'andre') {
        return avstand(temp, a.data.fra, a.data.til) - avstand(temp, b.data.fra, b.data.til)
      }
      return 0
    })
    .slice(0, antall)
}
