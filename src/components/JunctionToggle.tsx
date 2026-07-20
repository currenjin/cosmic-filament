interface JunctionToggleProps {
  active: boolean
  onChange: (active: boolean) => void
}

export function JunctionToggle({ active, onChange }: JunctionToggleProps) {
  return (
    <button
      className="junction-toggle"
      type="button"
      aria-label="생각이 만나는 지점 강조"
      aria-pressed={active}
      title="생각이 만나는 지점 강조"
      onClick={() => onChange(!active)}
    >
      만남
    </button>
  )
}
