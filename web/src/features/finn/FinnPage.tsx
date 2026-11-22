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
import {
  SNOOPPRINNELSE, SNOTYPE, options,
  type Disiplin, type Konfidens, type Snoopprinnelse, type Snotype,
} from '../../lib/domene'
import { lagretDisiplin, lagreDisiplin } from '../../lib/prefs'
import '../../styles/page.css'
import './FinnPage.css'

// Example results until «Finn» is wired to the API (step 6). All fluor-free.
type Erfaring = { id: string; oppskrift: string; konfidens: Konfidens; antall: number; sist: string; fra: number; til: number }
type Tips = { id: string; domene: string; fra: number; til: number; tekst: string; hentet: string }

const EKSEMPEL: Record<Disiplin, { min: Erfaring[]; tips: Tips[] }> = {
  skoyting: {
    min: [
      { id: 'e1', oppskrift: 'Blå blokk + kaldpulver (eksempel)', konfidens: 'solid', antall: 6, sist: '14. feb.', fra: -10, til: -4 },
      { id: 'e2', oppskrift: 'Skigo FFC LDQ 157 3.0, to lag', konfidens: 'noe', antall: 3, sist: '2. feb.', fra: -9, til: -3 },
      { id: 'e3', oppskrift: 'Lilla blokk alene (eksempel)', konfidens: 'ett', antall: 1, sist: '18. jan.', fra: -8, til: -2 },
    ],
    tips: [
      { id: 't1', domene: 'eksempel-smoring.no', fra: -8, til: -3, tekst: 'Blokk i to lag, børst, pulver øverst.', hentet: '3. jan. 2026' },
      { id: 't2', domene: 'skitips.example', fra: -10, til: -4, tekst: 'Hard kaldvoks, stryk tynt og børst grundig på kunstsnø.', hentet: '12. des. 2025' },
      { id: 't3', domene: 'langrenn-blogg.example', fra: -6, til: -1, tekst: 'Universalblokk og lett rill når snøen er finkornet.', hentet: '28. nov. 2025' },
    ],
  },
  klassisk: {
    min: [
      { id: 'e4', oppskrift: 'Swix VP50 Pro, tre tynne lag', konfidens: 'noe', antall: 4, sist: '9. feb.', fra: -6, til: 0 },
      { id: 'e5', oppskrift: 'Bindevoks + blå festevoks (eksempel)', konfidens: 'noe', antall: 2, sist: '21. jan.', fra: -10, til: -4 },
      { id: 'e6', oppskrift: 'Klister universal (eksempel)', konfidens: 'ett', antall: 1, sist: '5. mars', fra: -3, til: 2 },
    ],
    tips: [
      { id: 't4', domene: 'skitips.example', fra: -6, til: -2, tekst: 'Hardvoks i tre tynne lag, kork mellom hvert lag.', hentet: '20. des. 2025' },
      { id: 't5', domene: 'eksempel-smoring.no', fra: -12, til: -5, tekst: 'Bindevoks under, kald festevoks i fire lag ved kunstsnø.', hentet: '3. jan. 2026' },
      { id: 't6', domene: 'langrenn-blogg.example', fra: -4, til: 1, tekst: 'Klister på gammel snø, festevoks oppå når det er kaldt.', hentet: '15. jan. 2026' },
    ],
  },
}

const MAKS = 3
const passer = (t: number | null, fra: number, til: number) => t !== null && t >= fra - 3 && t <= til + 3

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

  const min = EKSEMPEL[disiplin].min.filter((e) => passer(temp, e.fra, e.til)).slice(0, MAKS)
  const tips = EKSEMPEL[disiplin].tips.filter((t) => passer(temp, t.fra, t.til)).slice(0, MAKS)
  const uenige = new Set(tips.map((t) => t.domene)).size > 1

  return (
    <div className="page page--tight finn">
      <div className="finn__controls">
        <TopBar title="Smøreappen" mountains onSettings={() => navigate('/innstillinger')} />
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
                      <TipCard domene={t.domene} tempFra={t.fra} tempTil={t.til} tekst={t.tekst} hentet={t.hentet} />
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
