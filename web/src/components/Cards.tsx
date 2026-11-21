import type { ReactNode } from 'react'
import { DISIPLIN, type Disiplin, type Konfidens } from '../lib/domene'
import { formatTempRange } from '../lib/format'
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
      </span>
      <span className="result-card__title num">{formatTempRange(tempFra, tempTil)}</span>
      <span className="result-card__text">{tekst}</span>
      <span className="help">Hentet {hentet}</span>
    </button>
  )
}

type ExperienceProps = {
  oppskrift: string
  konfidens: Konfidens
  antallRenn: number
  sistBrukt?: string
  onOpen?: () => void
}

/** Your own result: always shows number of races and confidence. */
export function ExperienceResultCard({ oppskrift, konfidens, antallRenn, sistBrukt, onOpen }: ExperienceProps) {
  return (
    <button type="button" className="card result-card result-card--min" onClick={onOpen}>
      <span className="result-card__badges">
        <SourceBadge kind="min" />
        <ConfidenceBadge level={konfidens} />
      </span>
      <span className="result-card__title">{oppskrift}</span>
      <span className="result-card__text">
        Bygger på {antallRenn} renn
        {sistBrukt ? ` · sist ${sistBrukt}` : ''}
      </span>
    </button>
  )
}
