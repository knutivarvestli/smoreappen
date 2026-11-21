// Temperature formatting and parsing. Always a real minus sign (U+2212).

export const MINUS = '−'

/** Formats a number with a real minus sign and up to one decimal, using a decimal comma. */
export function formatNumber(n: number): string {
  const rounded = Math.round(n * 10) / 10
  const abs = Math.abs(rounded)
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1).replace('.', ',')
  if (rounded < 0) return MINUS + body
  if (rounded > 0) return '+' + body
  return body
}

/** "−7 °C", "+3 °C", "0 °C". null gives "Ikke oppgitt" (never guess). */
export function formatTemp(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'Ikke oppgitt'
  return `${formatNumber(n)} °C`
}

/** "−8 til −3 °C". Missing ends are shown honestly. */
export function formatTempRange(from: number | null | undefined, to: number | null | undefined): string {
  const hasFrom = from !== null && from !== undefined
  const hasTo = to !== null && to !== undefined
  if (!hasFrom && !hasTo) return 'Ikke oppgitt'
  if (hasFrom && hasTo) {
    if (from === to) return formatTemp(from)
    return `${formatNumber(from)} til ${formatNumber(to)} °C`
  }
  if (hasFrom) return `Fra ${formatNumber(from)} °C`
  return `Til ${formatNumber(to as number)} °C`
}

/**
 * Parses user input such as "-7", "−7", "–7,5", "7 °C". Returns null if the
 * input is empty or not a number.
 */
export function parseTemp(input: string): number | null {
  const cleaned = input
    .replace(/[−–—]/g, '-')
    .replace(',', '.')
    .replace(/°\s*c?/gi, '')
    .replace(/\s+/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '+') return null
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return null
  return Number(cleaned)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
