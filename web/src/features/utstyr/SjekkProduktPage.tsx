import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LinkRow, SelectField, SnowRowList, SourceInfo, TempRangeField } from '../../components/FormParts'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { ReviewBanner } from '../../components/States'
import { TextField } from '../../components/TextField'
import { nyId, SKIGO, useDemo, VP50, type Produkt, type SnoRad } from '../../demo/DemoStore'
import { ER_FESTE, ER_GLIDER, KATEGORI, SNOTYPE, options, type Kategori, type Snotype } from '../../lib/domene'
import { formatNumber, parseTemp } from '../../lib/format'
import type { ProduktKilde } from './NyttProduktPage'
import '../../styles/page.css'

type Felt = 'merke' | 'modell' | 'kategori' | 'temp' | 'farge'

const tilTekst = (n: number | null) => (n === null ? '' : formatNumber(n))

/** Example extraction until the real Extractor exists (step 7). */
function utkast(kilde: ProduktKilde | null): { p: Produkt; sjekk: Felt[]; domene: string | null; url: string | null } {
  if (kilde?.type === 'lenke') {
    const p = kilde.url.includes('bull-ski') ? SKIGO : VP50
    return { p: { ...p, id: nyId() }, sjekk: [], domene: p.kildeDomene, url: kilde.url }
  }
  if (kilde?.type === 'bilde') {
    // A photo gives fewer fields. Temperature not found; model and colour uncertain.
    return {
      p: { ...VP50, id: nyId(), tempFra: null, tempTil: null, snoRader: [], kildeDomene: null },
      sjekk: ['modell', 'farge'],
      domene: null,
      url: null,
    }
  }
  return {
    p: {
      id: nyId(), merke: '', modell: '', kategori: 'glider_fast', tempFra: null, tempTil: null, farge: null,
      snotype: null, luftfuktighet: null, smorejernC: null, snoRader: [], kildeDomene: null,
    },
    sjekk: [],
    domene: null,
    url: null,
  }
}

