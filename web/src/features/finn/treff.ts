// Matches for the conditions chosen on the main page. Shared by the results
// view and the two detail views so they always agree.
import { useDemo } from '../../demo/DemoStore'
import { innenfor, OPPSKRIFTER } from '../../demo/erfaring'

export function useTreff() {
  const { sok, tips, kilder } = useDemo()
  const domene = (kildeId: string) => kilder.find((k) => k.id === kildeId)?.domene ?? 'Ukjent kilde'
  const egne = OPPSKRIFTER[sok.disiplin].filter((e) => innenfor(sok.temp, e.fra, e.til))
  // Only approved tips are used in recommendations.
  const andre = tips.filter((t) => t.status === 'godkjent' && t.disiplin === sok.disiplin && innenfor(sok.temp, t.fra, t.til))
  return { sok, egne, andre, domene }
}
