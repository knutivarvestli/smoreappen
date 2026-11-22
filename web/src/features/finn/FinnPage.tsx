import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ExperienceResultCard, TipCard } from '../../components/Cards'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { EmptyState } from '../../components/States'
import { TemperatureInput } from '../../components/TemperatureInput'
import { useDemo } from '../../demo/DemoStore'
import { innenfor, OPPSKRIFTER } from '../../demo/erfaring'
import {
  SNOOPPRINNELSE, SNOTYPE, options,
  type Disiplin, type Snoopprinnelse, type Snotype,
} from '../../lib/domene'
import { lagretDisiplin, lagreDisiplin } from '../../lib/prefs'
import '../../styles/page.css'
import './FinnPage.css'

const MAKS = 3

export function FinnPage() {
  const navigate = useNavigate()
  const [disiplin, setDisiplin] = useState<Disiplin>(lagretDisiplin())
  const [temp, setTemp] = useState<number | null>(-7)
  const [sno, setSno] = useState<Snotype[]>(['finkornet'])
  const [opp, setOpp] = useState<Snoopprinnelse | null>('kunstsno')

  const velgDisiplin = (d: Disiplin) => {
    setDisiplin(d)
    lagreDisiplin(d)
  }

  const { tips: alleTips, kilder } = useDemo()
  const domene = (kildeId: string) => kilder.find((k) => k.id === kildeId)?.domene ?? 'Ukjent kilde'

  const min = OPPSKRIFTER[disiplin].filter((e) => innenfor(temp, e.fra, e.til)).slice(0, MAKS)
  // Only approved tips are used in recommendations.
  const tips = alleTips
    .filter((t) => t.status === 'godkjent' && t.disiplin === disiplin && innenfor(temp, t.fra, t.til))
    .slice(0, MAKS)
  const uenige = new Set(tips.map((t) => t.kildeId)).size > 1

  return (
    <div className="page page--tight finn">
      <div className="finn__controls">
        <TopBar title="Søk" brand mountains onSettings={() => navigate('/innstillinger')} />
        <DisciplineToggle value={disiplin} onChange={velgDisiplin} />
        <TemperatureInput label="Lufttemperatur" value={temp} onChange={setTemp} />
        <PickRow label="Snøtype" icon="snowflake" multiple options={options(SNOTYPE)} value={sno} onChange={setSno} />
        <PickRow label="Snøopprinnelse" icon="mountain" options={options(SNOOPPRINNELSE)} value={opp} onChange={setOpp} />
      </div>

      {/* Results scroll on their own; the condition controls stay in place. */}
      <section className="finn__results" aria-label="Resultater" tabIndex={0}>
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
              <>
                <h2 className="page__group">Min erfaring</h2>
                <ul className="page__list finn__list">
                  {min.map((e) => (
                    <li key={e.id}>
                      <ExperienceResultCard oppskrift={e.oppskrift} konfidens={e.konfidens} antallRenn={e.antall} sistBrukt={e.sist} />
                    </li>
                  ))}
                </ul>
              </>
            )}
            {tips.length > 0 && (
              <>
                <h2 className="page__group">Andres erfaringer</h2>
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
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
