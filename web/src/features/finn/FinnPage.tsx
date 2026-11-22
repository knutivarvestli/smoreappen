import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { TemperatureInput } from '../../components/TemperatureInput'
import { useDemo } from '../../demo/DemoStore'
import { SNOOPPRINNELSE, SNOTYPE, options, type Disiplin } from '../../lib/domene'
import { lagreDisiplin } from '../../lib/prefs'
import '../../components/FormParts.css'
import '../../styles/page.css'
import './FinnPage.css'

export const YR_URL = 'https://www.yr.no/nb'

/** Main page («Søk»): choose conditions, then search. Results open in their own view. */
export function FinnPage() {
  const navigate = useNavigate()
  const { sok, settSok } = useDemo()

  const velgDisiplin = (d: Disiplin) => {
    settSok({ disiplin: d })
    lagreDisiplin(d)
  }

  return (
    <form
      className="page page--tight sok"
      onSubmit={(e) => {
        e.preventDefault()
        navigate('/resultater')
      }}
    >
      <TopBar title="Søk" brand mountains onSettings={() => navigate('/innstillinger')} />
      <DisciplineToggle value={sok.disiplin} onChange={velgDisiplin} />
      <TemperatureInput label="Lufttemperatur" value={sok.temp} onChange={(t) => settSok({ temp: t })} />
      <PickRow label="Snøtype" icon="snowflake" multiple options={options(SNOTYPE)} value={sok.snotyper} onChange={(s) => settSok({ snotyper: s })} />
      <PickRow label="Snøopprinnelse" icon="mountain" options={options(SNOOPPRINNELSE)} value={sok.opprinnelse} onChange={(o) => settSok({ opprinnelse: o })} />
      <a className="link-row" href={YR_URL} target="_blank" rel="noopener noreferrer">
        <Icon name="cloud" />
        <span className="link-row__text">
          <span className="link-row__title">Se værmeldingen på yr.no</span>
          <span className="help">Åpnes i ny fane</span>
        </span>
        <Icon name="external" />
      </a>
      <Button type="submit" size="lg" block icon="search" className="sok__knapp">Søk</Button>
    </form>
  )
}
