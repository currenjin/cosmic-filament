interface LabelToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function LabelToggle({ visible, onChange }: LabelToggleProps) {
  return (
    <button
      className="label-toggle"
      type="button"
      aria-label="노드 이름 표시"
      aria-pressed={visible}
      title="노드 이름 표시"
      onClick={() => onChange(!visible)}
    >
      Aa
    </button>
  )
}
