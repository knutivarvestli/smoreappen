import { useRef, type KeyboardEvent } from 'react'
import './Tabs.css'

type Props<T extends string> = {
  label: string
  tabs: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** id prefix; panels use `${idBase}-panel-${value}` */
  idBase: string
}

/** WAI-ARIA tabs with arrow-key navigation. Active tab: bold text and underline. */
export function Tabs<T extends string>({ label, tabs, value, onChange, idBase }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + tabs.length) % tabs.length
    onChange(tabs[next].value)
    refs.current[next]?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className="tabs">
      {tabs.map((t, i) => {
        const on = t.value === value
        return (
          <button
            key={t.value}
            ref={(el) => { refs.current[i] = el }}
            role="tab"
            type="button"
            id={`${idBase}-tab-${t.value}`}
            aria-selected={on}
            aria-controls={`${idBase}-panel-${t.value}`}
            tabIndex={on ? 0 : -1}
            className={`tabs__tab ${on ? 'is-active' : ''}`}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
