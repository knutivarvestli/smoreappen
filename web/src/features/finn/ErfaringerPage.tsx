import { useNavigate } from 'react-router-dom'
import { ExperienceResultCard, TipCard } from '../../components/Cards'
import { Icon } from '../../components/Icon'
import { TopBar } from '../../components/Navigation'
import { EmptyState } from '../../components/States'
import { ROLLE_NAVN, useRolle, useTreff } from './treff'
import '../../styles/page.css'
import './FinnPage.css'

/** Details behind «Mine erfaringer» or «Andres erfaringer» on the results view (same role as the tab). */
export function ErfaringerPage({ hvem }: { hvem: 'mine' | 'andre' }) {
  const navigate = useNavigate()
  const { rolle, roller } = useRolle()
  const { egne, andre, domene } = useTreff(rolle)
  const uenige = new Set(andre.map((t) => t.kildeId)).size > 1
  const klassisk = roller.length > 1

  return (
    <div className="page page--tight">
      <TopBar
        title={hvem === 'mine' ? 'Mine erfaringer' : 'Andres erfaringer'}
        onBack={() => navigate(`/resultater${klassisk && rolle !== roller[0] ? `?rolle=${rolle}` : ''}`)}
      />
      {klassisk && <p className="label erfaringer__rolle">{ROLLE_NAVN[rolle]}, klassisk</p>}

      {hvem === 'mine' ? (
        egne.length === 0 ? (
          <EmptyState title="Ingen egne renn i disse forholdene" icon="flag">Logg renn i lignende forhold, så kommer de her.</EmptyState>
        ) : (
          <>
            <p className="help">Dine egne renn i lignende forhold. Antall renn og konfidens vises alltid.</p>
            <ul className="page__list finn__list">
              {egne.map((e) => (
                <li key={e.id}>
                  <ExperienceResultCard oppskrift={e.oppskrift} konfidens={e.konfidens} antallRenn={e.antall} sistBrukt={e.sist} direkte={e.direkte} />
                </li>
              ))}
            </ul>
          </>
        )
      ) : andre.length === 0 ? (
        <EmptyState title="Ingen godkjente tips for disse forholdene" icon="globe">Legg til flere kilder under Tips.</EmptyState>
      ) : (
        <>
          <p className="help">Godkjente tips fra nettsider. Ikke din egen erfaring.</p>
          {uenige && (
            <p className="finn__uenige help">
              <Icon name="info" size={16} />
              Kildene anbefaler ulike løsninger. Din egen erfaring teller tyngst.
            </p>
          )}
          <ul className="page__list finn__list">
            {andre.map((t) => (
              <li key={t.id}>
                <TipCard domene={domene(t.kildeId)} tempFra={t.fra} tempTil={t.til} tekst={t.sammendrag} hentet={t.hentet} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
