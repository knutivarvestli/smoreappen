import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ExperienceResultCard, TipCard } from '../../components/Cards'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { EmptyState } from '../../components/States'
import { TemperatureInput } from '../../components/TemperatureInput'
import { SNOOPPRINNELSE, SNOTYPE, options, type Disiplin, type Snoopprinnelse, type Snotype } from '../../lib/domene'
import { lagretDisiplin, lagreDisiplin } from '../../lib/prefs'
import '../../styles/page.css'

// Example results until «Finn» is wired to the API (step 6).
const EKSEMPEL = {
  skoyting: {
    min: { oppskrift: 'Blå blokk + kaldpulver (eksempel)', antall: 6, sist: '14. feb.' },
    tips: { domene: 'eksempel-smoring.no', fra: -8, til: -3, tekst: 'Blokk i to lag, børst, pulver øverst.', hentet: '3. jan. 2026' },
  },
  klassisk: {
    min: null,
    tips: { domene: 'skitips.example', fra: -6, til: -2, tekst: 'Hardvoks i tre tynne lag, kork mellom hvert lag.', hentet: '20. des. 2025' },
  },
} as const

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

  const res = EKSEMPEL[disiplin]
  const iOmrade = temp !== null && temp >= res.tips.fra - 3 && temp <= res.tips.til + 3

  return (
    <div className="page">
      <TopBar title="Smøreappen" mountains onSettings={() => navigate('/innstillinger')} />
      <DisciplineToggle value={disiplin} onChange={velgDisiplin} />
      <TemperatureInput label="Lufttemperatur" value={temp} onChange={setTemp} />
      <PickRow label="Snøtype" icon="snowflake" multiple options={options(SNOTYPE)} value={sno} onChange={setSno} />
      <PickRow label="Snøopprinnelse" icon="mountain" options={options(SNOOPPRINNELSE)} value={opp} onChange={setOpp} />

      {iOmrade ? (
        <>
          {res.min && (
            <>
              <h2 className="page__group">Min erfaring</h2>
              <ExperienceResultCard oppskrift={res.min.oppskrift} konfidens="solid" antallRenn={res.min.antall} sistBrukt={res.min.sist} />
            </>
          )}
          <h2 className="page__group">Andres erfaringer</h2>
          <TipCard domene={res.tips.domene} tempFra={res.tips.fra} tempTil={res.tips.til} tekst={res.tips.tekst} hentet={res.tips.hentet} />
        </>
      ) : (
        <EmptyState
          title="Ingen godkjente tips for disse forholdene"
          action={<Button variant="secondary" icon="plus" onClick={() => navigate('/tips')}>Legg til kilde</Button>}
        >
          Legg til flere kilder?
        </EmptyState>
      )}
      <p className="help page__note">Prototype med eksempeldata. Ingenting lagres ennå.</p>
    </div>
  )
}
