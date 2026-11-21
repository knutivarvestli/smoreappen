import { DISIPLIN, type Disiplin } from '../lib/domene'
import { SegmentedControl } from './SegmentedControl'

type Props = {
  value: Disiplin
  onChange: (value: Disiplin) => void
  disabled?: boolean
}

/** Klassisk / Skøyting with discipline accent colour plus text and check icon. */
export function DisciplineToggle({ value, onChange, disabled }: Props) {
  return (
    <SegmentedControl<Disiplin>
      legend="Disiplin"
      hideLegend
      value={value}
      onChange={onChange}
      disabled={disabled}
      variant="split"
      options={[
        { value: 'klassisk', label: DISIPLIN.klassisk, accent: 'klassisk', icon: 'klassisk' },
        { value: 'skoyting', label: DISIPLIN.skoyting, accent: 'skoyting', icon: 'skoyting' },
      ]}
    />
  )
}

/** Small label used on cards: stripe colour plus text. */
export function DisciplineTag({ value }: { value: Disiplin }) {
  return <span className={`disc-tag disc-tag--${value}`}>{DISIPLIN[value]}</span>
}
