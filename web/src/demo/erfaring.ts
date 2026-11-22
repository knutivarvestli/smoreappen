// Example «Min erfaring» data shared by Søk and Spør until real races are
// ranked in the backend. All fluor-free; names marked «(eksempel)» are fictional.
// Classic has separate recipes for grip (feste) and glide (glid); skate is glide only.
import type { Disiplin, Feste, GlidMotFelt, Konfidens, Snoopprinnelse, Snotype } from '../lib/domene'

/** What a recipe or tip is for. Rill counts with glide. */
export type SmoreRolle = 'feste' | 'glid'

export type EksempelRenn = {
  id: string
  dato: string
  sted: string
  lufttemp: number
  snotype: Snotype
  opprinnelse: Snoopprinnelse
  /** Glide rating for glide recipes, grip rating for grip recipes. */
  glid?: GlidMotFelt
  feste?: Feste
}

export type Oppskrift = {
  id: string
  rolle: SmoreRolle
  oppskrift: string
  konfidens: Konfidens
  antall: number
  sist: string
  fra: number
  til: number
  /** Direct comparisons in races where two pairs were tested (glide). */
  direkte?: { seire: number; av: number }
  renn: EksempelRenn[]
}

const rg = (id: string, dato: string, sted: string, lufttemp: number, glid: GlidMotFelt, snotype: Snotype = 'finkornet', opprinnelse: Snoopprinnelse = 'kunstsno'): EksempelRenn =>
  ({ id, dato, sted, lufttemp, snotype, opprinnelse, glid })
const rf = (id: string, dato: string, sted: string, lufttemp: number, feste: Feste, snotype: Snotype = 'finkornet', opprinnelse: Snoopprinnelse = 'naturlig'): EksempelRenn =>
  ({ id, dato, sted, lufttemp, snotype, opprinnelse, feste })

export const OPPSKRIFTER: Record<Disiplin, Oppskrift[]> = {
  skoyting: [
    {
      id: 'e1', rolle: 'glid', oppskrift: 'Blå blokk + kaldpulver (eksempel)', konfidens: 'solid', antall: 6, sist: '14. feb.', fra: -10, til: -4,
      direkte: { seire: 4, av: 5 },
      renn: [
        rg('r1', '14. feb.', 'Sjusjøen', -7, 'raskere'),
        rg('r2', '2. feb.', 'Lillehammer', -8, 'raskere'),
        rg('r3', '25. jan.', 'Trollhaugen skistadion', -6, 'lik'),
        rg('r4', '11. jan.', 'Sjusjøen', -9, 'raskere'),
        rg('r5', '20. des.', 'Lillehammer', -5, 'lik', 'nysno'),
        rg('r6', '5. des.', 'Trollhaugen skistadion', -7, 'raskere'),
      ],
    },
    {
      id: 'e2', rolle: 'glid', oppskrift: 'Skigo FFC LDQ 157 3.0, to lag', konfidens: 'noe', antall: 3, sist: '2. feb.', fra: -9, til: -3,
      direkte: { seire: 1, av: 3 },
      renn: [
        rg('r7', '2. feb.', 'Lillehammer', -8, 'lik'),
        rg('r8', '18. jan.', 'Sjusjøen', -4, 'raskere', 'finkornet', 'naturlig'),
        rg('r9', '8. jan.', 'Trollhaugen skistadion', -6, 'langsommere'),
      ],
    },
    {
      id: 'e3', rolle: 'glid', oppskrift: 'Lilla blokk alene (eksempel)', konfidens: 'ett', antall: 1, sist: '18. jan.', fra: -8, til: -2,
      renn: [rg('r10', '18. jan.', 'Sjusjøen', -5, 'lik')],
    },
  ],
  klassisk: [
    // Grip
    {
      id: 'e4', rolle: 'feste', oppskrift: 'Swix VP50 Pro, tre tynne lag', konfidens: 'noe', antall: 4, sist: '9. feb.', fra: -6, til: 0,
      renn: [
        rf('r11', '9. feb.', 'Sjusjøen', -2, 'veldig_bra'),
        rf('r12', '27. jan.', 'Lillehammer', -3, 'veldig_bra'),
        rf('r13', '14. jan.', 'Sjusjøen', -5, 'ok', 'gammel_omdannet'),
        rf('r14', '30. des.', 'Trollhaugen skistadion', -1, 'slurer'),
      ],
    },
    {
      id: 'e5', rolle: 'feste', oppskrift: 'Bindevoks + blå festevoks (eksempel)', konfidens: 'noe', antall: 2, sist: '21. jan.', fra: -10, til: -4,
      renn: [rf('r15', '21. jan.', 'Sjusjøen', -8, 'ok', 'finkornet', 'kunstsno'), rf('r16', '7. jan.', 'Lillehammer', -6, 'veldig_bra', 'finkornet', 'kunstsno')],
    },
    {
      id: 'e6', rolle: 'feste', oppskrift: 'Klister universal (eksempel)', konfidens: 'ett', antall: 1, sist: '5. mars', fra: -3, til: 2,
      renn: [rf('r17', '5. mars', 'Sjusjøen', 1, 'ok', 'gammel_omdannet')],
    },
    // Glide (classic)
    {
      id: 'e7', rolle: 'glid', oppskrift: 'Blå blokk, to lag (eksempel)', konfidens: 'solid', antall: 5, sist: '9. feb.', fra: -10, til: -3,
      renn: [
        rg('r11', '9. feb.', 'Sjusjøen', -2, 'lik', 'finkornet', 'naturlig'),
        rg('r12', '27. jan.', 'Lillehammer', -3, 'raskere', 'finkornet', 'naturlig'),
        rg('r15', '21. jan.', 'Sjusjøen', -8, 'raskere'),
        rg('r13', '14. jan.', 'Sjusjøen', -5, 'lik', 'gammel_omdannet', 'naturlig'),
        rg('r16', '7. jan.', 'Lillehammer', -6, 'raskere'),
      ],
    },
    {
      id: 'e8', rolle: 'glid', oppskrift: 'Skigo FFC LDQ 157 3.0, ett lag', konfidens: 'noe', antall: 2, sist: '30. des.', fra: -8, til: 0,
      renn: [rg('r14', '30. des.', 'Trollhaugen skistadion', -1, 'lik', 'finkornet', 'naturlig'), rg('r18', '15. des.', 'Lillehammer', -4, 'langsommere')],
    },
    {
      id: 'e9', rolle: 'glid', oppskrift: 'Lilla blokk (eksempel)', konfidens: 'ett', antall: 1, sist: '5. mars', fra: -4, til: 1,
      renn: [rg('r17', '5. mars', 'Sjusjøen', 1, 'lik', 'gammel_omdannet', 'naturlig')],
    },
  ],
}

/** Example matching: within 3 °C of the recipe's range. The real ranking is backend work. */
export const innenfor = (t: number | null, fra: number | null, til: number | null) =>
  t !== null && fra !== null && til !== null && t >= fra - 3 && t <= til + 3

/** Roles a tip from others covers, from its layers. Without layers it counts for both. */
export function tipsRoller(lag: { rolle: 'rill' | 'glid' | 'feste' }[]): SmoreRolle[] {
  if (lag.length === 0) return ['feste', 'glid']
  const r = new Set<SmoreRolle>(lag.map((l) => (l.rolle === 'feste' ? 'feste' : 'glid')))
  return [...r]
}
