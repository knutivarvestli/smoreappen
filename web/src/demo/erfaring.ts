// Example «Min erfaring» data shared by Finn and Spør until real races are
// ranked in the backend. All fluor-free; names marked «(eksempel)» are fictional.
import type { Disiplin, GlidMotFelt, Konfidens, Snoopprinnelse, Snotype } from '../lib/domene'

export type EksempelRenn = {
  id: string
  dato: string
  sted: string
  lufttemp: number
  snotype: Snotype
  opprinnelse: Snoopprinnelse
  glid: GlidMotFelt
}

export type Oppskrift = {
  id: string
  oppskrift: string
  konfidens: Konfidens
  antall: number
  sist: string
  fra: number
  til: number
  /** Direct comparisons in races where two pairs were tested. */
  direkte?: { seire: number; av: number }
  renn: EksempelRenn[]
}

const r = (id: string, dato: string, sted: string, lufttemp: number, glid: GlidMotFelt, snotype: Snotype = 'finkornet', opprinnelse: Snoopprinnelse = 'kunstsno'): EksempelRenn =>
  ({ id, dato, sted, lufttemp, snotype, opprinnelse, glid })

export const OPPSKRIFTER: Record<Disiplin, Oppskrift[]> = {
  skoyting: [
    {
      id: 'e1', oppskrift: 'Blå blokk + kaldpulver (eksempel)', konfidens: 'solid', antall: 6, sist: '14. feb.', fra: -10, til: -4,
      direkte: { seire: 4, av: 5 },
      renn: [
        r('r1', '14. feb.', 'Sjusjøen', -7, 'raskere'),
        r('r2', '2. feb.', 'Lillehammer', -8, 'raskere'),
        r('r3', '25. jan.', 'Trollhaugen skistadion', -6, 'lik'),
        r('r4', '11. jan.', 'Sjusjøen', -9, 'raskere'),
        r('r5', '20. des.', 'Lillehammer', -5, 'lik', 'nysno'),
        r('r6', '5. des.', 'Trollhaugen skistadion', -7, 'raskere'),
      ],
    },
    {
      id: 'e2', oppskrift: 'Skigo FFC LDQ 157 3.0, to lag', konfidens: 'noe', antall: 3, sist: '2. feb.', fra: -9, til: -3,
      direkte: { seire: 1, av: 3 },
      renn: [
        r('r7', '2. feb.', 'Lillehammer', -8, 'lik'),
        r('r8', '18. jan.', 'Sjusjøen', -4, 'raskere', 'finkornet', 'naturlig'),
        r('r9', '8. jan.', 'Trollhaugen skistadion', -6, 'langsommere'),
      ],
    },
    {
      id: 'e3', oppskrift: 'Lilla blokk alene (eksempel)', konfidens: 'ett', antall: 1, sist: '18. jan.', fra: -8, til: -2,
      renn: [r('r10', '18. jan.', 'Sjusjøen', -5, 'lik')],
    },
  ],
  klassisk: [
    {
      id: 'e4', oppskrift: 'Swix VP50 Pro, tre tynne lag', konfidens: 'noe', antall: 4, sist: '9. feb.', fra: -6, til: 0,
      renn: [
        r('r11', '9. feb.', 'Sjusjøen', -2, 'lik', 'finkornet', 'naturlig'),
        r('r12', '27. jan.', 'Lillehammer', -3, 'raskere', 'finkornet', 'naturlig'),
        r('r13', '14. jan.', 'Sjusjøen', -5, 'lik', 'gammel_omdannet', 'naturlig'),
        r('r14', '30. des.', 'Trollhaugen skistadion', -1, 'langsommere', 'finkornet', 'naturlig'),
      ],
    },
    {
      id: 'e5', oppskrift: 'Bindevoks + blå festevoks (eksempel)', konfidens: 'noe', antall: 2, sist: '21. jan.', fra: -10, til: -4,
      renn: [r('r15', '21. jan.', 'Sjusjøen', -8, 'lik'), r('r16', '7. jan.', 'Lillehammer', -6, 'raskere')],
    },
    {
      id: 'e6', oppskrift: 'Klister universal (eksempel)', konfidens: 'ett', antall: 1, sist: '5. mars', fra: -3, til: 2,
      renn: [r('r17', '5. mars', 'Sjusjøen', 1, 'lik', 'gammel_omdannet', 'naturlig')],
    },
  ],
}

/** Example matching: within 3 °C of the recipe's range. The real ranking is backend work. */
export const innenfor = (t: number | null, fra: number | null, til: number | null) =>
  t !== null && fra !== null && til !== null && t >= fra - 3 && t <= til + 3
