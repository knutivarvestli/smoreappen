import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Button.css'
import './States.css'

type EmptyProps = { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }

/** Empty states are invitations, not apologies. */
export function EmptyState({ icon = 'snowflake', title, children, action }: EmptyProps) {
  return (
    <section className="state state--empty">
      <span className="state__icon"><Icon name={icon} size={28} /></span>
      <h2>{title}</h2>
      {children && <p className="text-2">{children}</p>}
      {action}
    </section>
  )
}

type ErrorProps = { title: string; children?: ReactNode; onRetry?: () => void }

/** Says what happened and what the user can do. */
export function ErrorState({ title, children, onRetry }: ErrorProps) {
  return (
    <section className="state state--error" role="alert">
      <span className="state__icon"><Icon name="alert" size={28} /></span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {onRetry && (
        <button type="button" className="btn btn--secondary btn--md" onClick={onRetry}>
          <Icon name="refresh" size={20} />
          <span>Prøv igjen</span>
        </button>
      )}
    </section>
  )
}

type LoadingProps = {
  label?: string
  /** Step progress, e.g. henter side → leser innhold → trekker ut tips. */
  steps?: string[]
  current?: number
  lines?: number
}

export function LoadingState({ label = 'Laster', steps, current = 0, lines = 3 }: LoadingProps) {
  if (steps) {
    return (
      <section className="state state--steps" aria-live="polite">
        <h2 className="visually-hidden">{label}</h2>
        <ol className="steps">
          {steps.map((s, i) => {
            const status = i < current ? 'done' : i === current ? 'active' : 'todo'
            return (
              <li key={s} className={`steps__item is-${status}`} aria-current={status === 'active' ? 'step' : undefined}>
                <span className="steps__mark" aria-hidden="true">
                  {status === 'done' ? <Icon name="check" size={18} /> : i + 1}
                </span>
                <span>{s}</span>
                <span className="visually-hidden">
                  {status === 'done' ? ', ferdig' : status === 'active' ? ', pågår' : ', venter'}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="help">Du kan gå videre i appen mens dette pågår.</p>
      </section>
    )
  }
  return (
    <div className="skeleton" role="status" aria-label={label}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton__line" />
      ))}
    </div>
  )
}

/** «Lagret lokalt, synkroniseres senere». Offline itself comes in phase 2. */
export function OfflineNotice() {
  return (
    <p className="offline" role="status">
      <Icon name="cloudOff" size={20} />
      Lagret lokalt. Synkroniseres når du har dekning.
    </p>
  )
}

type BannerProps = { uncertain: number }

/** After extraction: all fields found (green) or N uncertain fields (amber). */
export function ReviewBanner({ uncertain }: BannerProps) {
  if (uncertain === 0) {
    return (
      <p className="banner banner--ok" role="status">
        <Icon name="circleCheck" size={20} />
        Alle felt ble funnet på siden. Du kan fortsatt endre dem.
      </p>
    )
  }
  return (
    <p className="banner banner--warn" role="status">
      <Icon name="alert" size={20} />
      Appen var usikker på {uncertain} felt. Sjekk de merkede feltene.
    </p>
  )
}
