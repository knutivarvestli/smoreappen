import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { LoadingState } from '../../components/States'
import '../../components/TextField.css'
import '../../styles/page.css'

const STEG = ['Henter side', 'Leser innhold', 'Trekker ut produktinfo']

export type ProduktKilde = { type: 'lenke'; url: string } | { type: 'bilde' } | { type: 'manuelt' }

/** Three ways in: link (safest), photo of box or label, or manual. */
export function NyttProduktPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [henter, setHenter] = useState<number | null>(null)

  // Prototype: simulated progress. Real fetching comes in step 7 (INNHENTING.md).
  useEffect(() => {
    if (henter === null) return
    if (henter >= STEG.length) {
      navigate('/utstyr/produkter/sjekk', { state: { type: 'lenke', url } satisfies ProduktKilde })
      return
    }
    const t = setTimeout(() => setHenter(henter + 1), 600)
    return () => clearTimeout(t)
  }, [henter, navigate, url])

  const hent = () => {
    const u = url.trim()
    if (!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(u)) {
      setFeil('Lim inn en hel lenke som starter med https://')
      return
    }
    setFeil(null)
    setHenter(0)
  }

  if (henter !== null) {
    return (
      <div className="page">
        <TopBar title="Henter produkt" onBack={() => setHenter(null)} />
        <LoadingState label="Henter produkt" steps={STEG} current={henter} />
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar title="Nytt produkt" onBack={() => navigate('/utstyr?fane=produkter')} />
      <div className={`field ${feil ? 'has-error' : ''}`}>
        <label htmlFor="produkt-lenke" className="label field__label with-icon"><Icon name="link" size={16} />Lenke til produktside</label>
        <input
          id="produkt-lenke"
          className="field__control"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://"
          value={url}
          aria-invalid={feil ? true : undefined}
          aria-describedby={feil ? 'produkt-lenke-feil' : undefined}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') hent() }}
        />
        {feil && <p id="produkt-lenke-feil" className="field__error"><Icon name="alert" size={18} />{feil}</p>}
      </div>
      <Button size="lg" block icon="download" onClick={hent}>Hent produkt</Button>
      <p className="page__or help">eller</p>
      <Button
        variant="secondary"
        size="lg"
        block
        icon="camera"
        onClick={() => navigate('/utstyr/produkter/sjekk', { state: { type: 'bilde' } satisfies ProduktKilde })}
      >
        Ta bilde av eske eller etikett
      </Button>
      <Button variant="tertiary" block onClick={() => navigate('/utstyr/produkter/sjekk', { state: { type: 'manuelt' } satisfies ProduktKilde })}>
        Legg inn manuelt
      </Button>
      <p className="help page__note">Prototype: henting er simulert med eksempeldata.</p>
    </div>
  )
}
