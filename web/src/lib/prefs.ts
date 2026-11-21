// Per-device preferences. Storage may be unavailable; always fall back.
import type { Disiplin } from './domene'

const KEY = 'smoreappen.disiplin'

export function lagretDisiplin(): Disiplin {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'klassisk' || v === 'skoyting') return v
  } catch {
    // ignore
  }
  return 'skoyting'
}

export function lagreDisiplin(d: Disiplin) {
  try {
    localStorage.setItem(KEY, d)
  } catch {
    // ignore
  }
}
