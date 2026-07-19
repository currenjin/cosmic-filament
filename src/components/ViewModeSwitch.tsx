export type ViewMode = 'all' | 'nearby' | 'overlap'

interface ViewModeSwitchProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  nearbyDisabled?: boolean
}

const modes: Array<{ value: ViewMode; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'nearby', label: '내 주변' },
  { value: 'overlap', label: '겹침' },
]

export function ViewModeSwitch({ value, onChange, nearbyDisabled = false }: ViewModeSwitchProps) {
  return (
    <div className="view-mode" aria-label="그래프 보기 방식">
      {modes.map((mode) => (
        <button
          type="button"
          key={mode.value}
          aria-pressed={value === mode.value}
          disabled={mode.value === 'nearby' && nearbyDisabled}
          onClick={() => onChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
