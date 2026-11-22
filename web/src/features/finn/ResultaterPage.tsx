import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ExperienceResultCard, TipCard } from '../../components/Cards'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { ConditionsSummary } from '../../components/RaceParts'
import { EmptyState } from '../../components/States'
import { useDemo } from '../../demo/DemoStore'
import { innenfor, OPPSKRIFTER } from '../../demo/erfaring'
import { SNOOPPRINNELSE } from '../../lib/domene'
import '../../styles/page.css'
import './FinnPage.css'

const MAKS = 3

/** Results for the conditions chosen on the main page. Own experience first, kept apart from others'. */
export function ResultaterPage() {
  const navigate = useNavigate()
  const { sok, tips: alleTips, kilder } = useDemo()
  const domene = (kildeId: string) => kilder.find((k) => k.id === kildeId)?.domene ?? 'Ukjent kilde'

  const min = OPPSKRIFTER[sok.disiplin].filter((e) => innenfor(sok.temp, e.fra, e.til)).slice(0, MAKS)
  // Only approved tips are used in recommendations.
  const tips = alleTips
    .filter((t) => t.status === 'godkjent' && t.disiplin === sok.disiplin && innenfor(sok.temp, t.fra, t.til))
    .slice(0, MAKS)
  const uenige = new Set(tips.map((t) => t.kildeId)).size > 1

  return (
    <div className="page page--tight">
      <TopBar title="Resultater" onBack={() => navigate('/')} />
      <ConditionsSummary
        disiplin={sok.disiplin}
        lufttemp={sok.temp}
        snotyper={sok.snotyper}
        onEdit={() => navigate('/')}
        hjelpetekst={sok.opprinnelse ? `${SNOOPPRINNELSE[sok.opprinnelse]}. Forholdene du søkte med.` : 'Forholdene du søkte med.'}
      />

      {min.length === 0 && tips.length === 0 ? (
        <EmptyState
          title="Ingen godkjente tips for disse forholdene"
          action={<Button variant="secondary" icon="plus" onClick={() => navigate('/tips')}>Legg til kilde</Button>}
        >
          Legg til flere kilder?
        </EmptyState>
      ) : (
        <>
          {min.length > 0 && (
            <section aria-labelledby="min-erfaring" className="resultater__gruppe">
              <h2 id="min-erfaring" className="page__group">Min erfaring</h2>
              <ul className="page__list finn__list">
                {min.map((e) => (
                  <li key={e.id}>
                    <ExperienceResultCard oppskrift={e.oppskrift} konfidens={e.konfidens} antallRenn={e.antall} sistBrukt={e.sist} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {tips.length > 0 && (
            <section aria-labelledby="andres-erfaringer" className="resultater__gruppe">
              <h2 id="andres-erfaringer" className="page__group">Andres erfaringer</h2>
              {uenige && (
                <p className="finn__uenige help">
                  <Icon name="info" size={16} />
                  Kildene anbefaler ulike løsninger. Din egen erfaring teller tyngst.
                </p>
              )}
              <ul className="page__list finn__list">
                {tips.map((t) => (
                  <li key={t.id}>
                    <TipCard domene={domene(t.kildeId)} tempFra={t.fra} tempTil={t.til} tekst={t.sammendrag} hentet={t.hentet} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
