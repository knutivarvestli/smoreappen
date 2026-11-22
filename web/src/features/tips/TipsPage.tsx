import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton } from '../../components/Button'
import { LinkRow } from '../../components/FormParts'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { EmptyState, LoadingState } from '../../components/States'
import { eksempelUtkast, nyId, useDemo } from '../../demo/DemoStore'
import '../../components/TextField.css'
import '../../styles/page.css'
import './Tips.css'

const STEG = ['Henter side', 'Leser innhold', 'Trekker ut tips']
const IDAG = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })

/** «Andres erfaringer»: add links to blogs and wax tips, review drafts, list sources. */
export function TipsPage() {
  const navigate = useNavigate()
  const { kilder, tips, lagreKilde, lagreTips } = useDemo()
  const [url, setUrl] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [finnes, setFinnes] = useState<string | null>(null)
  const [henter, setHenter] = useState<{ steg: number; kildeId: string; domene: string; url: string } | null>(null)

  // Prototype: simulated fetching. The real fetch (SSRF rules, Extractor) is step 7.
  // Saving happens once, in the timer callback, so store updates cannot re-trigger it.
  useEffect(() => {
    if (!henter) return
    const t = setTimeout(() => {
      if (henter.steg + 1 < STEG.length) {
        setHenter({ ...henter, steg: henter.steg + 1 })
        return
      }
      const eksisterende = kilder.find((k) => k.id === henter.kildeId)
      lagreKilde({ id: henter.kildeId, domene: henter.domene, url: eksisterende?.url ?? henter.url, sistOppdatert: IDAG })
      lagreTips(eksempelUtkast(henter.kildeId, IDAG))
      navigate('/tips/gjennomgang')
    }, 600)
    return () => clearTimeout(t)
    // Only the progress state drives the timer.
  }, [henter])

  const hent = () => {
    setFinnes(null)
    let parsed: URL
    try {
      parsed = new URL(url.trim())
      if (!/^https?:$/.test(parsed.protocol)) throw new Error()
    } catch {
      setFeil('Lim inn en hel lenke som starter med https://')
      return
    }
    setFeil(null)
    const domene = parsed.hostname.replace(/^www\./, '')
    const k = kilder.find((x) => x.domene === domene)
    if (k) {
      setFinnes(k.id)
      return
    }
    setHenter({ steg: 0, kildeId: nyId(), domene, url: parsed.toString() })
  }

  const oppdater = (kildeId: string) => {
    const k = kilder.find((x) => x.id === kildeId)
    if (k) setHenter({ steg: 0, kildeId: k.id, domene: k.domene, url: k.url })
  }

  if (henter) {
    return (
      <div className="page">
        <TopBar title="Henter tips" onBack={() => setHenter(null)} />
        <p className="help">{henter.domene}</p>
        <LoadingState label="Henter tips" steps={STEG} current={henter.steg} />
      </div>
    )
  }

  const utkast = tips.filter((t) => t.status === 'utkast').length
  const finnesKilde = kilder.find((k) => k.id === finnes)

  return (
    <div className="page">
      <TopBar title="Andres erfaringer" />
      <div className={`field ${feil ? 'has-error' : ''}`}>
        <label htmlFor="tips-lenke" className="label field__label with-icon"><Icon name="link" size={16} />Lenke til side med smøretips</label>
        <input
          id="tips-lenke"
          className="field__control"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://"
          value={url}
          aria-invalid={feil ? true : undefined}
          aria-describedby={feil ? 'tips-lenke-feil' : undefined}
          onChange={(e) => { setUrl(e.target.value); setFinnes(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') hent() }}
        />
        {feil && <p id="tips-lenke-feil" className="field__error"><Icon name="alert" size={18} />{feil}</p>}
      </div>
      <Button size="lg" block icon="download" onClick={hent}>Hent tips</Button>

      {finnesKilde && (
        <div className="banner banner--warn tips__finnes" role="status">
          <Icon name="info" size={20} />
          <span>{finnesKilde.domene} er allerede lagt til. Vil du hente siden på nytt for å se om noe er endret?</span>
          <Button variant="secondary" icon="refresh" onClick={() => oppdater(finnesKilde.id)}>Oppdater kilden</Button>
        </div>
      )}

      {utkast > 0 && (
        <LinkRow
          icon="file"
          title={`${utkast} utkast venter`}
          sub="Gå gjennom og godkjenn før de brukes i anbefalinger"
          onClick={() => navigate('/tips/gjennomgang')}
        />
      )}

      <h2 className="page__group">Kilder</h2>
      {kilder.length === 0 ? (
        <EmptyState title="Ingen kilder ennå" icon="globe">Lim inn en lenke til en blogg eller side med smøretips.</EmptyState>
      ) : (
        <ul className="page__list">
          {kilder.map((k) => {
            const n = tips.filter((t) => t.kildeId === k.id && t.status === 'godkjent').length
            return (
              <li key={k.id} className="kilde">
                <Icon name="globe" />
                <span className="kilde__text">
                  <a href={k.url} target="_blank" rel="noopener noreferrer" className="kilde__domene">
                    {k.domene}<span className="visually-hidden"> (åpnes i ny fane)</span>
                  </a>
                  <span className="help num">{n} {n === 1 ? 'godkjent' : 'godkjente'} tips · oppdatert {k.sistOppdatert}</span>
                </span>
                <IconButton icon="refresh" label={`Oppdater ${k.domene}`} onClick={() => oppdater(k.id)} />
              </li>
            )
          })}
        </ul>
      )}
      <p className="help page__note">Prototype: henting er simulert med eksempeldata.</p>
    </div>
  )
}
