import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ExperienceResultCard, FilterChips, RaceCard, TipCard } from '../../components/Cards'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { EmptyState } from '../../components/States'
import { TextField } from '../../components/TextField'
import { useDemo } from '../../demo/DemoStore'
import { innenfor, OPPSKRIFTER, type EksempelRenn, type Oppskrift, type SmoreRolle } from '../../demo/erfaring'
import { DISIPLIN, FESTE, GLID_MOT_FELT, SNOOPPRINNELSE, SNOTYPE, type Konfidens } from '../../lib/domene'
import { formatNumber, formatTemp } from '../../lib/format'
import { tolk, trengerOppklaring, type Filter, type Oppklaring } from './tolk'
import '../../styles/page.css'
import './SporPage.css'

const FORSLAG = ['Beste glid i dag', 'Siste renn med lignende forhold', 'Hva funket på kunstsnø?']

const konfidens = (n: number): Konfidens => (n >= 5 ? 'solid' : n >= 2 ? 'noe' : 'ett')

type Rangert = Oppskrift & { treff: Oppskrift['renn'] }

/** Computed in code from logged races (backend ranking in step 9). The model never invents numbers. */
function beregn(f: Filter): Rangert[] {
  if (!f.disiplin) return []
  return OPPSKRIFTER[f.disiplin]
    .map((o) => {
      const treff = o.renn.filter((r) =>
        (f.temp === null || Math.abs(r.lufttemp - f.temp) <= f.toleranse) &&
        (f.opprinnelse === null || r.opprinnelse === f.opprinnelse))
      return { ...o, treff, antall: treff.length, konfidens: konfidens(treff.length), sist: treff[0]?.dato ?? o.sist }
    })
    .filter((o) => o.treff.length > 0)
    .sort((a, b) => b.treff.length - a.treff.length)
}

function forholdTekst(f: Filter): string {
  const deler = [
    f.opprinnelse ? SNOOPPRINNELSE[f.opprinnelse].toLowerCase() : null,
    f.temp !== null ? `rundt ${formatTemp(f.temp)}` : null,
  ].filter(Boolean)
  return deler.length ? deler.join(' ') : 'alle forhold'
}

/** Roles to answer for: classic has grip and glide (grip first), skate glide only. */
const rollerFor = (f: Filter): SmoreRolle[] => (f.disiplin === 'klassisk' ? ['feste', 'glid'] : ['glid'])

/**
 * Template answer from computed data, one sentence per role. Always says how
 * many races and when the last one was.
 */
function svartekst(f: Filter, rangert: Rangert[]): string {
  if (rangert.length === 0) return 'Jeg har ikke data på dette ennå.'
  return rollerFor(f)
    .map((rolle) => {
      const liste = rangert.filter((r) => r.rolle === rolle)
      if (liste.length === 0) return `For ${rolle} har jeg ikke data på dette ennå.`
      const [beste, ...resten] = liste
      const total = new Set(liste.flatMap((r) => r.treff.map((x) => x.id))).size
      let s = `Ut fra ${total} renn på ${forholdTekst(f)} (siste ${beste.sist}) har ${beste.oppskrift} gjort det best for ${rolle}`
      s += beste.direkte ? `: raskest i ${beste.direkte.seire} av ${beste.direkte.av} direkte sammenligninger.` : '.'
      if (beste.konfidens === 'ett') s += ' Det bygger på ett renn, så tolk forsiktig.'
      const tynn = resten.find((r) => r.konfidens === 'ett')
      if (tynn) s += ` ${tynn.oppskrift} er brukt i ett renn, så tolk forsiktig.`
      return s
    })
    .join(' ')
}

/** «Glid: raskere» or «Feste: veldig bra» for a race. */
const vurderingTekst = (r: EksempelRenn) =>
  r.glid ? `Glid: ${GLID_MOT_FELT[r.glid].toLowerCase()}` : r.feste ? `Feste: ${FESTE[r.feste].toLowerCase()}` : 'Ikke vurdert'

