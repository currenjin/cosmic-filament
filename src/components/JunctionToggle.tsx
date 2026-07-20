interface JunctionToggleProps {
  active: boolean
  onChange: (active: boolean) => void
}

export function JunctionToggle({ active, onChange }: JunctionToggleProps) {
  return (
    <button
      className="junction-toggle"
      type="button"
      aria-label="접점 강조"
      aria-pressed={active}
      title="전체 구조를 유지하고 접점 강조"
      onClick={() => onChange(!active)}
    >
      접점 강조
    </button>
  )
}
