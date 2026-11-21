import { useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlagBadge, type FlagKind } from '../../components/Badges'
import { Button } from '../../components/Button'
import { ProductCard } from '../../components/Cards'
import { DisciplineToggle } from '../../components/DisciplineToggle'
import { SelectField } from '../../components/FormParts'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { PickRow } from '../../components/PickRow'
import { ConditionsSummary, StepProgress, WaxLayerList, type WaxLayer } from '../../components/RaceParts'
import { RatingStars } from '../../components/RatingStars'
import { SegmentedControl } from '../../components/SegmentedControl'
import { EmptyState } from '../../components/States'
import { TemperatureInput } from '../../components/TemperatureInput'
import { TextField } from '../../components/TextField'
import { nyId, useDemo, type Produkt } from '../../demo/DemoStore'
import {
  FESTE, FUKTIGHET, GLID_MOT_FELT, KATEGORI, LOYPEHARDHET, METODE, RENNTYPE, ROLLE_KATEGORIER, SNOOPPRINNELSE, SNOTYPE,
  VURDERING_SIKKERHET, options,
  type Disiplin, type Feste, type Fuktighet, type GlidMotFelt, type Kategori, type Loypehardhet, type Metode,
  type Renntype, type Rolle, type Snoopprinnelse, type Snotype, type VurderingSikkerhet,
} from '../../lib/domene'
import { byFit, fit, type Fit } from '../../lib/fit'
import { lagretDisiplin } from '../../lib/prefs'
import '../../styles/page.css'

type Lag = { id: string; produktId: string; metode: Metode | null; strykertempC: number | null }
type SkiLag = Record<Rolle, Lag[]>
type Vurdering = {
  glid: GlidMotFelt | null
  feste: Feste | null
  stjernerGlid: number | null
  stjernerFeste: number | null
  sikkerhet: VurderingSikkerhet | null
  notat: string
}

const STEG = ['Forhold', 'Velg ski', 'Smøring', 'Vurdering'] as const
const tomtLag = (): SkiLag => ({ rill: [], glid: [], feste: [] })
const tomVurdering = (): Vurdering => ({ glid: null, feste: null, stjernerGlid: null, stjernerFeste: null, sikkerhet: null, notat: '' })

const STANDARD_METODE: Partial<Record<Kategori, Metode>> = {
  glider_fast: 'stryk_pa',
  glider_flytende: 'tynt_lag',
  pulver: 'pulver',
  festevoks: 'kork_inn',
  klister: 'tynt_lag',
  bindevoks: 'stryk_pa',
}

const FLAGG: Record<Fit, FlagKind | null> = { ok: 'passer', snow: 'annen_sno', no: 'utenfor', na: null }
const ROLLE_NAVN: Record<Rolle, string> = { rill: 'rill', glid: 'glid', feste: 'feste' }

const iDag = () => new Date().toISOString().slice(0, 10)

