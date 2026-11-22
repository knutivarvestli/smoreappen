import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { RecommendationCard } from '../../components/Cards'
import { TopBar } from '../../components/Navigation'
import { ConditionsSummary } from '../../components/RaceParts'
import { EmptyState } from '../../components/States'
import { toppAnbefalinger } from '../../lib/anbefaling'
import { SNOOPPRINNELSE } from '../../lib/domene'
import { formatTempRange } from '../../lib/format'
import { useTreff } from './treff'
import '../../styles/page.css'
import './FinnPage.css'

/** Three wax tips for the chosen conditions. Details per source behind two buttons. */
export function ResultaterPage() {
  const navigate = useNavigate()
  const { sok, egne, andre, domene } = useTreff()
  const topp = toppAnbefalinger(egne, andre, sok.temp)

  return (
    <div className="page page--tight resultater">
      <TopBar title="Resultater" onBack={() => navigate('/')} />
      <ConditionsSummary
        disiplin={sok.disiplin}
        lufttemp={sok.temp}
        snotyper={sok.snotyper}
        onEdit={() => navigate('/')}
        hjelpetekst={sok.opprinnelse ? SNOOPPRINNELSE[sok.opprinnelse] : 'Snøopprinnelse ikke valgt'}
      />

      {topp.length === 0 ? (
        <EmptyState
          title="Ingen godkjente tips for disse forholdene"
          action={<Button variant="secondary" icon="plus" onClick={() => navigate('/tips')}>Legg til kilde</Button>}
        >
          Legg til flere kilder?
        </EmptyState>
      ) : (
        <section aria-labelledby="smoretips" className="resultater__gruppe">
          <div className="resultater__hode">
            <h2 id="smoretips" className="resultater__tittel">
              {topp.length === 1 ? 'Ett smøretips' : `${topp.length === 3 ? 'Tre' : 'To'} smøretips`}
            </h2>
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

      <div className="resultater__detaljer">
        <Button variant="secondary" icon="flag" onClick={() => navigate('/resultater/mine')} disabled={egne.length === 0}>
          Mine erfaringer ({egne.length})
        </Button>
        <Button variant="secondary" icon="globe" onClick={() => navigate('/resultater/andre')} disabled={andre.length === 0}>
          Andres erfaringer ({andre.length})
        </Button>
      </div>
    </div>
  )
}
