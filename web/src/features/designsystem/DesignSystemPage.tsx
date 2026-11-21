import { useState, type ReactNode } from 'react'
import { Button, FloatingAddButton, IconButton } from '../../components/Button'
import { ConfidenceBadge, FlagBadge, SourceBadge, StatusBadge } from '../../components/Badges'
import { DisciplineTag, DisciplineToggle } from '../../components/DisciplineToggle'
import { MountainSilhouette } from '../../components/MountainSilhouette'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { SegmentedControl } from '../../components/SegmentedControl'
import { EmptyState, ErrorState, LoadingState, OfflineNotice, ReviewBanner } from '../../components/States'
import { TemperatureInput } from '../../components/TemperatureInput'
import { PasswordField, TextField } from '../../components/TextField'
import {
  GLID_MOT_FELT, SNOOPPRINNELSE, SNOTYPE, options,
  type Disiplin, type GlidMotFelt, type Snoopprinnelse, type Snotype,
} from '../../lib/domene'
import { formatTemp, formatTempRange } from '../../lib/format'
import { applyTheme, loadTheme, type Theme } from '../../lib/theme'
import { ScreenExamples } from './ScreenExamples'
import './DesignSystemPage.css'

const SWATCHES: { name: string; token: string; light: string; dark: string }[] = [
  { name: 'Bakgrunn («snø»)', token: '--bg', light: '#F3F7FA', dark: '#0D1620' },
  { name: 'Overflate', token: '--surface', light: '#FFFFFF', dark: '#16232F' },
  { name: 'Tekst (skifer)', token: '--text', light: '#14212E', dark: '#E9F0F6' },
  { name: 'Sekundærtekst', token: '--text-2', light: '#4A5B6B', dark: '#A5B6C5' },
  { name: 'Kantlinje («rim»)', token: '--border', light: '#C3D0DB', dark: '#34495B' },
  { name: 'Primær (fjellmarine)', token: '--primary', light: '#14304F', dark: '#8EC5EC' },
  { name: 'Isblå (valgt)', token: '--ice', light: '#DCEBF6', dark: '#1D3447' },
  { name: 'Klassisk (rav)', token: '--klassisk', light: '#9A5410', dark: '#F0B261' },
  { name: 'Skøyting (furu)', token: '--skoyting', light: '#0B6E6C', dark: '#5FD1CC' },
  { name: 'Andres erfaringer', token: '--web', light: '#3F5A73', dark: '#A9C0D6' },
  { name: 'Min erfaring', token: '--mine', light: '#0B6E6C', dark: '#5FD1CC' },
  { name: 'Godkjent', token: '--ok', light: '#1D5A22', dark: '#8FD694' },
  { name: 'Utkast/advarsel', token: '--warn', light: '#7A4108', dark: '#F0B261' },
  { name: 'Feil', token: '--error', light: '#A32D2D', dark: '#F09595' },
]

