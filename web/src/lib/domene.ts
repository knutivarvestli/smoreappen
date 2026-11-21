// Domain codes (as stored in the database) and their Norwegian labels.

export type Disiplin = 'klassisk' | 'skoyting'
export const DISIPLIN: Record<Disiplin, string> = {
  klassisk: 'Klassisk',
  skoyting: 'Skøyting',
}

export type Snotype =
  | 'nysno' | 'snofall' | 'finkornet' | 'grovkornet' | 'vat'
  | 'veldig_vat' | 'isete' | 'skitten' | 'rim' | 'gammel_omdannet'
export const SNOTYPE: Record<Snotype, string> = {
  nysno: 'Nysnø',
  snofall: 'Snøfall',
  finkornet: 'Finkornet',
  grovkornet: 'Grovkornet',
  vat: 'Våt',
  veldig_vat: 'Veldig våt (sørpe)',
  isete: 'Isete/hard',
  skitten: 'Skitten',
  rim: 'Rim',
  gammel_omdannet: 'Gammel/omdannet',
}

export type Snoopprinnelse = 'naturlig' | 'kunstsno' | 'blandet'
export const SNOOPPRINNELSE: Record<Snoopprinnelse, string> = {
  naturlig: 'Naturlig',
  kunstsno: 'Kunstsnø',
  blandet: 'Blandet',
}

export type Fuktighet = 'torr' | 'normal' | 'fuktig'
export const FUKTIGHET: Record<Fuktighet, string> = { torr: 'Tørr', normal: 'Normal', fuktig: 'Fuktig' }

export type Loypehardhet = 'myk' | 'middels' | 'hard' | 'isete'
export const LOYPEHARDHET: Record<Loypehardhet, string> = { myk: 'Myk', middels: 'Middels', hard: 'Hard', isete: 'Isete' }

export type GlidMotFelt = 'langsommere' | 'lik' | 'raskere'
export const GLID_MOT_FELT: Record<GlidMotFelt, string> = {
  langsommere: 'Langsommere',
  lik: 'Lik',
  raskere: 'Raskere',
}

export type Feste = 'slurer' | 'ok' | 'veldig_bra'
export const FESTE: Record<Feste, string> = { slurer: 'Slurer', ok: 'OK', veldig_bra: 'Veldig bra' }

export type VurderingSikkerhet = 'folelse' | 'testrunde' | 'resultat'
export const VURDERING_SIKKERHET: Record<VurderingSikkerhet, string> = {
  folelse: 'Følelse',
  testrunde: 'Testrunde',
  resultat: 'Resultat',
}

export type Renntype = 'renn' | 'trening'
export const RENNTYPE: Record<Renntype, string> = { renn: 'Renn', trening: 'Trening' }

export type Kategori =
  | 'glider_fast' | 'glider_flytende' | 'pulver' | 'festevoks'
  | 'klister' | 'bindevoks' | 'rens' | 'verktoy'
export const KATEGORI: Record<Kategori, string> = {
  glider_fast: 'Glider (fast)',
  glider_flytende: 'Glider (flytende)',
  pulver: 'Pulver',
  festevoks: 'Festevoks',
  klister: 'Klister',
  bindevoks: 'Bindevoks',
  rens: 'Rens',
  verktoy: 'Verktøy',
}
export const ER_FESTE: Kategori[] = ['festevoks', 'klister', 'bindevoks']
export const ER_GLIDER: Kategori[] = ['glider_fast', 'glider_flytende', 'pulver']

export type Rolle = 'rill' | 'glid' | 'feste'
/** Which product categories belong to each wax role (product picker). */
export const ROLLE_KATEGORIER: Record<Rolle, Kategori[]> = {
  rill: ['verktoy'],
  glid: ER_GLIDER,
  feste: ER_FESTE,
}

export type Metode = 'stryk_pa' | 'kork_inn' | 'gni' | 'borst' | 'pulver' | 'tynt_lag'
export const METODE: Record<Metode, string> = {
  stryk_pa: 'Stryk på',
  kork_inn: 'Kork inn',
  gni: 'Gni',
  borst: 'Børst',
  pulver: 'Pulver',
  tynt_lag: 'Tynt lag',
}

export const SKIMERKER = ['Fischer', 'Salomon', 'Atomic', 'Madshus', 'Rossignol'] as const

export type TipsStatus = 'utkast' | 'godkjent' | 'forkastet'
export type Konfidens = 'solid' | 'noe' | 'ett'

/** Turns a label record into options for SegmentedControl / PickRow. */
export function options<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }))
}