export function SporPage() {
  const navigate = useNavigate()
  const { tips, kilder } = useDemo()
  const [sporsmal, setSporsmal] = useState('')
  const [filter, setFilter] = useState<Filter | null>(null)
  const [oppklaring, setOppklaring] = useState<{ q: string; o: Oppklaring; f: Filter } | null>(null)
  const [visRenn, setVisRenn] = useState(false)

  const still = (q: string) => {
    const tekst = q.trim()
    if (!tekst) return
    setSporsmal(tekst)
    setVisRenn(false)
    let f = tolk(tekst)
    // «I dag» uses today's conditions; the prototype uses −7 °C as an example.
    if (f.temp === null && /i dag|lignende/.test(tekst.toLowerCase())) f = { ...f, temp: -7 }
    const o = trengerOppklaring(tekst, f)
    if (o) {
      setOppklaring({ q: tekst, o, f })
      setFilter(null)
      return
    }
    setOppklaring(null)
    setFilter(f)
  }

  const velgOppklaring = (patch: Partial<Filter>) => {
    if (!oppklaring) return
    const f = { ...oppklaring.f, ...patch }
    const o = trengerOppklaring(oppklaring.q.replace(/kaldt?/gi, ''), f)
    if (o) setOppklaring({ ...oppklaring, o, f })
    else {
      setOppklaring(null)
      setFilter(f)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    still(sporsmal)
  }

  const rangert = filter ? beregn(filter) : []
  const andre = filter?.disiplin
    ? tips.filter((t) => t.status === 'godkjent' && t.disiplin === filter.disiplin && (filter.temp === null || innenfor(filter.temp, t.fra, t.til))).slice(0, 3)
    : []
  const alleRenn = rangert.flatMap((r) => r.treff.map((x) => ({ ...x, oppskrift: r.oppskrift })))

  return (
    <div className="page spor">
      <TopBar title="Spør" />
      <form className="spor__form" onSubmit={submit}>
        <TextField
          label="Spør om dine egne renn"
          value={sporsmal}
          onChange={(e) => setSporsmal(e.target.value)}
          placeholder="Hva har fungert best for meg på kunstsnø rundt −7 °C?"
          enterKeyHint="search"
        />
        <Button type="submit" icon="chat">Spør</Button>
      </form>

      {!filter && !oppklaring && (
        <>
          <div className="chips" role="group" aria-label="Forslag">
            {FORSLAG.map((f) => (
              <button key={f} type="button" className="chip chip--suggest" onClick={() => still(f)}>{f}</button>
            ))}
          </div>
          <p className="help">Svarene bygger på rennene du har logget og godkjente tips fra andre. Etter 10–15 renn begynner svarene å bli nyttige.</p>
        </>
      )}

      {oppklaring && (
        <section className="spor__oppklaring" aria-live="polite">
          <h2>{oppklaring.o.sporsmal}</h2>
          <div className="chips">
            {oppklaring.o.valg.map((v) => (
              <button key={v.label} type="button" className="chip chip--suggest" onClick={() => velgOppklaring(v.patch)}>{v.label}</button>
            ))}
          </div>
        </section>
      )}

      {filter && filter.disiplin && (
        <section className="spor__svar" aria-live="polite">
          <p className="label text-2">Jeg søkte etter:</p>
          <FilterChips
            label="Filter brukt i svaret"
            chips={[
              {
                id: 'd',
                label: DISIPLIN[filter.disiplin],
                toggleLabel: `${DISIPLIN[filter.disiplin]}. Bytt disiplin`,
                onToggle: () => setFilter({ ...filter, disiplin: filter.disiplin === 'klassisk' ? 'skoyting' : 'klassisk' }),
              },
              ...(filter.temp !== null
                ? [{ id: 't', label: `${formatNumber(filter.temp)} ± ${filter.toleranse} °C`, onRemove: () => setFilter({ ...filter, temp: null }) }]
                : []),
              ...(filter.opprinnelse
                ? [{ id: 'o', label: SNOOPPRINNELSE[filter.opprinnelse], onRemove: () => setFilter({ ...filter, opprinnelse: null }) }]
                : []),
            ]}
          />

          <p className="spor__tekst">{svartekst(filter, rangert)}</p>

          {rangert.length > 0 ? (
            <>
              <h2 className="page__group">Min erfaring</h2>
              {rollerFor(filter).map((rolle) => {
                const liste = rangert.filter((r) => r.rolle === rolle)
                if (liste.length === 0) return null
                return (
                  <div key={rolle} className="spor__rolle">
                    {filter.disiplin === 'klassisk' && <h3 className="spor__rolletittel">{rolle === 'feste' ? 'Feste' : 'Glid'}</h3>}
                    <ol className="page__list">
                      {liste.map((r, i) => (
                        <li key={r.id}>
                          <ExperienceResultCard
                            rangering={i + 1}
                            oppskrift={r.oppskrift}
                            konfidens={r.konfidens}
                            antallRenn={r.antall}
                            sistBrukt={r.sist}
                            direkte={r.direkte}
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
              <button type="button" className="more" aria-expanded={visRenn} aria-controls="renn-bak" onClick={() => setVisRenn(!visRenn)}>
                Se rennene bak svaret ({alleRenn.length})
                <Icon name="chevronDown" />
              </button>
              {visRenn && (
                <ul id="renn-bak" className="page__list">
                  {alleRenn.map((r) => (
                    <li key={`${r.id}-${r.oppskrift}`}>
                      <RaceCard
                        dato={r.dato}
                        sted={r.sted}
                        lufttemp={r.lufttemp}
                        forhold={`${SNOTYPE[r.snotype]}, ${SNOOPPRINNELSE[r.opprinnelse].toLowerCase()}`}
                        vurdering={vurderingTekst(r)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <EmptyState
              title="Ingen egne renn i disse forholdene"
              action={<Button variant="secondary" icon="plus" onClick={() => navigate('/logg')}>Logg et renn</Button>}
            >
              Logg renn i lignende forhold, så kan jeg svare bedre neste gang.
            </EmptyState>
          )}

          {andre.length > 0 && (
            <>
              <h2 className="page__group">Andres erfaringer</h2>
              <p className="help">Tips fra nettsider, ikke din egen erfaring.</p>
              <ul className="page__list">
                {andre.map((t) => (
                  <li key={t.id}>
                    <TipCard
                      domene={kilder.find((k) => k.id === t.kildeId)?.domene ?? 'Ukjent kilde'}
                      tempFra={t.fra}
                      tempTil={t.til}
                      tekst={t.sammendrag}
                      hentet={t.hentet}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
          <Button variant="tertiary" onClick={() => { setFilter(null); setSporsmal('') }}>Still et nytt spørsmål</Button>
        </section>
      )}
      <p className="help page__note">Prototype: svarene er beregnet fra eksempeldata.</p>
    </div>
  )
}
