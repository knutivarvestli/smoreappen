import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LinkRow } from '../../components/FormParts'
import { TopBar } from '../../components/Navigation'
import { SegmentedControl } from '../../components/SegmentedControl'
import { applyTheme, loadTheme, type Theme } from '../../lib/theme'
import '../../styles/page.css'

export function InnstillingerPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<Theme>(loadTheme())
  return (
    <div className="page">
      <TopBar title="Innstillinger" onBack={() => navigate(-1)} />
      <SegmentedControl<Theme>
        legend="Tema"
        value={theme}
        onChange={(t) => { setTheme(t); applyTheme(t) }}
        options={[
          { value: 'system', label: 'System' },
          { value: 'lys', label: 'Lys' },
          { value: 'mork', label: 'Mørk' },
        ]}
      />
      <LinkRow icon="file" title="Designsystem" sub="Komponenter og farger" onClick={() => navigate('/designsystem')} />
      <p className="help">Konto, innlogging, aktive økter og eksport av data kommer når innloggingen er på plass.</p>
    </div>
  )
}
