import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { RecommendationCard } from '../../components/Cards'
import { ConditionsSummary } from '../../components/RaceParts'
import { EmptyState } from '../../components/States'
import { Tabs } from '../../components/Tabs'
import type { SmoreRolle } from '../../demo/erfaring'
import { toppAnbefalinger } from '../../lib/anbefaling'
import { SNOOPPRINNELSE } from '../../lib/domene'
import { formatTempRange } from '../../lib/format'
import { ROLLE_NAVN, useRolle, useTreff } from './treff'
import '../../styles/page.css'
import './FinnPage.css'

const ANTALL_ORD = ['Ingen', 'Ett', 'To', 'Tre']

/**
 * Three wax tips for the chosen conditions. Classic shows grip and glide on
 * separate tabs (grip first); skate shows glide. Details per source behind two buttons.
 */
export function ResultaterPage() {
  const navigate = useNavigate()
  const { rolle, roller, settRolle } = useRolle()
  const { sok, egne, andre, domene } = useTreff(rolle)
  const topp = toppAnbefalinger(egne, andre, sok.temp)
  const klassisk = roller.length > 1
  const panelId = `resultater-panel-${rolle}`
  const detaljer = (hvem: 'mine' | 'andre') => navigate(`/resultater/${hvem}${klassisk ? `?rolle=${rolle}` : ''}`)

  const tittel = `${ANTALL_ORD[topp.length]} smøretips${klassisk ? ` for ${rolle}` : ''}`

  return (
    <div className={`page page--tight resultater ${klassisk ? 'resultater--faner' : ''}`}>
      {/* No top bar: «Endre» on the conditions line goes back, and space is needed for the tips. */}
      <h1 className="visually-hidden">Resultater</h1>
      <ConditionsSummary
        disiplin={sok.disiplin}
        lufttemp={sok.temp}
        snotyper={sok.snotyper}
        onEdit={() => navigate('/')}
        hjelpetekst={sok.opprinnelse ? SNOOPPRINNELSE[sok.opprinnelse] : 'Snøopprinnelse ikke valgt'}
      />

      {klassisk && (
        <Tabs<SmoreRolle>
          label="Smøring"
          idBase="resultater"
          value={rolle}
          onChange={settRolle}
          tabs={roller.map((r) => ({ value: r, label: ROLLE_NAVN[r] }))}
        />
      )}

      <div
        className="resultater__panel"
        {...(klassisk ? { role: 'tabpanel', id: panelId, 'aria-labelledby': `resultater-tab-${rolle}` } : {})}
      >
        {topp.length === 0 ? (
          <EmptyState
            title={`Ingen godkjente tips${klassisk ? ` for ${rolle}` : ''} i disse forholdene`}
            action={<Button variant="secondary" icon="plus" onClick={() => navigate('/tips')}>Legg til kilde</Button>}
          >
            Legg til flere kilder?
          </EmptyState>
        ) : (
          <section aria-labelledby="smoretips" className="resultater__gruppe">
            <div className="resultater__hode">
              <h2 id="smoretips" className={klassisk ? 'visually-hidden' : 'resultater__tittel'}>{tittel}</h2>
              <p className="help resultater__forklaring">Din egen erfaring teller tyngst.</p>
            </div>
            <ol className="page__list finn__list">
              {topp.map((a, i) => (
                <li key={a.data.id}>
                  {a.kilde === 'min' ? (
                    <RecommendationCard
                      rangering={i + 1}
                      tittel={a.data.oppskrift}
                      begrunnelse={`Bygger på ${a.data.antall} renn · sist ${a.data.sist}`}
                      kilde={{ type: 'min', konfidens: a.data.konfidens }}
                    />
                  ) : (
                    <RecommendationCard
                      rangering={i + 1}
                      tittel={a.data.sammendrag}
                      begrunnelse={`${formatTempRange(a.data.fra, a.data.til)} · hentet ${a.data.hentet}`}
                      kilde={{ type: 'andre', domene: domene(a.data.kildeId) }}
                    />
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <div className="resultater__detaljer">
        <Button variant="secondary" icon="flag" onClick={() => detaljer('mine')} disabled={egne.length === 0}>
          Mine erfaringer ({egne.length})
        </Button>
        <Button variant="secondary" icon="globe" onClick={() => detaljer('andre')} disabled={andre.length === 0}>
          Andres erfaringer ({andre.length})
        </Button>
      </div>
    </div>
  )
}
