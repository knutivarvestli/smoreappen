import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { formatTempRange } from '../lib/format'
import { Button, IconButton } from './Button'
import { Icon, type IconName } from './Icon'
import './TextField.css'
import './FormParts.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: { value: string; label: string }[]
}

/** Native select (good on mobile, works with keyboard and screen readers). */
export function SelectField({ label, options, className, id: givenId, ...rest }: SelectProps) {
  const autoId = useId()
  const id = givenId ?? autoId
  return (
    <div className={`field ${className ?? ''}`.trim()}>
      <label htmlFor={id} className="label field__label">{label}</label>
      <div className="select">
        <select id={id} className="field__control select__control" {...rest}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevronDown" className="select__chev" />
      </div>
    </div>
  )
}

type RangeProps = {
  label: string
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
  error?: string
}

/** «Temperaturområde (°C)»: two fields with «til». Empty = not stated. */
export function TempRangeField({ label, from, to, onFrom, onTo, error }: RangeProps) {
  const id = useId()
  return (
    <fieldset className={`field range ${error ? 'has-error' : ''}`}>
      <legend className="label field__label">{label}</legend>
      <div className="range__row">
        <input
          id={`${id}-fra`}
          className="field__control num"
          inputMode="decimal"
          aria-label="Fra"
          value={from}
          placeholder="Ikke oppgitt"
          onChange={(e) => onFrom(e.target.value)}
        />
        <span className="range__til" aria-hidden="true">til</span>
        <input
          id={`${id}-til`}
          className="field__control num"
          inputMode="decimal"
          aria-label="Til"
          value={to}
          placeholder="Ikke oppgitt"
          onChange={(e) => onTo(e.target.value)}
        />
      </div>
      {error && (
        <p className="field__error"><Icon name="alert" size={18} />{error}</p>
      )}
    </fieldset>
  )
}

export type SnowRow = { id: string; tekst: string; fra: number; til: number }

type SnowRowsProps = {
  rows: SnowRow[]
  onEdit: (id: string) => void
  onRemove: (id: string) => void
  onAdd: () => void
  /** Row being edited is rendered by this instead of the static row. */
  editingId?: string | null
  renderEdit?: (id: string) => ReactNode
}

/** Grip wax: temperature per snow type. Rows can be edited, removed and added. */
export function SnowRowList({ rows, onEdit, onRemove, onAdd, editingId, renderEdit }: SnowRowsProps) {
  const headingId = useId()
  return (
    <section className="snow-rows" aria-labelledby={headingId}>
      <h3 id={headingId} className="label field__label">Etter snøtype</h3>
      <ul>
        {rows.map((r) => r.id === editingId && renderEdit ? (
          <li key={r.id}>{renderEdit(r.id)}</li>
        ) : (
          <li key={r.id} className="snow-row">
            <span className="snow-row__text">
              <span>{r.tekst}</span>
              <span className="help num">{formatTempRange(r.fra, r.til)}</span>
            </span>
            <IconButton icon="pencil" label={`Endre ${r.tekst}`} onClick={() => onEdit(r.id)} />
            <IconButton icon="x" label={`Fjern ${r.tekst}`} onClick={() => onRemove(r.id)} />
          </li>
        ))}
      </ul>
      {!editingId && <Button variant="secondary" icon="plus" block onClick={onAdd}>Legg til snøtype</Button>}
    </section>
  )
}

type LinkRowProps = { icon: IconName; title: string; sub?: string; onClick: () => void }

/** Row that opens a sub page, e.g. «Produktbeskrivelse». */
export function LinkRow({ icon, title, sub, onClick }: LinkRowProps) {
  return (
    <button type="button" className="link-row" onClick={onClick}>
      <Icon name={icon} />
      <span className="link-row__text">
        <span className="link-row__title">{title}</span>
        {sub && <span className="help">{sub}</span>}
      </span>
      <Icon name="chevronRight" />
    </button>
  )
}

type SourceInfoProps = { domene: string; url: string }

/** «Hentet fra nettside» with a link to the original. */
export function SourceInfo({ domene, url }: SourceInfoProps) {
  return (
    <div className="source-info">
      <Icon name="globe" />
      <span className="source-info__text">
        <span className="source-info__title">Hentet fra nettside</span>
        <span className="help">{domene}</span>
      </span>
      <a className="src src--andres src--chip" href={url} target="_blank" rel="noopener noreferrer">
        <Icon name="link" size={16} />Lenke<span className="visually-hidden"> (åpnes i ny fane)</span>
      </a>
    </div>
  )
}