/** Step form for a new race (SPEC_NEW.md 5.5). Prototype: kept in memory only. */
export function NyttRennPage() {
  const navigate = useNavigate()
  const { ski, produkter } = useDemo()
  const toppRef = useRef<HTMLDivElement>(null)

  const [steg, setSteg] = useState(1)
  const [ferdig, setFerdig] = useState<null | 'med' | 'uten'>(null)

  // Step 1
  const [dato, setDato] = useState(iDag())
  const [sted, setSted] = useState('')
  const [renntype, setRenntype] = useState<Renntype>('renn')
  const [disiplin, setDisiplinRaw] = useState<Disiplin>(lagretDisiplin())
  const [lufttemp, setLufttemp] = useState<number | null>(-5)
  const [snotemp, setSnotemp] = useState<number | null>(null)
  const [snotyper, setSnotyper] = useState<Snotype[]>([])
  const [opprinnelse, setOpprinnelse] = useState<Snoopprinnelse | null>(null)
  const [fuktighet, setFuktighet] = useState<Fuktighet | null>(null)
  const [hardhet, setHardhet] = useState<Loypehardhet | null>(null)
  const [notat, setNotat] = useState('')
  const [flere, setFlere] = useState(false)

  // Step 2–4
  const [valgte, setValgte] = useState<string[]>([])
  const [skiFeil, setSkiFeil] = useState(false)
  const [aktivSki, setAktivSki] = useState<string | null>(null)
  const [lag, setLag] = useState<Record<string, SkiLag>>({})
  const [vurdering, setVurdering] = useState<Record<string, Vurdering>>({})

  // Sub views in step 3
  const [velger, setVelger] = useState<Rolle | null>(null)
  const [aapentLag, setAapentLag] = useState<{ rolle: Rolle; id: string } | null>(null)

  useEffect(() => {
    toppRef.current?.scrollIntoView({ block: 'start' })
  }, [steg, velger, aapentLag, ferdig])

  // Switching to skate removes grip layers (grip is classic only).
  const setDisiplin = (d: Disiplin) => {
    setDisiplinRaw(d)
    setValgte((v) => v.filter((id) => ski.find((s) => s.id === id)?.disiplin === d))
    if (d === 'skoyting') {
      setLag((l) => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, { ...v, feste: [] }])))
    }
  }

  const kopierForrige = () => {
    setSted('Sjusjøen')
    setRenntype('renn')
    setDisiplin('klassisk')
    setLufttemp(-2)
    setSnotyper(['finkornet'])
    setOpprinnelse('naturlig')
  }

  const aktiv = aktivSki && valgte.includes(aktivSki) ? aktivSki : valgte[0] ?? null
  const lagFor = (skiId: string) => lag[skiId] ?? tomtLag()
  const produkt = (pid: string) => produkter.find((p) => p.id === pid)
  const roller: Rolle[] = disiplin === 'klassisk' ? ['rill', 'glid', 'feste'] : ['rill', 'glid']

  const neste = () => {
    if (steg === 2 && valgte.length === 0) {
      setSkiFeil(true)
      return
    }
    setSteg(steg + 1)
  }
  const tilbake = () => (steg === 1 ? navigate(-1) : setSteg(steg - 1))

  const leggTil = (p: Produkt) => {
    if (!aktiv || !velger) return
    const nytt: Lag = { id: nyId(), produktId: p.id, metode: STANDARD_METODE[p.kategori] ?? null, strykertempC: p.smorejernC }
    const l = lagFor(aktiv)
    setLag({ ...lag, [aktiv]: { ...l, [velger]: [...l[velger], nytt] } })
    setVelger(null)
  }

  const endreLag = (rolle: Rolle, f: (liste: Lag[]) => Lag[]) => {
    if (!aktiv) return
    const l = lagFor(aktiv)
    setLag({ ...lag, [aktiv]: { ...l, [rolle]: f(l[rolle]) } })
  }

  // ---------- Done ----------
  if (ferdig) {
    return (
      <div className="page" ref={toppRef}>
        <TopBar title="Rennet er logget" />
        <EmptyState
          icon={ferdig === 'med' ? 'check' : 'flag'}
          title={ferdig === 'med' ? 'Rennet er lagret med vurdering' : 'Rennet er lagret. Vurderingen mangler.'}
          action={<Button onClick={() => navigate('/')}>Gå til Finn</Button>}
        >
          {ferdig === 'uten'
            ? 'Fyll ut vurderingen etter rennet mens inntrykket er ferskt. Rennet vises som «Mangler vurdering» i lista.'
            : 'Jo flere renn du logger, jo bedre blir anbefalingene.'}
          {' '}Prototype: ingenting er lagret ennå.
        </EmptyState>
      </div>
    )
  }

  // ---------- Product picker ----------
  if (velger && aktiv) {
    return <ProduktVelger rolle={velger} produkter={produkter} lufttemp={lufttemp} snotyper={snotyper}
      onVelg={leggTil} onTilbake={() => setVelger(null)} toppRef={toppRef} />
  }

  // ---------- Open layer ----------
  if (aapentLag && aktiv) {
    const liste = lagFor(aktiv)[aapentLag.rolle]
    const idx = liste.findIndex((l) => l.id === aapentLag.id)
    const l = liste[idx]
    if (l) {
      const p = produkt(l.produktId)
      return (
        <div className="page" ref={toppRef}>
          <TopBar title={`Lag ${idx + 1} · ${ROLLE_NAVN[aapentLag.rolle]}`} onBack={() => setAapentLag(null)} />
          <p><strong>{p ? `${p.merke} ${p.modell}` : 'Ukjent produkt'}</strong></p>
          <PickRow<Metode>
            label="Metode"
            options={options(METODE)}
            value={l.metode}
            onChange={(m) => endreLag(aapentLag.rolle, (ls) => ls.map((x) => (x.id === l.id ? { ...x, metode: m } : x)))}
          />
          <TextField
            label="Smørejern (°C)"
            inputMode="numeric"
            value={l.strykertempC?.toString() ?? ''}
            placeholder="Ikke oppgitt"
            onChange={(e) => {
              const v = e.target.value.trim()
              const n = v === '' ? null : Number(v)
              endreLag(aapentLag.rolle, (ls) => ls.map((x) => (x.id === l.id ? { ...x, strykertempC: Number.isFinite(n) ? n : x.strykertempC } : x)))
            }}
          />
          <Button variant="secondary" icon="arrowUp" disabled={idx === 0}
            onClick={() => endreLag(aapentLag.rolle, (ls) => { const c = [...ls]; [c[idx - 1], c[idx]] = [c[idx], c[idx - 1]]; return c })}>
            Flytt opp
          </Button>
          <Button variant="destructive" icon="x"
            onClick={() => { endreLag(aapentLag.rolle, (ls) => ls.filter((x) => x.id !== l.id)); setAapentLag(null) }}>
            Fjern lag
          </Button>
          <div className="page__footer">
            <Button size="lg" block onClick={() => setAapentLag(null)}>Ferdig</Button>
          </div>
        </div>
      )
    }
  }

  const skiForDisiplin = ski.filter((s) => s.disiplin === disiplin)
  const valgtSkiListe = valgte.map((id) => ski.find((s) => s.id === id)!).filter(Boolean)

  return (
    <div className="page" ref={toppRef}>
      <TopBar title="Nytt renn" onBack={tilbake} />
      <StepProgress current={steg} total={4} label={STEG[steg - 1]} />

      {steg === 1 && (
        <>
          <Button variant="secondary" block icon="copy" onClick={kopierForrige}>Kopier fra forrige renn</Button>
          <div className="page__row2">
            <TextField label="Dato" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
            <TextField label="Sted" value={sted} onChange={(e) => setSted(e.target.value)} />
          </div>
          <SegmentedControl<Renntype> legend="Type" options={options(RENNTYPE)} value={renntype} onChange={setRenntype} />
          <DisciplineToggle value={disiplin} onChange={setDisiplin} />
          <TemperatureInput label="Lufttemperatur" value={lufttemp} onChange={setLufttemp} />
          <PickRow label="Snøtype" icon="snowflake" multiple options={options(SNOTYPE)} value={snotyper} onChange={setSnotyper} />
          <PickRow label="Snøopprinnelse" icon="mountain" options={options(SNOOPPRINNELSE)} value={opprinnelse} onChange={setOpprinnelse} />
          <button type="button" className="more" aria-expanded={flere} aria-controls="renn-detaljer" onClick={() => setFlere(!flere)}>
            Flere detaljer
            <Icon name="chevronDown" />
          </button>
          {flere && (
            <div id="renn-detaljer" className="more__body">
              <TemperatureInput label="Snøtemperatur" value={snotemp} onChange={setSnotemp} optional startAt={-3} max={0} />
              <PickRow label="Fuktighet" options={options(FUKTIGHET)} value={fuktighet} onChange={setFuktighet} />
              <PickRow label="Løypehardhet" options={options(LOYPEHARDHET)} value={hardhet} onChange={setHardhet} />
              <TextField label="Notat" multiline value={notat} onChange={(e) => setNotat(e.target.value)} />
            </div>
          )}
        </>
      )}

      {steg === 2 && (
        <fieldset className="more__body ski-velg">
          <legend className="label field__label">Velg ett eller flere par ({disiplin === 'klassisk' ? 'klassisk' : 'skøyting'})</legend>
          {skiForDisiplin.length === 0 && (
            <EmptyState title="Ingen ski for denne disiplinen" icon="ski"
              action={<Button variant="secondary" icon="plus" onClick={() => navigate('/utstyr/ski/ny')}>Legg til ski</Button>} />
          )}
          {skiForDisiplin.map((s) => {
            const solgt = s.status === 'solgt'
            const on = valgte.includes(s.id)
            return (
              <label key={s.id} className={`choice ${on ? 'is-checked' : ''} ${solgt ? 'is-disabled' : ''}`}>
                <input
                  type="checkbox"
                  className="visually-hidden"
                  checked={on}
                  disabled={solgt}
                  aria-describedby={solgt ? `solgt-${s.id}` : undefined}
                  onChange={() => { setSkiFeil(false); setValgte(on ? valgte.filter((x) => x !== s.id) : [...valgte, s.id]) }}
                />
                <span className="choice__box" aria-hidden="true">{on && <Icon name="check" size={18} />}</span>
                <span className="choice__text">
                  <span>{s.navn}</span>
                  <span className="help num">{[s.lengdeCm && `${s.lengdeCm} cm`, s.arsmodell].filter(Boolean).join(' · ')}</span>
                </span>
                {solgt && <span id={`solgt-${s.id}`} className="chip-muted"><Icon name="lock" size={16} />Ikke tilgjengelig</span>}
              </label>
            )
          })}
          {skiFeil && <p className="field__error" role="alert"><Icon name="alert" size={18} />Velg minst ett par ski.</p>}
        </fieldset>
      )}

      {steg === 3 && aktiv && (
        <>
          <ConditionsSummary disiplin={disiplin} lufttemp={lufttemp} snotyper={snotyper} onEdit={() => setSteg(1)} />
          <SelectField
            label="Ski"
            value={aktiv}
            onChange={(e) => setAktivSki(e.target.value)}
            options={valgtSkiListe.map((s) => ({ value: s.id, label: s.navn }))}
          />
          {roller.map((rolle) => {
            const layers: WaxLayer[] = lagFor(aktiv)[rolle].map((l) => {
              const p = produkt(l.produktId)
              return {
                id: l.id,
                produkt: p ? `${p.merke} ${p.modell}` : 'Ukjent produkt',
                metode: l.metode ? METODE[l.metode] : undefined,
                detalj: l.strykertempC ? `Smørejern ${l.strykertempC} °C` : undefined,
              }
            })
            return <WaxLayerList key={rolle} rolle={rolle} layers={layers} onAdd={() => setVelger(rolle)} onOpen={(id) => setAapentLag({ rolle, id })} />
          })}
        </>
      )}

      {steg === 4 && aktiv && (
        <>
          {valgtSkiListe.length > 1 && (
            <SelectField label="Ski" value={aktiv} onChange={(e) => setAktivSki(e.target.value)}
              options={valgtSkiListe.map((s) => ({ value: s.id, label: s.navn }))} />
          )}
          {(() => {
            const v = vurdering[aktiv] ?? tomVurdering()
            const sett = (patch: Partial<Vurdering>) => setVurdering({ ...vurdering, [aktiv]: { ...v, ...patch } })
            return (
              <>
                <SegmentedControl<GlidMotFelt> legend="Glid mot feltet" options={options(GLID_MOT_FELT)} value={v.glid} onChange={(g) => sett({ glid: g })} />
                <RatingStars label="Stjerner for glid" value={v.stjernerGlid} onChange={(n) => sett({ stjernerGlid: n })} />
                {disiplin === 'klassisk' && (
                  <>
                    <SegmentedControl<Feste> legend="Feste" options={options(FESTE)} value={v.feste} onChange={(f) => sett({ feste: f })} />
                    <RatingStars label="Stjerner for feste" value={v.stjernerFeste} onChange={(n) => sett({ stjernerFeste: n })} />
                  </>
                )}
                <SegmentedControl<VurderingSikkerhet> legend="Hvor sikker er vurderingen" options={options(VURDERING_SIKKERHET)} value={v.sikkerhet} onChange={(s) => sett({ sikkerhet: s })} />
                <TextField label="Notat" multiline value={v.notat} onChange={(e) => sett({ notat: e.target.value })} />
              </>
            )
          })()}
        </>
      )}

      <div className="page__footer">
        {steg < 4 ? (
          <Button size="lg" block onClick={neste}>Neste</Button>
        ) : (
          <>
            <Button size="lg" block icon="check" onClick={() => setFerdig('med')}>Lagre renn</Button>
            <Button variant="tertiary" block onClick={() => setFerdig('uten')}>Vurder senere</Button>
          </>
        )}
      </div>
    </div>
  )
}

