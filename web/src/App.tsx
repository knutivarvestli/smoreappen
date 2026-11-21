import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import './components/Button.css'
import { AppShell, TopBar } from './components/Navigation'
import { EmptyState } from './components/States'
import { DemoStoreProvider } from './demo/DemoStore'
import { DesignSystemPage } from './features/designsystem/DesignSystemPage'
import { ScreenExamples } from './features/designsystem/ScreenExamples'
import { FinnPage } from './features/finn/FinnPage'
import { InnstillingerPage } from './features/innstillinger/InnstillingerPage'
import { NyttRennPage } from './features/logg/NyttRennPage'
import { NyttProduktPage } from './features/utstyr/NyttProduktPage'
import { SjekkProduktPage } from './features/utstyr/SjekkProduktPage'
import { SkiFormPage } from './features/utstyr/SkiFormPage'
import { UtstyrPage } from './features/utstyr/UtstyrPage'

// Clickable prototype with example data. Login gating comes in step 2.
export function App() {
  return (
    <DemoStoreProvider>
      <Routes>
        {/* Main views: bottom navigation */}
        <Route element={<AppShell><Outlet /></AppShell>}>
          <Route path="/" element={<FinnPage />} />
          <Route path="/finn" element={<Navigate to="/" replace />} />
          <Route path="/spor" element={<NotYet title="Spør" step={9} />} />
          <Route path="/tips" element={<NotYet title="Andres erfaringer" step={8} />} />
          <Route path="/utstyr" element={<UtstyrPage />} />
          <Route path="/designsystem" element={<DesignSystemPage />} />
          <Route path="/designsystem/eksempler" element={<><TopBar title="Skjermeksempler" /><ScreenExamples /></>} />
          <Route path="*" element={<NotYet title="Fant ikke siden" />} />
        </Route>
        {/* Flows: full screen, no bottom navigation */}
        <Route element={<AppShell flow><Outlet /></AppShell>}>
          <Route path="/logg" element={<NyttRennPage />} />
          <Route path="/utstyr/ski/ny" element={<SkiFormPage />} />
          <Route path="/utstyr/ski/:id" element={<SkiFormPage />} />
          <Route path="/utstyr/produkter/ny" element={<NyttProduktPage />} />
          <Route path="/utstyr/produkter/sjekk" element={<SjekkProduktPage />} />
          <Route path="/utstyr/produkter/beskrivelse" element={<NotYet title="Produktbeskrivelse" step={7} back />} />
          <Route path="/utstyr/produkter/:id" element={<SjekkProduktPage />} />
          <Route path="/innstillinger" element={<InnstillingerPage />} />
        </Route>
      </Routes>
    </DemoStoreProvider>
  )
}

function NotYet({ title, step, back }: { title: string; step?: number; back?: boolean }) {
  const navigate = useNavigate()
  return (
    <>
      <TopBar title={title} onBack={back ? () => navigate(-1) : undefined} />
      <EmptyState
        title={step ? `Denne skjermen kommer i steg ${step}` : 'Siden finnes ikke'}
        action={<Link className="btn btn--secondary btn--md" to="/">Gå til Finn</Link>}
      />
    </>
  )
}