export function SjekkProduktPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { produkter, lagreProdukt } = useDemo()
  const eksisterende = produkter.find((p) => p.id === id)
  const kilde = (location.state as ProduktKilde | null) ?? null

  const [start] = useState(() =>
    eksisterende
      ? { p: eksisterende, sjekk: [] as Felt[], domene: eksisterende.kildeDomene, url: null }
      : utkast(kilde),
  )
  const fraInnhenting = !eksisterende && kilde !== null && kilde.type !== 'manuelt'
  const ikkeFunnet = fraInnhenting ? 'Ikke funnet' : undefined

  const [merke, setMerke] = useState(start.p.merke)
  const [modell, setModell] = useState(start.p.modell)
  const [kategori, setKategori] = useState<Kategori>(start.p.kategori)
  const [fra, setFra] = useState(tilTekst(start.p.tempFra))
  const [til, setTil] = useState(tilTekst(start.p.tempTil))
  const [farge, setFarge] = useState(start.p.farge ?? '')
  const [snotype, setSnotype] = useState(start.p.snotype ?? '')
  const [luftfuktighet, setLuftfuktighet] = useState(start.p.luftfuktighet ?? '')
  const [smorejern, setSmorejern] = useState(start.p.smorejernC?.toString() ?? '')
  const [rader, setRader] = useState<SnoRad[]>(start.p.snoRader)
  const [redigerer, setRedigerer] = useState<string | null>(null)
  const [sjekk, setSjekk] = useState<Felt[]>(start.sjekk)
  const [flere, setFlere] = useState(false)
  const [forsokt, setForsokt] = useState(false)

  // «Sjekk» disappears when the user changes the field.
  const endret = (f: Felt) => setSjekk((s) => s.filter((x) => x !== f))

  const lo = parseTemp(fra), hi = parseTemp(til)
  const tempFeil =
    (fra.trim() && lo === null) || (til.trim() && hi === null)
      ? 'Skriv temperaturen som tall, for eksempel −3.'
      : lo !== null && hi !== null && lo > hi
        ? '«Fra» kan ikke være høyere enn «til».'
        : undefined
  const feil = {
    merke: merke.trim() ? undefined : 'Skriv merket.',
    modell: modell.trim() ? undefined : 'Skriv modellen.',
    temp: tempFeil,
  }

  const lagre = () => {
    setForsokt(true)
    if (Object.values(feil).some(Boolean) || redigerer) return
    const erFeste = ER_FESTE.includes(kategori)
    const erGlider = ER_GLIDER.includes(kategori)
    lagreProdukt({
      ...start.p,
      merke: merke.trim(),
      modell: modell.trim(),
      kategori,
      tempFra: lo,
      tempTil: hi,
      farge: erFeste ? farge.trim() || null : null,
      snoRader: erFeste ? rader : [],
      snotype: erGlider ? snotype.trim() || null : null,
      luftfuktighet: erGlider ? luftfuktighet.trim() || null : null,
      smorejernC: erGlider && smorejern.trim() ? Number(smorejern) : null,
    })
    navigate('/utstyr?fane=produkter')
  }

  const vis = (m?: string) => (forsokt ? m : undefined)
  const tittel = eksisterende ? 'Endre produkt' : fraInnhenting ? 'Sjekk produktet' : 'Nytt produkt'

  return (
    <div className="page">
      <TopBar title={tittel} onBack={() => navigate(-1)} />
      {fraInnhenting && start.domene && start.url && <SourceInfo domene={start.domene} url={start.url} />}
      {fraInnhenting && kilde?.type === 'bilde' && (
        <div className="source-info"><Icon name="camera" /><span className="source-info__text"><span className="source-info__title">Lest fra bilde</span><span className="help">Bildet er ikke lagret</span></span></div>
      )}
      {fraInnhenting && <ReviewBanner uncertain={sjekk.length} />}

      <TextField label="Merke" value={merke} placeholder={ikkeFunnet} check={sjekk.includes('merke')}
        onChange={(e) => { setMerke(e.target.value); endret('merke') }} error={vis(feil.merke)} />
      <TextField label="Modell" value={modell} placeholder={ikkeFunnet} check={sjekk.includes('modell')}
        onChange={(e) => { setModell(e.target.value); endret('modell') }} error={vis(feil.modell)} />
      <SelectField
        label="Kategori"
        value={kategori}
        onChange={(e) => { setKategori(e.target.value as Kategori); endret('kategori') }}
        options={options(KATEGORI)}
      />
      <TempRangeField
        label="Temperaturområde (°C)"
        from={fra}
        to={til}
        onFrom={(v) => { setFra(v); endret('temp') }}
        onTo={(v) => { setTil(v); endret('temp') }}
        error={vis(feil.temp)}
      />

      {ER_FESTE.includes(kategori) && (
        <>
          <TextField label="Farge" value={farge} placeholder={ikkeFunnet} check={sjekk.includes('farge')}
            onChange={(e) => { setFarge(e.target.value); endret('farge') }} />
          <SnowRowList
            rows={rader}
            editingId={redigerer}
            onEdit={setRedigerer}
            onRemove={(rid) => setRader(rader.filter((r) => r.id !== rid))}
            onAdd={() => {
              const ny: SnoRad = { id: nyId(), tekst: '', tags: [], fra: -3, til: 0 }
              setRader([...rader, ny])
              setRedigerer(ny.id)
            }}
            renderEdit={(rid) => (
              <SnoRadRedigering
                rad={rader.find((r) => r.id === rid)!}
                onFerdig={(r) => { setRader(rader.map((x) => (x.id === r.id ? r : x))); setRedigerer(null) }}
              />
            )}
          />
        </>
      )}

      {ER_GLIDER.includes(kategori) && (
        <>
          <button type="button" className="more" aria-expanded={flere} aria-controls="glider-detaljer" onClick={() => setFlere(!flere)}>
            Flere detaljer
            <Icon name="chevronDown" />
          </button>
          {flere && (
            <div id="glider-detaljer" className="more__body">
              <TextField label="Snøtype" value={snotype} placeholder={ikkeFunnet} onChange={(e) => setSnotype(e.target.value)} />
              <TextField label="Luftfuktighet" value={luftfuktighet} placeholder={ikkeFunnet} onChange={(e) => setLuftfuktighet(e.target.value)} />
              <TextField label="Smørejern (°C)" inputMode="numeric" value={smorejern} placeholder={ikkeFunnet} onChange={(e) => setSmorejern(e.target.value)} />
            </div>
          )}
        </>
      )}

      <LinkRow
        icon="file"
        title="Produktbeskrivelse"
        sub={start.domene ? '1 nettside lagt til' : 'Ingen nettsider lagt til'}
        onClick={() => navigate('/utstyr/produkter/beskrivelse')}
      />
      {forsokt && redigerer && <p className="field__error" role="alert"><Icon name="alert" size={18} />Gjør ferdig snøtype-raden før du lagrer.</p>}
      <div className="page__footer">
        <Button size="lg" block onClick={lagre}>Lagre produkt</Button>
      </div>
    </div>
  )
}

function SnoRadRedigering({ rad, onFerdig }: { rad: SnoRad; onFerdig: (r: SnoRad) => void }) {
  const [tekst, setTekst] = useState(rad.tekst)
  const [tags, setTags] = useState<Snotype[]>(rad.tags)
  const [fra, setFra] = useState(formatNumber(rad.fra))
  const [til, setTil] = useState(formatNumber(rad.til))
  const [feil, setFeil] = useState<string | undefined>()

  const ferdig = () => {
    const lo = parseTemp(fra), hi = parseTemp(til)
    if (!tekst.trim()) return setFeil('Beskriv snøen, for eksempel «Ny og nyfallen finkornet».')
    if (lo === null || hi === null) return setFeil('Skriv begge temperaturene som tall.')
    if (lo > hi) return setFeil('«Fra» kan ikke være høyere enn «til».')
    onFerdig({ ...rad, tekst: tekst.trim(), tags, fra: lo, til: hi })
  }

  return (
    <div className="snow-edit">
      <TextField label="Snø" value={tekst} onChange={(e) => setTekst(e.target.value)} />
      <PickRow label="Gjelder snøtyper" multiple options={options(SNOTYPE)} value={tags} onChange={setTags} />
      <TempRangeField label="Temperatur (°C)" from={fra} to={til} onFrom={setFra} onTo={setTil} error={feil} />
      <Button variant="secondary" icon="check" onClick={ferdig}>Ferdig</Button>
    </div>
  )
}
