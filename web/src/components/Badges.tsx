import type { Konfidens, TipsStatus } from '../lib/domene'
import { Icon, type IconName } from './Icon'
import './Badges.css'

/** Utkast / Godkjent / Forkastet. */
export function StatusBadge({ status }: { status: TipsStatus }) {
  const map: Record<TipsStatus, { text: string; icon: IconName; cls: string }> = {
    utkast: { text: 'Utkast', icon: 'info', cls: 'warn' },
    godkjent: { text: 'Godkjent', icon: 'check', cls: 'ok' },
    forkastet: { text: 'Forkastet', icon: 'x', cls: 'muted' },
  }
  const m = map[status]
  return (
    <span className={`badge badge--${m.cls}`}>
      <Icon name={m.icon} size={16} />
      {m.text}
    </span>
  )
}

/**
 * Three steps with different shape as well as colour:
 * Solid erfaring (filled), Noe erfaring (outline), Ett renn (dashed).
 */
export function ConfidenceBadge({ level }: { level: Konfidens }) {
  const text: Record<Konfidens, string> = {
    solid: 'Solid erfaring',
    noe: 'Noe erfaring',
    ett: 'Ett renn',
  }
  return <span className={`conf conf--${level}`}>{text[level]}</span>
}

export type FlagKind = 'sjekk' | 'passer' | 'annen_sno' | 'utenfor'

/** «Sjekk» on uncertain fields, «Passer nå» etc. in the product picker. */
export function FlagBadge({ kind }: { kind: FlagKind }) {
  const map: Record<FlagKind, { text: string; icon: IconName; cls: string }> = {
    sjekk: { text: 'Sjekk', icon: 'alert', cls: 'warn' },
    passer: { text: 'Passer nå', icon: 'check', cls: 'ok' },
    annen_sno: { text: 'Annen snøtype', icon: 'snowflake', cls: 'warn' },
    utenfor: { text: 'Utenfor område', icon: 'thermometer', cls: 'warn' },
  }
  const m = map[kind]
  return (
    <span className={`flag flag--${m.cls}`}>
      <Icon name={m.icon} size={16} />
      {m.text}
    </span>
  )
}

/** Min erfaring (flag icon) vs Andres erfaringer (globe icon + domain). */
export function SourceBadge({ kind, domain }: { kind: 'min' | 'andres'; domain?: string }) {
  if (kind === 'min') {
    return (
      <span className="src src--min">
        <Icon name="flag" size={16} />
        Min erfaring
      </span>
    )
  }
  return (
    <span className="src src--andres">
      <Icon name="globe" size={16} />
      {domain ?? 'Andres erfaringer'}
    </span>
  )
}
