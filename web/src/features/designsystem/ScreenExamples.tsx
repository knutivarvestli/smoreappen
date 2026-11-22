import { useState, type ReactNode } from 'react'
import { Button, IconButton } from '../../components/Button'
import { ExperienceResultCard, SkiCard, TipCard } from '../../components/Cards'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { LinkRow, SelectField, SnowRowList, SourceInfo, TempRangeField, type SnowRow } from '../../components/FormParts'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { ConditionsSummary, StepProgress, WaxLayerList } from '../../components/RaceParts'
import { ReviewBanner } from '../../components/States'
import { TemperatureInput } from '../../components/TemperatureInput'
import { TextField } from '../../components/TextField'
import { SNOOPPRINNELSE, SNOTYPE, options, type Disiplin, type Snoopprinnelse, type Snotype } from '../../lib/domene'
import './ScreenExamples.css'

// Static examples of the screens in docs/design. Example data only;
// all wax is fluor-free, so the screenshots' fluor texts are replaced.
const noop = () => undefined

export function ScreenExamples() {
  return (
    <div className="examples">
      <Frame title="Søk"><FinnExample /></Frame>
      <Frame title="Nytt produkt"><NyttProduktExample /></Frame>
      <Frame title="Mine ski"><MineSkiExample /></Frame>
      <Frame title="Sjekk produktet"><SjekkProduktExample /></Frame>
      <Frame title="Nytt renn · smøring"><NyttRennExample /></Frame>
    </div>
  )
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="frame">
      <figcaption className="label">{title}</figcaption>
      <div className="frame__screen">{children}</div>
    </figure>
  )
}

function FinnExample() {
  const [disiplin, setDisiplin] = useState<Disiplin>('skoyting')
  const [temp, setTemp] = useState<number | null>(-7)
  const [sno, setSno] = useState<Snotype[]>(['finkornet'])
  const [opp, setOpp] = useState<Snoopprinnelse | null>('kunstsno')
  return (
    <div className="screen">
      <TopBar title="Søk" brand mountains onSettings={noop} />
      <DisciplineToggle value={disiplin} onChange={setDisiplin} />
      <TemperatureInput label="Lufttemperatur" value={temp} onChange={setTemp} />
      <PickRow label="Snøtype" icon="snowflake" multiple options={options(SNOTYPE)} value={sno} onChange={setSno} />
      <PickRow label="Snøopprinnelse" icon="mountain" options={options(SNOOPPRINNELSE)} value={opp} onChange={setOpp} />
      <h2 className="screen__group">Min erfaring</h2>
      <ExperienceResultCard oppskrift="Blå blokk + kaldpulver (eksempel)" konfidens="solid" antallRenn={6} sistBrukt="14. feb." />
      <h2 className="screen__group">Andres erfaringer</h2>
      <TipCard domene="eksempel-smoring.no" tempFra={-8} tempTil={-3} tekst="Blokk i to lag, børst, pulver øverst." hentet="3. jan. 2026" />
    </div>
  )
}

function NyttProduktExample() {
  return (
    <div className="screen">
      <TopBar title="Nytt produkt" onBack={noop} />
      <div className="field">
        <label htmlFor="ex-lenke" className="label field__label with-icon"><Icon name="link" size={16} />Lenke til produktside</label>
        <input id="ex-lenke" className="field__control" type="url" inputMode="url" defaultValue="https://bull-ski-kajakk.no/ski/skismoring/glider" />
      </div>
      <Button size="lg" block icon="download">Hent produkt</Button>
      <p className="screen__or help">eller</p>
      <Button variant="secondary" size="lg" block icon="camera">Ta bilde av eske eller etikett</Button>
      <Button variant="tertiary" block>Legg inn manuelt</Button>
    </div>
  )
}

function MineSkiExample() {
  return (
    <div className="screen">
      <TopBar title="Mine ski" actions={<IconButton icon="plus" label="Legg til ski" />} />
      <ul className="screen__list">
        <li><SkiCard navn="Skøyteski #1 (renn)" disiplin="skoyting" lengdeCm={191} vektFraKg={75} vektTilKg={85} arsmodell={2025} status="aktiv" /></li>
        <li><SkiCard navn="Skøyteski #2 (trening)" disiplin="skoyting" lengdeCm={191} vektFraKg={75} vektTilKg={85} arsmodell={2023} status="aktiv" /></li>
        <li><SkiCard navn="Klassiske #1" disiplin="klassisk" lengdeCm={201} vektFraKg={70} vektTilKg={80} arsmodell={2024} status="aktiv" /></li>
        <li><SkiCard navn="Klassiske #2 (reserve)" disiplin="klassisk" lengdeCm={201} vektFraKg={70} vektTilKg={80} arsmodell={2021} status="solgt" /></li>
      </ul>
    </div>
  )
}

function SjekkProduktExample() {
  const [fra, setFra] = useState('−3')
  const [til, setTil] = useState('0')
  const [rows, setRows] = useState<SnowRow[]>([
    { id: '1', tekst: 'Ny og nyfallen finkornet', fra: -3, til: 0 },
    { id: '2', tekst: 'Gammel eller delvis omdannet', fra: -6, til: -1 },
  ])
  return (
    <div className="screen">
      <TopBar title="Sjekk produktet" onBack={noop} />
      <SourceInfo domene="sportenbeitostolen.no" url="https://sportenbeitostolen.no" />
      <ReviewBanner uncertain={0} />
      <TextField label="Merke" defaultValue="Swix" />
      <TextField label="Modell" defaultValue="VP50 Pro" />
      <SelectField
        label="Kategori"
        defaultValue="festevoks"
        options={[
          { value: 'glider_fast', label: 'Glider (fast)' },
          { value: 'glider_flytende', label: 'Glider (flytende)' },
          { value: 'pulver', label: 'Pulver' },
          { value: 'festevoks', label: 'Festevoks' },
          { value: 'klister', label: 'Klister' },
          { value: 'bindevoks', label: 'Bindevoks' },
          { value: 'rens', label: 'Rens' },
          { value: 'verktoy', label: 'Verktøy' },
        ]}
      />
      <TempRangeField label="Temperaturområde (°C)" from={fra} to={til} onFrom={setFra} onTo={setTil} />
      <TextField label="Farge" defaultValue="Lys fiolett" />
      <SnowRowList rows={rows} onEdit={noop} onRemove={(id) => setRows(rows.filter((r) => r.id !== id))} onAdd={noop} />
      <LinkRow icon="file" title="Produktbeskrivelse" sub="1 nettside lagt til" onClick={noop} />
      <Button size="lg" block>Lagre produkt</Button>
    </div>
  )
}

function NyttRennExample() {
  return (
    <div className="screen">
      <TopBar title="Nytt renn" onBack={noop} />
      <StepProgress current={3} total={4} label="Smøring" />
      <Button variant="secondary" block icon="copy">Kopier fra forrige renn</Button>
      <ConditionsSummary disiplin="klassisk" lufttemp={-2} snotyper={['finkornet']} onEdit={noop} />
      <SelectField label="Ski" options={[{ value: '1', label: 'Klassiske #1' }, { value: '2', label: 'Klassiske #2' }]} />
      <WaxLayerList rolle="rill" layers={[]} onAdd={noop} />
      <WaxLayerList rolle="glid" layers={[]} onAdd={noop} />
      <WaxLayerList rolle="feste" layers={[]} onAdd={noop} />
      <Button size="lg" block>Neste</Button>
    </div>
  )
}
