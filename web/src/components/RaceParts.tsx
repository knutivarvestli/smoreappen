import type { ReactNode } from 'react'
import { DISIPLIN, SNOTYPE, type Disiplin, type Rolle, type Snotype } from '../lib/domene'
import { formatTemp } from '../lib/format'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'
import './RaceParts.css'

type StepProps = { current: number; total: number; label: string }

/** «Steg 3 av 4 · Smøring» with segmented bar. */
export function StepProgress({ current, total, label }: StepProps) {
  return (
    <div className="step-progress">
      <div
        className="step-progress__bar"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Steg ${current} av ${total}, ${label}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`step-progress__seg ${i < current ? 'is-done' : ''}`} />
        ))}
      </div>
      <p className="help">Steg {current} av {total} · {label}</p>
    </div>
  )
}

type ConditionsProps = {
  disiplin: Disiplin
  lufttemp: number | null
  snotyper: Snotype[]
  onEdit?: () => void
  hjelpetekst?: string
}

/** Compact conditions line: discipline · temperature · snow type, with «Endre». */
export function ConditionsSummary({ disiplin, lufttemp, snotyper, onEdit, hjelpetekst = 'Forhold. Brukes til å foreslå produkter.' }: ConditionsProps) {
  const sno = snotyper.length ? snotyper.map((s) => SNOTYPE[s]).join(', ') : 'Snøtype ikke valgt'
  return (
    <div className="conditions">
      <Icon name="thermometer" />
      <span className="conditions__text">
        <span className="conditions__main num">{DISIPLIN[disiplin]} · {formatTemp(lufttemp)} · {sno}</span>
        <span className="help">{hjelpetekst}</span>
      </span>
      {onEdit && (
        <button type="button" className="conditions__edit" onClick={onEdit}>
          Endre<span className="visually-hidden"> forhold</span>
        </button>
      )}
    </div>
  )
}

const ROLLE: Record<Rolle, { label: string; icon: IconName }> = {
  rill: { label: 'Rill', icon: 'ruler' },
  glid: { label: 'Glid', icon: 'wind' },
  feste: { label: 'Feste', icon: 'hand' },
}

export type WaxLayer = { id: string; produkt: string; metode?: string; detalj?: string; flag?: ReactNode }

type WaxListProps = {
  rolle: Rolle
  layers: WaxLayer[]
  onAdd: () => void
  onOpen?: (id: string) => void
}

/** One section (Rill, Glid or Feste) with numbered layers and a dashed add button. */
export function WaxLayerList({ rolle, layers, onAdd, onOpen }: WaxListProps) {
  const r = ROLLE[rolle]
  const headingId = `lag-${rolle}`
  return (
    <section className="wax" aria-labelledby={headingId}>
      <div className="wax__head">
        <Icon name={r.icon} />
        <h3 id={headingId}>{r.label}</h3>
        <span className="help">{layers.length} lag</span>
      </div>
      {layers.length > 0 && (
        <ol className="wax__list">
          {layers.map((l, i) => (
            <WaxLayerItem key={l.id} nr={i + 1} layer={l} onOpen={onOpen ? () => onOpen(l.id) : undefined} />
          ))}
        </ol>
      )}
      <Button variant="add" icon="plus" block onClick={onAdd}>Legg til {r.label.toLowerCase()}</Button>
    </section>
  )
}

export function WaxLayerItem({ nr, layer, onOpen }: { nr: number; layer: WaxLayer; onOpen?: () => void }) {
  const content = (
    <>
      <span className="wax__nr" aria-hidden="true">{nr}</span>
      <span className="visually-hidden">Lag {nr}:</span>
      <span className="wax__text">
        <span className="wax__product">{layer.produkt}</span>
        {(layer.metode || layer.detalj) && (
          <span className="help">{[layer.metode, layer.detalj].filter(Boolean).join(' · ')}</span>
        )}
      </span>
      {layer.flag}
      {onOpen && <Icon name="chevronRight" />}
    </>
  )
  return (
    <li>
      {onOpen ? (
        <button type="button" className="wax__item" onClick={onOpen}>{content}</button>
      ) : (
        <div className="wax__item">{content}</div>
      )}
    </li>
  )
}
