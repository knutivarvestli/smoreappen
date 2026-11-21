// Theme preference: system, light or dark. Stored per device; works without storage.

export type Theme = 'system' | 'lys' | 'mork'
const KEY = 'smoreappen.tema'

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'lys' || v === 'mork' || v === 'system') return v
  } catch {
    // storage unavailable: fall back to system
  }
  return 'system'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme === 'mork' ? 'dark' : 'light')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // ignore
  }
}
