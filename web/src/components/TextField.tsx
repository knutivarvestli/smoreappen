import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icon } from './Icon'
import './Badges.css'
import './TextField.css'

type BaseProps = {
  label: string
  hint?: string
  /** Error says what happened and what to do. Shown with an icon, not just colour. */
  error?: string
  /** «Sjekk»: the app was unsure about an extracted value. */
  check?: boolean
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { multiline?: false }
type AreaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true }

export function TextField(props: InputProps | AreaProps) {
  const { label, hint, error, check, multiline, className, id: givenId, ...rest } = props
  const autoId = useId()
  const id = givenId ?? autoId
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-feil` : ''].filter(Boolean).join(' ') || undefined
  const cls = `field__control ${check ? 'is-check' : ''}`

  return (
    <div className={`field ${error ? 'has-error' : ''} ${className ?? ''}`.trim()}>
      <div className="field__head">
        <label htmlFor={id} className="label field__label">{label}</label>
        {check && <span className="flag flag--warn"><Icon name="alert" size={16} />Sjekk</span>}
      </div>
      {multiline ? (
        <textarea
          id={id}
          className={cls}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={cls}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && <p id={`${id}-hint`} className="help">{hint}</p>}
      {error && (
        <p id={`${id}-feil`} className="field__error">
          <Icon name="alert" size={18} />
          {error}
        </p>
      )}
    </div>
  )
}

type PasswordProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  autoComplete: 'current-password' | 'new-password'
}

/** Password with «Vis passord». Paste and password managers are allowed. */
export function PasswordField({ label, hint, error, autoComplete, className, id: givenId, ...rest }: PasswordProps) {
  const autoId = useId()
  const id = givenId ?? autoId
  const [visible, setVisible] = useState(false)
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-feil` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'has-error' : ''} ${className ?? ''}`.trim()}>
      <label htmlFor={id} className="label field__label">{label}</label>
      <div className="field__pw">
        <input
          id={id}
          className="field__control"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        <button
          type="button"
          className="field__pw-toggle"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible(!visible)}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={20} />
          <span>{visible ? 'Skjul passord' : 'Vis passord'}</span>
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="help">{hint}</p>}
      {error && (
        <p id={`${id}-feil`} className="field__error">
          <Icon name="alert" size={18} />
          {error}
        </p>
      )}
    </div>
  )
}
