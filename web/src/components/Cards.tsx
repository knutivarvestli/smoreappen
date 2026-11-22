import type { ReactNode } from 'react'
import { DISIPLIN, type Disiplin, type Konfidens } from '../lib/domene'
import { formatTemp, formatTempRange } from '../lib/format'
import { ConfidenceBadge, SourceBadge } from './Badges'
import { Icon } from './Icon'
import './Badges.css'
import './Cards.css'

type SkiStatus = 'aktiv' | 'hvilende' | 'solgt'

type SkiCardProps = {
  navn: string
  disiplin: Disiplin
  lengdeCm?: number | null
  vektFraKg?: number | null
  vektTilKg?: number | null
  arsmodell?: number | null
  merke?: string
  modell?: string
  status: SkiStatus
  onOpen?: () => void
}

/** Ski in a list: discipline stripe plus text, status badge when not active. */
export function SkiCard({ navn, disiplin, lengdeCm, vektFraKg, vektTilKg, arsmodell, merke, modell, status, onOpen }: SkiCardProps) {
  const vekt = vektFraKg != null && vektTilKg != null ? `${vektFraKg}–${vektTilKg} kg` : null
  const meta = [
    DISIPLIN[disiplin],
    [merke, modell].filter(Boolean).join(' ') || null,
    lengdeCm ? `${lengdeCm} cm` : null,
    vekt,
    arsmodell ? String(arsmodell) : null,
  ].filter(Boolean).join(' · ')

  return (
    <button type="button" className={`card ski-card ski-card--${disiplin} ${status === 'solgt' ? 'is-sold' : ''}`} onClick={onOpen}>
      <span className="ski-card__stripe" aria-hidden="true" />
      <span className="ski-card__body">
        <span className="ski-card__name">{navn}</span>
        <span className="ski-card__meta num">{meta}</span>
      </span>
      {status === 'solgt' && (
        <span className="chip-muted"><Icon name="lock" size={16} />Ikke tilgjengelig</span>
      )}
      {status === 'hvilende' && <span className="chip-muted">Hvilende</span>}
    </button>
  )
}

type ProductCardProps = {
  navn: string
  kategori: string
  tempFra: number | null
  tempTil: number | null
  farge?: string | null
  flag?: ReactNode
  onOpen?: () => void
}

/** Product in lists and in the picker. Missing temperature shows «Ikke oppgitt». */
export function ProductCard({ navn, kategori, tempFra, tempTil, farge, flag, onOpen }: ProductCardProps) {
  return (
    <button type="button" className="card product-card" onClick={onOpen}>
      <span className="product-card__body">
        <span className="product-card__name">{navn}</span>
        <span className="product-card__meta num">
          {kategori} · {formatTempRange(tempFra, tempTil)}{farge ? ` · ${farge}` : ''}
        </span>
      </span>
      {flag}
    </button>
  )
}

type TipCardProps = {
  domene: string
  tempFra: number | null
  tempTil: number | null
  tekst: string
  /** Blogs can be old: always show when the tip was fetched. */
  hentet: string
  onOpen?: () => void
}

/** Compact tip from others: source domain, temperature range, one line of text. */
export function TipCard({ domene, tempFra, tempTil, tekst, hentet, onOpen }: TipCardProps) {
  return (
    <button type="button" className="card result-card result-card--andres" onClick={onOpen}>
      <span className="result-card__badges">
        <span className="src src--andres src--chip"><Icon name="link" size={16} />{domene}</span>
        <span className="result-card__date">Hentet {hentet}</span>
      </span>
      <span className="result-card__title num">{formatTempRange(tempFra, tempTil)}</span>
      <span className="result-card__text result-card__text--one" title={tekst}>{tekst}</span>
    </button>
  )
}

type ExperienceProps = {
  oppskrift: string
  konfidens: Konfidens
  antallRenn: number
  sistBrukt?: string
  /** «Raskest i 4 av 5 direkte sammenligninger» */
  direkte?: { seire: number; av: number }
  rangering?: number
  onOpen?: () => void
}

/** Your own result: always shows number of races and confidence. */
export function ExperienceResultCard({ oppskrift, konfidens, antallRenn, sistBrukt, direkte, rangering, onOpen }: ExperienceProps) {
  return (
    <button type="button" className="card result-card result-card--min" onClick={onOpen}>
      <span className="result-card__badges">
        <SourceBadge kind="min" />
        <ConfidenceBadge level={konfidens} />
      </span>
      <span className="result-card__title">
        {rangering !== undefined && <span className="result-card__rank" aria-label={`Nummer ${rangering}`}>{rangering}</span>}
        {oppskrift}
      </span>
      <span className="result-card__text">
        Bygger på {antallRenn} renn
        {sistBrukt ? ` · sist ${sistBrukt}` : ''}
      </span>
      {direkte && (
        <span className="result-card__text">
          Raskest i {direkte.seire} av {direkte.av} direkte sammenligninger
        </span>
      )}
    </button>
  )
}

type RaceCardProps = {
  dato: string
  sted: string
  lufttemp: number | null
  forhold: string
  vurdering: string
  onOpen?: () => void
}

/** A race in lists: date, place, temperature large, conditions and rating. */
export function RaceCard({ dato, sted, lufttemp, forhold, vurdering, onOpen }: RaceCardProps) {
  return (
    <button type="button" className="card race-card" onClick={onOpen}>
      <span className="race-card__temp num">{formatTemp(lufttemp)}</span>
      <span className="race-card__body">
        <span className="race-card__title">{dato} · {sted}</span>
        <span className="race-card__meta">{forhold} · {vurdering}</span>
      </span>
    </button>
  )
}

type Chip = { id: string; label: string; onRemove?: () => void; onToggle?: () => void; toggleLabel?: string }

/** Active filters. Each chip can be changed or removed with one tap. */
export function FilterChips({ label, chips }: { label: string; chips: Chip[] }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {chips.map((c) =>
        c.onRemove ? (
          <button key={c.id} type="button" className="chip" onClick={c.onRemove} aria-label={`Fjern ${c.label}`}>
            <span className="num">{c.label}</span>
            <Icon name="x" size={16} />
          </button>
        ) : (
          <button key={c.id} type="button" className="chip" onClick={c.onToggle} aria-label={c.toggleLabel}>
            <span>{c.label}</span>
            <Icon name="refresh" size={16} />
          </button>
        ),
      )}
    </div>
  )
}
