import { Link } from 'react-router-dom'
import './Logo.css'

/** App mark: a peak over two ski tracks. Decorative; the text names the app. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect className="logo-mark__bg" width="32" height="32" rx="8" />
      <path className="logo-mark__peak" d="M5 21 13 9l4 6 2.5-3L27 21z" />
      <path className="logo-mark__snow" d="m13 9-2.6 3.9 1.6-.9 1 1.4 1.1-1.5 1.2.6z" />
      <path className="logo-mark__track" d="M6 25.5h20M6 28h20" />
    </svg>
  )
}

/** Logo + «Smøreappen». Always links back to the main page. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={`brand ${className ?? ''}`.trim()} aria-label="Smøreappen, gå til hovedsiden">
      <LogoMark />
      <span className="brand__name" aria-hidden="true">Smøreappen</span>
    </Link>
  )
}
