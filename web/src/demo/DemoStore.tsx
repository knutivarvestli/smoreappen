// In-memory example data for the clickable prototype. Nothing is persisted;
// replaced by the API in later steps. Product names marked «(eksempel)» are
// illustrations; Skigo and Swix match the fasit in docs/INNHENTING.md.
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Disiplin, Kategori, Snotype } from '../lib/domene'

export type SnoRad = { id: string; tekst: string; tags: Snotype[]; fra: number; til: number }

export type Produkt = {
  id: string
  merke: string
  modell: string
  kategori: Kategori
  tempFra: number | null
  tempTil: number | null
  farge: string | null
  snotype: string | null
  luftfuktighet: string | null
  smorejernC: number | null
  snoRader: SnoRad[]
  kildeDomene: string | null
}

export type SkiStatus = 'aktiv' | 'hvilende' | 'solgt'

export type Ski = {
  id: string
  navn: string
  disiplin: Disiplin
  merke: string
  modell: string
  lengdeCm: number | null
  arsmodell: number | null
  vektFraKg: number | null
  vektTilKg: number | null
  slip: string
  beskrivelse: string
  status: SkiStatus
}

const ski = (id: string, navn: string, disiplin: Disiplin, lengdeCm: number, vekt: [number, number], arsmodell: number, status: SkiStatus = 'aktiv'): Ski => ({
  id, navn, disiplin, merke: '', modell: '', lengdeCm, arsmodell, vektFraKg: vekt[0], vektTilKg: vekt[1], slip: '', beskrivelse: '', status,
})

const produkt = (p: Partial<Produkt> & Pick<Produkt, 'id' | 'merke' | 'modell' | 'kategori'>): Produkt => ({
  tempFra: null, tempTil: null, farge: null, snotype: null, luftfuktighet: null, smorejernC: null, snoRader: [], kildeDomene: null, ...p,
})

const START_SKI: Ski[] = [
  ski('s1', 'Skøyteski #1 (renn)', 'skoyting', 191, [75, 85], 2025),
  ski('s2', 'Skøyteski #2 (trening)', 'skoyting', 191, [75, 85], 2023),
  ski('s3', 'Klassiske #1', 'klassisk', 201, [70, 80], 2024),
  ski('s4', 'Klassiske #2 (reserve)', 'klassisk', 201, [70, 80], 2021, 'solgt'),
]

export const SKIGO = produkt({
  id: 'p1', merke: 'Skigo', modell: 'FFC LDQ 157 3.0', kategori: 'glider_fast',
  tempFra: -20, tempTil: 2, snotype: 'Alle', luftfuktighet: '<65 %', smorejernC: 145, kildeDomene: 'bull-ski-kajakk.no',
})

export const VP50 = produkt({
  id: 'p2', merke: 'Swix', modell: 'VP50 Pro', kategori: 'festevoks', tempFra: -3, tempTil: 0, farge: 'Lys fiolett',
  kildeDomene: 'sportenbeitostolen.no',
  snoRader: [
    { id: 'r1', tekst: 'Ny og nyfallen finkornet', tags: ['nysno', 'finkornet'], fra: -3, til: 0 },
    { id: 'r2', tekst: 'Gammel eller delvis omdannet', tags: ['gammel_omdannet'], fra: -6, til: -1 },
  ],
})

// VP50 Pro is not in the start list: «Hent produkt» adds it (example extraction).
const START_PRODUKTER: Produkt[] = [
  SKIGO,
  produkt({ id: 'p3', merke: 'Blå blokk', modell: '(eksempel)', kategori: 'glider_fast', tempFra: -10, tempTil: -4, smorejernC: 140 }),
  produkt({ id: 'p4', merke: 'Lilla blokk', modell: '(eksempel)', kategori: 'glider_fast', tempFra: -4, tempTil: 0, smorejernC: 130 }),
  produkt({ id: 'p5', merke: 'Kaldpulver', modell: '(eksempel)', kategori: 'pulver', tempFra: -15, tempTil: -5 }),
  produkt({ id: 'p6', merke: 'Bindevoks', modell: '(eksempel)', kategori: 'bindevoks', farge: 'Grønn' }),
  produkt({ id: 'p7', merke: 'Klister universal', modell: '(eksempel)', kategori: 'klister', farge: 'Fiolett' }),
  produkt({ id: 'p8', merke: 'Rillverktøy lineær', modell: '(eksempel)', kategori: 'verktoy' }),
]

// ---------- Andres erfaringer ----------

export type Sikkerhet = 'hoy' | 'middels' | 'lav'
export type TipsLag = { rolle: 'rill' | 'glid' | 'feste'; produkt: string; metode?: string }

export type Kilde = { id: string; domene: string; url: string; sistOppdatert: string }

export type EksternTips = {
  id: string
  kildeId: string
  disiplin: Disiplin
  fra: number | null
  til: number | null
  snotyper: Snotype[]
  lag: TipsLag[]
  sammendrag: string
  sikkerhet: Sikkerhet
  mangler: string[]
  status: 'utkast' | 'godkjent' | 'forkastet'
  hentet: string
}