/** Living style guide (prototype 00-designsystem). */
export function DesignSystemPage() {
  const [theme, setTheme] = useState<Theme>(loadTheme())
  const [disiplin, setDisiplin] = useState<Disiplin>('skoyting')
  const [lufttemp, setLufttemp] = useState<number | null>(-7)
  const [snotemp, setSnotemp] = useState<number | null>(null)
  const [snotyper, setSnotyper] = useState<Snotype[]>(['finkornet'])
  const [opprinnelse, setOpprinnelse] = useState<Snoopprinnelse | null>('kunstsno')
  const [glid, setGlid] = useState<GlidMotFelt | null>(null)
  const [step, setStep] = useState(1)

  const changeTheme = (t: Theme) => {
    setTheme(t)
    applyTheme(t)
  }

  return (
    <div className="ds">
      <TopBar title="Designsystem" />
      <p className="text-2">Vinter og fjell. Komponentene her brukes på alle skjermene.</p>

      <Section title="Tema">
        <SegmentedControl<Theme>
          legend="Tema"
          value={theme}
          onChange={changeTheme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'lys', label: 'Lys' },
            { value: 'mork', label: 'Mørk' },
          ]}
        />
      </Section>

      <Section title="Farger">
        <ul className="ds__swatches">
          {SWATCHES.map((s) => (
            <li key={s.token} className="ds__swatch">
              <span className={`ds__chip ds__chip--${s.token.slice(2)}`} aria-hidden="true" />
              <span>
                <strong>{s.name}</strong>
                <span className="help num"> {s.light} / {s.dark}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typografi">
        <p className="ds__display num">{formatTemp(-7)}</p>
        <h1>Tittel: Nytt renn</h1>
        <h2>Overskrift: Min erfaring</h2>
        <p>Brødtekst: Hardvoks i tre tynne lag, kork mellom hvert lag.</p>
        <p className="help">Hjelpetekst: Lenken gjelder i 30 minutter.</p>
        <p className="label">Etikett: Lufttemperatur</p>
        <p className="num">Tabulære sifre: {formatTempRange(-8, -3)} · {formatTempRange(0, 2)} · {formatTemp(-12.5)}</p>
      </Section>

      <Section title="Knapper">
        <div className="ds__row">
          <Button icon="check">Lagre produkt</Button>
          <Button variant="secondary">Kopier fra forrige renn</Button>
          <Button variant="tertiary">Flere detaljer</Button>
          <Button variant="destructive" icon="x">Forkast</Button>
          <Button disabled>Lagre</Button>
        </div>
        <Button size="lg" block icon="search">Hent tips</Button>
        <div className="ds__row">
          <IconButton icon="settings" label="Innstillinger" />
          <IconButton icon="refresh" label="Oppdater" />
          <FloatingAddButton label="Logg nytt renn" />
        </div>
      </Section>

      <Section title="Disiplin">
        <DisciplineToggle value={disiplin} onChange={setDisiplin} />
        <div className="ds__row">
          <DisciplineTag value="klassisk" />
          <DisciplineTag value="skoyting" />
        </div>
      </Section>

      <Section title="Temperatur">
        <TemperatureInput label="Lufttemperatur" value={lufttemp} onChange={setLufttemp} />
        <TemperatureInput label="Snøtemperatur" value={snotemp} onChange={setSnotemp} optional startAt={-3} max={0} />
      </Section>

      <Section title="Listevalg">
        <PickRow label="Snøtype" multiple options={options(SNOTYPE)} value={snotyper} onChange={setSnotyper} />
        <PickRow label="Snøopprinnelse" options={options(SNOOPPRINNELSE)} value={opprinnelse} onChange={setOpprinnelse} />
        <SegmentedControl<GlidMotFelt>
          legend="Glid mot feltet"
          options={options(GLID_MOT_FELT)}
          value={glid}
          onChange={setGlid}
        />
      </Section>

      <Section title="Tekstfelt">
        <TextField label="Navn" placeholder="Skøyteski #1 (renn)" />
        <TextField label="Modell" defaultValue="VP50 Pro" check hint="Appen var usikker på dette feltet." />
        <TextField label="Lengde (cm)" inputMode="numeric" defaultValue="19" error="Lengden må være mellom 100 og 250 cm." />
        <TextField label="Beskrivelse" multiline />
        <TextField label="E-post" type="email" autoComplete="username" />
        <PasswordField label="Passord" autoComplete="current-password" />
      </Section>

      <Section title="Merker">
        <div className="ds__row">
          <StatusBadge status="utkast" />
          <StatusBadge status="godkjent" />
          <StatusBadge status="forkastet" />
        </div>
        <div className="ds__row">
          <ConfidenceBadge level="solid" />
          <ConfidenceBadge level="noe" />
          <ConfidenceBadge level="ett" />
        </div>
        <div className="ds__row">
          <FlagBadge kind="passer" />
          <FlagBadge kind="annen_sno" />
          <FlagBadge kind="utenfor" />
          <FlagBadge kind="sjekk" />
        </div>
        <div className="ds__row">
          <SourceBadge kind="min" />
          <SourceBadge kind="andres" domain="eksempel-smoring.no" />
        </div>
      </Section>

      <Section title="Tilstander">
        <ReviewBanner uncertain={0} />
        <ReviewBanner uncertain={2} />
        <OfflineNotice />
        <EmptyState
          title="Ingen godkjente tips for disse forholdene"
          action={<Button variant="secondary" icon="plus">Legg til kilde</Button>}
        >
          Legg til flere kilder?
        </EmptyState>
        <ErrorState title="Siden kunne ikke hentes" onRetry={() => undefined}>
          Sjekk at lenken er riktig, eller prøv igjen om litt.
        </ErrorState>
        <LoadingState steps={['Henter side', 'Leser innhold', 'Trekker ut tips']} current={step} />
        <Button variant="tertiary" onClick={() => setStep((step + 1) % 4)}>Vis neste trinn</Button>
        <LoadingState />
      </Section>

      <Section title="Fjellsilhuett">
        <div className="ds__mountains"><MountainSilhouette /></div>
      </Section>

      <section className="ds__section ds__section--wide" id="eksempler">
        <h2>Skjermeksempler</h2>
        <p className="text-2">Statiske eksempler bygget fra skjermbildene i docs/design. Eksempeldata, ikke ekte anbefalinger.</p>
        <ScreenExamples />
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ds__section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
