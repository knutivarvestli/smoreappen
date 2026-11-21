import './MountainSilhouette.css'

/** Two flat, low mountain layers. Decorative only. Top of «Finn» and auth screens. */
export function MountainSilhouette() {
  return (
    <svg className="mountains" viewBox="0 0 390 72" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="mountains__back" d="M0 72V44l38-20 30 14 46-30 40 24 28-12 52 28 36-18 44 22 38-26 38 22v44z" />
      <path className="mountains__front" d="M0 72V56l52-16 44 14 58-22 50 20 46-12 56 16 46-14 38 10v22z" />
    </svg>
  )
}
