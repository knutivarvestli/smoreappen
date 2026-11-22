import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { DisciplineTag } from '../../components/DisciplineToggle'
import { TempRangeField } from '../../components/FormParts'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { EmptyState } from '../../components/States'
import { useDemo, type EksternTips, type Sikkerhet } from '../../demo/DemoStore'
import { SNOTYPE } from '../../lib/domene'
import { formatNumber, formatTempRange, parseTemp } from '../../lib/format'
import '../../components/Badges.css'
import '../../styles/page.css'
import './Tips.css'

const SIKKERHET: Record<Sikkerhet, string> = { hoy: 'Høy sikkerhet', middels: 'Middels sikkerhet', lav: 'Lav sikkerhet' }
const ROLLE: Record<EksternTips['lag'][number]['rolle'], string> = { rill: 'Rill', glid: 'Glid', feste: 'Feste' }

/** Review drafts: nothing is used in recommendations before it is approved. */
export function GjennomgangPage() {
  const navigate = useNavigate()
  const { tips, kilder, lagreTips } = useDemo()
  // Keep handled drafts visible during this visit so «Angre» is possible.
  const [synlige] = useState(() => new Set(tips.filter((t) => t.status === 'utkast').map((t) => t.id)))
  const liste = tips.filter((t) => synlige.has(t.id))
  const ventende = liste.filter((t) => t.status === 'utkast')
  const hoy = ventende.filter((t) => t.sikkerhet === 'hoy')

  const sett = (t: EksternTips, patch: Partial<EksternTips>) => lagreTips([{ ...t, ...patch }])
  const domene = (id: string) => kilder.find((k) => k.id === id)?.domene ?? 'Ukjent kilde'

  return (
    <div className="page">
      <TopBar title="Gå gjennom tips" onBack={() => navigate('/tips')} />
      {liste.length === 0 ? (
        <EmptyState title="Ingen utkast å gå gjennom" icon="check">Lim inn en ny lenke under Andres erfaringer.</EmptyState>
      ) : (
        <>
          <p className="help" aria-live="polite">
            {ventende.length === 0 ? 'Alle utkast er behandlet.' : `${ventende.length} av ${liste.length} venter. Kun godkjente tips brukes i anbefalinger.`}
          </p>
          {hoy.length > 0 && (
            <Button variant="secondary" block icon="check" onClick={() => lagreTips(hoy.map((t) => ({ ...t, status: 'godkjent' })))}>
              Godkjenn alle med høy sikkerhet ({hoy.length})
            </Button>
          )}
          <ul className="page__list">
            {liste.map((t) => (
              <li key={t.id}>
                <TipReviewCard tips={t} domene={domene(t.kildeId)} onChange={(p) => sett(t, p)} />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="page__footer">
        <Button size="lg" block onClick={() => navigate('/tips')}>Ferdig</Button>
      </div>
    </div>
  )
}

type CardProps = { tips: EksternTips; domene: string; onChange: (p: Partial<EksternTips>) => void }

function TipReviewCard({ tips: t, domene, onChange }: CardProps) {
  const [redigerer, setRedigerer] = useState(false)
  const [fra, setFra] = useState(t.fra === null ? '' : formatNumber(t.fra))
  const [til, setTil] = useState(t.til === null ? '' : formatNumber(t.til))
  const [feil, setFeil] = useState<string | undefined>()

  const lagre = () => {
    const lo = fra.trim() ? parseTemp(fra) : null
    const hi = til.trim() ? parseTemp(til) : null
    if ((fra.trim() && lo === null) || (til.trim() && hi === null)) return setFeil('Skriv temperaturen som tall, for eksempel −3.')
    if (lo !== null && hi !== null && lo > hi) return setFeil('«Fra» kan ikke være høyere enn «til».')
    onChange({ fra: lo, til: hi })
    setFeil(undefined)
    setRedigerer(false)
  }

  const behandlet = t.status !== 'utkast'

  return (
    <article className={`review card ${behandlet ? `is-${t.status}` : ''}`} aria-label={`Tips fra ${domene}`}>
      <div className="review__head">
        <DisciplineTag value={t.disiplin} />
        <span className={`review__sikkerhet review__sikkerhet--${t.sikkerhet}`}>
          {t.sikkerhet === 'lav' && <Icon name="alert" size={16} />}
          {SIKKERHET[t.sikkerhet]}
        </span>
      </div>

      {redigerer ? (
        <div className="review__edit">
          <TempRangeField label="Temperaturområde (°C)" from={fra} to={til} onFrom={setFra} onTo={setTil} error={feil} />
          <div className="review__actions">
            <Button variant="secondary" onClick={() => setRedigerer(false)}>Avbryt</Button>
            <Button onClick={lagre}>Lagre</Button>
          </div>
        </div>
      ) : (
        <p className="review__temp num">{formatTempRange(t.fra, t.til)}</p>
      )}

      {t.snotyper.length > 0 && <p className="review__sno">{t.snotyper.map((s) => SNOTYPE[s]).join(' · ')}</p>}
      {t.lag.length > 0 && (
        <ol className="review__lag">
          {t.lag.map((l, i) => (
            <li key={i}><span className="text-2">{ROLLE[l.rolle]}:</span> {l.produkt}{l.metode ? `, ${l.metode.toLowerCase()}` : ''}</li>
          ))}
        </ol>
      )}
      <p>{t.sammendrag}</p>
      {t.mangler.length > 0 && (
        <div className="review__mangler">
          {t.mangler.map((m) => (
            <span key={m} className="flag flag--warn"><Icon name="alert" size={16} />{m}</span>
          ))}
        </div>
      )}
      <p className="help">{domene} · hentet {t.hentet}</p>

      {behandlet ? (
        <div className="review__done">
          <StatusBadge status={t.status} />
          <Button variant="tertiary" onClick={() => onChange({ status: 'utkast' })}>Angre</Button>
        </div>
      ) : (
        !redigerer && (
          <div className="review__actions review__actions--3">
            <Button icon="check" onClick={() => onChange({ status: 'godkjent' })}>Godkjenn</Button>
            <Button variant="secondary" icon="pencil" onClick={() => setRedigerer(true)}>Rediger</Button>
            <Button variant="destructive" icon="x" onClick={() => onChange({ status: 'forkastet' })}>Forkast</Button>
          </div>
        )
      )}
    </article>
  )
}
