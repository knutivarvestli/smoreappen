import { useId, useRef, useState } from 'react'
import { Icon, type IconName } from './Icon'
import './PickRow.css'

type Option<T extends string> = { value: T; label: string }

type Common<T extends string> = {
  label: string
  icon?: IconName
  options: Option<T>[]
  /** Text when nothing is chosen. */
  emptyText?: string
}

type Single<T extends string> = Common<T> & {
  multiple?: false
  value: T | null
  onChange: (value: T | null) => void
}

type Multi<T extends string> = Common<T> & {
  multiple: true
  value: T[]
  onChange: (value: T[]) => void
}

/**
 * List choice where only the chosen row is shown. Tapping the row opens the
 * full list; a single choice closes it again. Replaces SnowTypeChips.
 */
export function PickRow<T extends string>(props: Single<T> | Multi<T>) {
  const { label, icon, options, emptyText = 'Ikke valgt' } = props
  const [open, setOpen] = useState(false)
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const chosen = props.multiple ? props.value : props.value === null ? [] : [props.value]
  const summary = chosen.length === 0
    ? emptyText
    : options.filter((o) => chosen.includes(o.value)).map((o) => o.label).join(', ')

  const toggle = (v: T) => {
    if (props.multiple) {
      const next = props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]
      props.onChange(options.map((o) => o.value).filter((x) => next.includes(x)))
    } else {
      props.onChange(props.value === v ? null : v)
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className={`pick ${open ? 'is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="pick__row"
        aria-expanded={open}
        aria-controls={`${id}-liste`}
        onClick={() => setOpen(!open)}
      >
        {icon && <Icon name={icon} className="pick__icon" />}
        <span className="pick__text">
          <span className="pick__label">{label}</span>
          <span className={`pick__value ${chosen.length === 0 ? 'is-empty' : ''}`}>{summary}</span>
        </span>
        <Icon name="chevronDown" className="pick__chev" />
      </button>
      {open && (
        <fieldset id={`${id}-liste`} className="pick__list">
          <legend className="visually-hidden">
            {label}{props.multiple ? ', velg en eller flere' : ''}
          </legend>
          {options.map((o) => {
            const on = chosen.includes(o.value)
            return (
              <label key={o.value} className={`pick__opt ${on ? 'is-checked' : ''}`}>
                <input
                  type={props.multiple ? 'checkbox' : 'radio'}
                  name={`${id}-valg`}
                  className="visually-hidden"
                  checked={on}
                  onChange={() => toggle(o.value)}
                  onClick={(e) => {
                    // Radios do not fire change when re-clicked; allow unselecting.
                    if (!props.multiple && on) {
                      e.preventDefault()
                      toggle(o.value)
                    }
                  }}
                />
                <span className="pick__mark" aria-hidden="true">{on && <Icon name="check" size={18} />}</span>
                <span>{o.label}</span>
              </label>
            )
          })}
          {props.multiple && (
            <button type="button" className="pick__done" onClick={() => { setOpen(false); buttonRef.current?.focus() }}>
              Bruk valget
            </button>
          )}
        </fieldset>
      )}
    </div>
  )
}
