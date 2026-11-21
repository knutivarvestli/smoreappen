import { useId } from 'react'
import { Icon, type IconName } from './Icon'
import './SegmentedControl.css'

export type SegmentOption<T extends string> = {
  value: T
  label: string
  /** Optional accent class suffix, e.g. "klassisk" gives .seg__opt--klassisk */
  accent?: string
  /** Icon shown before the label. With an icon, selection is shown by border and weight. */
  icon?: IconName
}

type Props<T extends string> = {
  legend: string
  hideLegend?: boolean
  options: SegmentOption<T>[]
  value: T | null
  onChange: (value: T) => void
  disabled?: boolean
  /** "split": separate buttons with a gap (discipline toggle). */
  variant?: 'track' | 'split'
}

/**
 * Single choice among few options. Built on native radio buttons, so arrow
 * keys, focus and screen readers work without extra code. The selected option
 * shows a check icon, so colour never carries the meaning alone.
 */
export function SegmentedControl<T extends string>({ legend, hideLegend, options, value, onChange, disabled, variant = 'track' }: Props<T>) {
  const name = useId()
  return (
    <fieldset className={`seg seg--${variant}`} disabled={disabled}>
      <legend className={hideLegend ? 'visually-hidden' : 'label seg__legend'}>{legend}</legend>
      <div className="seg__track">
        {options.map((o) => {
          const checked = o.value === value
          return (
            <label key={o.value} className={`seg__opt ${o.accent ? `seg__opt--${o.accent}` : ''} ${checked ? 'is-checked' : ''}`}>
              <input
                type="radio"
                className="visually-hidden"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
              />
              {o.icon ? <Icon name={o.icon} size={20} /> : checked && <Icon name="check" size={18} />}
              <span>{o.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
