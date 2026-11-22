// Matches for the conditions chosen on the main page. Shared by the results
// view and the two detail views so they always agree.
import { useSearchParams } from 'react-router-dom'
import { useDemo } from '../../demo/DemoStore'
import { innenfor, OPPSKRIFTER, tipsRoller, type SmoreRolle } from '../../demo/erfaring'

export const ROLLE_NAVN: Record<SmoreRolle, string> = { feste: 'Feste', glid: 'Glid' }

/** Classic: grip and glide separately (grip first). Skate: glide only. */
export function useRolle(): { rolle: SmoreRolle; roller: SmoreRolle[]; settRolle: (r: SmoreRolle) => void } {
  const { sok } = useDemo()
  const [params, setParams] = useSearchParams()
  const roller: SmoreRolle[] = sok.disiplin === 'klassisk' ? ['feste', 'glid'] : ['glid']
  const fraUrl = params.get('rolle')
  const rolle: SmoreRolle = roller.includes(fraUrl as SmoreRolle) ? (fraUrl as SmoreRolle) : roller[0]
  const settRolle = (r: SmoreRolle) => setParams(r === roller[0] ? {} : { rolle: r }, { replace: true })
  return { rolle, roller, settRolle }
}

export function useTreff(rolle: SmoreRolle) {
  const { sok, tips, kilder } = useDemo()
  const domene = (kildeId: string) => kilder.find((k) => k.id === kildeId)?.domene ?? 'Ukjent kilde'
  const egne = OPPSKRIFTER[sok.disiplin].filter((e) => e.rolle === rolle && innenfor(sok.temp, e.fra, e.til))
  // Only approved tips are used in recommendations.
  const andre = tips.filter((t) =>
    t.status === 'godkjent' && t.disiplin === sok.disiplin && tipsRoller(t.lag).includes(rolle) && innenfor(sok.temp, t.fra, t.til))
  return { sok, egne, andre, domene }
}