const START_KILDER: Kilde[] = [
  { id: 'k1', domene: 'eksempel-smoring.no', url: 'https://eksempel-smoring.no/smoretips', sistOppdatert: '3. jan. 2026' },
  { id: 'k2', domene: 'skitips.example', url: 'https://skitips.example/klassisk', sistOppdatert: '20. des. 2025' },
  { id: 'k3', domene: 'langrenn-blogg.example', url: 'https://langrenn-blogg.example/innlegg/smoring', sistOppdatert: '15. jan. 2026' },
]

const godkjent = (t: Omit<EksternTips, 'status' | 'mangler' | 'lag'> & Partial<EksternTips>): EksternTips => ({
  status: 'godkjent', mangler: [], lag: [], ...t,
})

// Example tips (all fluor-free). Only approved tips are used in «Finn» and «Spør».
const START_TIPS: EksternTips[] = [
  godkjent({ id: 't1', kildeId: 'k1', disiplin: 'skoyting', fra: -8, til: -3, snotyper: ['nysno', 'finkornet'], sammendrag: 'Blokk i to lag, børst, pulver øverst.', sikkerhet: 'hoy', hentet: '3. jan. 2026' }),
  godkjent({ id: 't2', kildeId: 'k2', disiplin: 'skoyting', fra: -10, til: -4, snotyper: ['finkornet'], sammendrag: 'Hard kaldvoks, stryk tynt og børst grundig på kunstsnø.', sikkerhet: 'hoy', hentet: '12. des. 2025' }),
  godkjent({ id: 't3', kildeId: 'k3', disiplin: 'skoyting', fra: -6, til: -1, snotyper: ['finkornet'], sammendrag: 'Universalblokk og lett rill når snøen er finkornet.', sikkerhet: 'middels', hentet: '28. nov. 2025' }),
  godkjent({ id: 't4', kildeId: 'k2', disiplin: 'klassisk', fra: -6, til: -2, snotyper: ['finkornet'], sammendrag: 'Hardvoks i tre tynne lag, kork mellom hvert lag.', sikkerhet: 'hoy', hentet: '20. des. 2025' }),
  godkjent({ id: 't5', kildeId: 'k1', disiplin: 'klassisk', fra: -12, til: -5, snotyper: ['nysno'], sammendrag: 'Bindevoks under, kald festevoks i fire lag ved kunstsnø.', sikkerhet: 'middels', hentet: '3. jan. 2026' }),
  godkjent({ id: 't6', kildeId: 'k3', disiplin: 'klassisk', fra: -4, til: 1, snotyper: ['gammel_omdannet'], sammendrag: 'Klister på gammel snø, festevoks oppå når det er kaldt.', sikkerhet: 'middels', hentet: '15. jan. 2026' }),
]

/** Example extraction for a new link (step 7 replaces this with the real Extractor). */
export function eksempelUtkast(kildeId: string, hentet: string): EksternTips[] {
  return [
    {
      id: nyId(), kildeId, disiplin: 'skoyting', fra: -12, til: -6, snotyper: ['nysno', 'finkornet'],
      lag: [{ rolle: 'glid', produkt: 'Kald blokk', metode: 'Stryk på' }, { rolle: 'glid', produkt: 'Kaldpulver', metode: 'Pulver' }],
      sammendrag: 'Kald blokk som base, pulver øverst ved ny snø.', sikkerhet: 'hoy', mangler: [], status: 'utkast', hentet,
    },
    {
      id: nyId(), kildeId, disiplin: 'klassisk', fra: -3, til: 0, snotyper: ['finkornet'],
      lag: [{ rolle: 'feste', produkt: 'Swix VP50 Pro', metode: 'Kork inn' }],
      sammendrag: 'Festevoks i tre tynne lag rundt null grader.', sikkerhet: 'middels', mangler: ['Mangler snøtemperatur'], status: 'utkast', hentet,
    },
    {
      id: nyId(), kildeId, disiplin: 'skoyting', fra: 0, til: 2, snotyper: ['vat', 'veldig_vat'],
      lag: [{ rolle: 'glid', produkt: 'Flytende glider' }, { rolle: 'rill', produkt: 'Grov rill' }],
      sammendrag: 'Flytende glider og kraftig rill på våt snø.', sikkerhet: 'lav', mangler: ['Mangler snøtemperatur', 'Mangler produktnavn'], status: 'utkast', hentet,
    },
  ]
}

type Store = {
  ski: Ski[]
  produkter: Produkt[]
  kilder: Kilde[]
  tips: EksternTips[]
  lagreSki: (s: Ski) => void
  lagreProdukt: (p: Produkt) => void
  lagreKilde: (k: Kilde) => void
  lagreTips: (t: EksternTips[]) => void
}

const Ctx = createContext<Store | null>(null)

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [skiListe, setSki] = useState(START_SKI)
  const [produkter, setProdukter] = useState(START_PRODUKTER)
  const [kilder, setKilder] = useState(START_KILDER)
  const [tips, setTips] = useState(START_TIPS)
  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]
  return (
    <Ctx.Provider
      value={{
        ski: skiListe,
        produkter,
        kilder,
        tips,
        lagreSki: (s) => setSki((l) => upsert(l, s)),
        lagreProdukt: (p) => setProdukter((l) => upsert(l, p)),
        lagreKilde: (k) => setKilder((l) => upsert(l, k)),
        lagreTips: (nye) => setTips((l) => nye.reduce((acc, t) => upsert(acc, t), l)),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useDemo(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useDemo outside DemoStoreProvider')
  return s
}

export const nyId = () => Math.random().toString(36).slice(2, 10)