type VelgerProps = {
  rolle: Rolle
  produkter: Produkt[]
  lufttemp: number | null
  snotyper: Snotype[]
  onVelg: (p: Produkt) => void
  onTilbake: () => void
  toppRef: RefObject<HTMLDivElement | null>
}

/** Product picker: only products for the role, grouped by fit. */
function ProduktVelger({ rolle, produkter, lufttemp, snotyper, onVelg, onTilbake, toppRef }: VelgerProps) {
  const [sok, setSok] = useState('')
  const q = sok.trim().toLowerCase()
  const liste = produkter
    .filter((p) => ROLLE_KATEGORIER[rolle].includes(p.kategori))
    .filter((p) => !q || `${p.merke} ${p.modell}`.toLowerCase().includes(q))
    .map((p) => ({ p, f: fit(p, lufttemp, snotyper) }))
    .sort((a, b) => byFit(a.f, b.f))
  const passer = liste.filter((x) => x.f === 'ok')
  const andre = liste.filter((x) => x.f !== 'ok')

  const rad = ({ p, f }: { p: Produkt; f: Fit }) => (
    <li key={p.id}>
      <ProductCard
        navn={`${p.merke} ${p.modell}`}
        kategori={KATEGORI[p.kategori]}
        tempFra={p.tempFra}
        tempTil={p.tempTil}
        flag={FLAGG[f] ? <FlagBadge kind={FLAGG[f]!} /> : null}
        onOpen={() => onVelg(p)}
      />
    </li>
  )

  return (
    <div className="page" ref={toppRef}>
      <TopBar title={`Velg ${ROLLE_NAVN[rolle]}`} onBack={onTilbake} />
      <TextField label="Søk" type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Merke eller modell" />
      <p className="help">Forslag, ikke krav. Du velger alltid selv.</p>
      {liste.length === 0 && <EmptyState title="Ingen produkter funnet">Legg til produktet under Utstyr.</EmptyState>}
      {passer.length > 0 && (
        <>
          <h2 className="page__group">Passer til forholdene</h2>
          <ul className="page__list">{passer.map(rad)}</ul>
        </>
      )}
      {andre.length > 0 && (
        <>
          <h2 className="page__group">Andre produkter</h2>
          <ul className="page__list">{andre.map(rad)}</ul>
        </>
      )}
    </div>
  )
}
