import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { SelectField } from '../../components/FormParts'
import { TopBar } from '../../components/Navigation'
import { SegmentedControl } from '../../components/SegmentedControl'
import { TextField } from '../../components/TextField'
import { nyId, useDemo, type Ski, type SkiStatus } from '../../demo/DemoStore'
import { SKIMERKER, type Disiplin } from '../../lib/domene'
import '../../styles/page.css'

const tall = (s: string): number | null => {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/** Ski form in the order given by SPEC_NEW.md 5.2. */
export function SkiFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { ski, lagreSki } = useDemo()
  const eksisterende = ski.find((s) => s.id === id)

  const kjentMerke = (m: string) => (SKIMERKER as readonly string[]).includes(m)
  const [navn, setNavn] = useState(eksisterende?.navn ?? '')
  const [disiplin, setDisiplin] = useState<Disiplin>(eksisterende?.disiplin ?? 'skoyting')
  const [merkeValg, setMerkeValg] = useState(eksisterende ? (kjentMerke(eksisterende.merke) ? eksisterende.merke : eksisterende.merke ? 'Annet' : '') : '')
  const [annetMerke, setAnnetMerke] = useState(eksisterende && !kjentMerke(eksisterende.merke) ? eksisterende.merke : '')
  const [modell, setModell] = useState(eksisterende?.modell ?? '')
  const [lengde, setLengde] = useState(eksisterende?.lengdeCm?.toString() ?? '')
  const [arsmodell, setArsmodell] = useState(eksisterende?.arsmodell?.toString() ?? '')
  const [vektFra, setVektFra] = useState(eksisterende?.vektFraKg?.toString() ?? '')
  const [vektTil, setVektTil] = useState(eksisterende?.vektTilKg?.toString() ?? '')
  const [slip, setSlip] = useState(eksisterende?.slip ?? '')
  const [beskrivelse, setBeskrivelse] = useState(eksisterende?.beskrivelse ?? '')
  const [status, setStatus] = useState<SkiStatus>(eksisterende?.status ?? 'aktiv')
  const [forsokt, setForsokt] = useState(false)

  const l = tall(lengde), a = tall(arsmodell), vf = tall(vektFra), vt = tall(vektTil)
  const feil = {
    navn: navn.trim() === '' ? 'Gi skiene et navn, for eksempel «Skøyteski #1».' : undefined,
    lengde: l !== null && (Number.isNaN(l) || l < 100 || l > 250) ? 'Lengden må være mellom 100 og 250 cm.' : undefined,
    arsmodell: a !== null && (Number.isNaN(a) || !/^\d{4}$/.test(arsmodell.trim())) ? 'Skriv årsmodell med fire siffer, for eksempel 2024.' : undefined,
    vekt:
      (vf !== null && Number.isNaN(vf)) || (vt !== null && Number.isNaN(vt))
        ? 'Skriv vekt som tall.'
        : vf !== null && vt !== null && vf > vt
          ? '«Fra» kan ikke være større enn «til».'
          : undefined,
  }
  const harFeil = Object.values(feil).some(Boolean)

  const lagre = (e: FormEvent) => {
    e.preventDefault()
    setForsokt(true)
    if (harFeil) return
    const s: Ski = {
      id: eksisterende?.id ?? nyId(),
      navn: navn.trim(),
      disiplin,
      merke: merkeValg === 'Annet' ? annetMerke.trim() : merkeValg,
      modell: modell.trim(),
      lengdeCm: l,
      arsmodell: a,
      vektFraKg: vf,
      vektTilKg: vt,
      slip: slip.trim(),
      beskrivelse: beskrivelse.trim(),
      status,
    }
    lagreSki(s)
    navigate('/utstyr')
  }

  const vis = (msg?: string) => (forsokt ? msg : undefined)

  return (
    <form className="page" onSubmit={lagre} noValidate>
      <TopBar title={eksisterende ? 'Endre ski' : 'Nye ski'} onBack={() => navigate('/utstyr')} />
      <TextField label="Navn" value={navn} onChange={(e) => setNavn(e.target.value)} error={vis(feil.navn)} />
      <DisciplineToggle value={disiplin} onChange={setDisiplin} />
      <SelectField
        label="Merke"
        value={merkeValg}
        onChange={(e) => setMerkeValg(e.target.value)}
        options={[{ value: '', label: 'Velg merke' }, ...SKIMERKER.map((m) => ({ value: m, label: m })), { value: 'Annet', label: 'Annet' }]}
      />
      {merkeValg === 'Annet' && <TextField label="Annet merke" value={annetMerke} onChange={(e) => setAnnetMerke(e.target.value)} />}
      <TextField label="Modell" value={modell} onChange={(e) => setModell(e.target.value)} />
      <div className="page__row2">
        <TextField label="Lengde (cm)" inputMode="numeric" value={lengde} onChange={(e) => setLengde(e.target.value)} error={vis(feil.lengde)} />
        <TextField label="Årsmodell" inputMode="numeric" maxLength={4} value={arsmodell} onChange={(e) => setArsmodell(e.target.value)} error={vis(feil.arsmodell)} />
      </div>
      <div className="page__row2">
        <TextField label="Vekt fra (kg)" inputMode="decimal" value={vektFra} onChange={(e) => setVektFra(e.target.value)} />
        <TextField label="Vekt til (kg)" inputMode="decimal" value={vektTil} onChange={(e) => setVektTil(e.target.value)} />
      </div>
      {forsokt && feil.vekt && <p className="field__error" role="alert">{feil.vekt}</p>}
      <TextField label="Slip" value={slip} onChange={(e) => setSlip(e.target.value)} hint="For eksempel «Fin lineær»." />
      <TextField label="Beskrivelse" multiline value={beskrivelse} onChange={(e) => setBeskrivelse(e.target.value)} />
      <SegmentedControl<SkiStatus>
        legend="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'aktiv', label: 'Aktiv' },
          { value: 'hvilende', label: 'Hvilende' },
          { value: 'solgt', label: 'Solgt' },
        ]}
      />
      {status === 'solgt' && (
        <p className="help">Solgte ski vises som «Ikke tilgjengelig» og kan ikke velges i nye renn. Historikken beholdes.</p>
      )}
      <div className="page__footer">
        <Button type="submit" size="lg" block>Lagre ski</Button>
      </div>
    </form>
  )
}
