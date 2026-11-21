import { useEffect, useId, useState } from 'react'
import { clamp, formatNumber, formatTemp, parseTemp } from '../lib/format'
import { Icon } from './Icon'
import './TemperatureInput.css'

type Props = {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Optional fields (e.g. snøtemperatur) can be left as «Ikke oppgitt». */
  optional?: boolean
  /** Starting point for the stepper when the value is empty. */
  startAt?: number
}

/**
 * Large temperature picker: display-size number you can type into, −/+
 * stepper buttons and a slider. Always shows a real minus sign.
 */
export function TemperatureInput({ label, value, onChange, min = -30, max = 15, step = 1, optional, startAt = -5 }: Props) {
  const id = useId()
  const [draft, setDraft] = useState(value === null ? '' : formatNumber(value))
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    setDraft(value === null ? '' : formatNumber(value))
    setInvalid(false)
  }, [value])

  const set = (n: number) => onChange(clamp(Math.round(n / step) * step, min, max))
  const bump = (dir: 1 | -1) => set((value ?? startAt) + (value === null ? 0 : dir * step))

  const commitDraft = () => {
    if (draft.trim() === '') {
      if (optional) {
        onChange(null)
        setInvalid(false)
      } else {
        setDraft(value === null ? '' : formatNumber(value))
      }
      return
    }
    const parsed = parseTemp(draft)
    if (parsed === null) {
      setInvalid(true)
      return
    }
    set(parsed)
    setDraft(formatNumber(clamp(parsed, min, max)))
    setInvalid(false)
  }

  const errorId = `${id}-feil`
  return (
    <div className="temp">
      <label htmlFor={id} className="label temp__label">{label}</label>
      <div className="temp__row">
        <button
          type="button"
          className="temp__step"
          aria-label={`Senk ${label.toLowerCase()} med ${step} grad`}
          onClick={() => bump(-1)}
          disabled={value !== null && value <= min}
        >
          <Icon name="minus" size={22} />
        </button>
        <div className="temp__display">
          <input
            id={id}
            className="temp__input num"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={draft}
            placeholder={optional ? 'Ikke oppgitt' : ''}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft()
              if (e.key === 'ArrowUp') { e.preventDefault(); bump(1) }
              if (e.key === 'ArrowDown') { e.preventDefault(); bump(-1) }
            }}
          />
          {value !== null && <span className="temp__unit" aria-hidden="true">°C</span>}
        </div>
        <button
          type="button"
          className="temp__step"
          aria-label={`Øk ${label.toLowerCase()} med ${step} grad`}
          onClick={() => bump(1)}
          disabled={value !== null && value >= max}
        >
          <Icon name="plus" size={22} />
        </button>
      </div>
      <input
        className="temp__slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? startAt}
        aria-label={`${label}, glidebryter`}
        aria-valuetext={formatTemp(value)}
        onChange={(e) => set(Number(e.target.value))}
      />
      {invalid && (
        <p id={errorId} className="field__error" role="alert">
          <Icon name="alert" size={18} />
          Skriv temperaturen som et tall, for eksempel −7.
        </p>
      )}
      {optional && value !== null && (
        <button type="button" className="temp__clear" onClick={() => onChange(null)}>
          Fjern verdi
        </button>
      )}
    </div>
  )
}
