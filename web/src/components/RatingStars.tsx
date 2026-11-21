import { useId } from 'react'
import { Icon } from './Icon'
import './RatingStars.css'

type Props = { label: string; value: number | null; onChange: (v: number | null) => void }

/** 1–5 stars as native radios; the chosen number is also written out. */
export function RatingStars({ label, value, onChange }: Props) {
  const name = useId()
  return (
    <fieldset className="stars">
      <legend className="label field__label">{label}</legend>
      <div className="stars__row">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`stars__star ${value !== null && n <= value ? 'is-on' : ''}`}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              checked={value === n}
              onChange={() => onChange(n)}
              onClick={() => { if (value === n) onChange(null) }}
            />
            <Icon name="star" size={30} />
            <span className="visually-hidden">{n} av 5</span>
          </label>
        ))}
        <span className="stars__text help" aria-hidden="true">{value ? `${value} av 5` : 'Ikke vurdert'}</span>
      </div>
    </fieldset>
  )
}
