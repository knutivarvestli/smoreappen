import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconButton } from '../../components/Button'
import { ProductCard, SkiCard } from '../../components/Cards'
import { TopBar } from '../../components/Navigation'
import { EmptyState } from '../../components/States'
import { Tabs } from '../../components/Tabs'
import { useDemo } from '../../demo/DemoStore'
import { KATEGORI } from '../../lib/domene'
import '../../styles/page.css'

type Fane = 'ski' | 'produkter'

export function UtstyrPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const fane: Fane = params.get('fane') === 'produkter' ? 'produkter' : 'ski'
  const { ski, produkter } = useDemo()

  const ny = fane === 'ski'
    ? <IconButton icon="plus" label="Legg til ski" onClick={() => navigate('/utstyr/ski/ny')} />
    : <IconButton icon="plus" label="Legg til produkt" onClick={() => navigate('/utstyr/produkter/ny')} />

  return (
    <div className="page">
      <TopBar title={fane === 'ski' ? 'Mine ski' : 'Produkter'} actions={ny} />
      <Tabs<Fane>
        label="Utstyr"
        idBase="utstyr"
        value={fane}
        onChange={(f) => setParams(f === 'ski' ? {} : { fane: f }, { replace: true })}
        tabs={[{ value: 'ski', label: 'Ski' }, { value: 'produkter', label: 'Produkter' }]}
      />
      <div role="tabpanel" id={`utstyr-panel-${fane}`} aria-labelledby={`utstyr-tab-${fane}`}>
        {fane === 'ski' ? (
          ski.length === 0 ? (
            <EmptyState title="Ingen ski ennå" icon="ski">Legg til dine ski for å logge renn og se hva som fungerer.</EmptyState>
          ) : (
            <ul className="page__list">
              {ski.map((s) => (
                <li key={s.id}>
                  <SkiCard {...s} onOpen={() => navigate(`/utstyr/ski/${s.id}`)} />
                </li>
              ))}
            </ul>
          )
        ) : (
          <ul className="page__list">
            {produkter.map((p) => (
              <li key={p.id}>
                <ProductCard
                  navn={`${p.merke} ${p.modell}`}
                  kategori={KATEGORI[p.kategori]}
                  tempFra={p.tempFra}
                  tempTil={p.tempTil}
                  farge={p.farge}
                  onOpen={() => navigate(`/utstyr/produkter/${p.id}`)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
