interface LabelToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function LabelToggle({ visible, onChange }: LabelToggleProps) {
  return (
    <button
      className="label-toggle"
      type="button"
      aria-label="이름 모두 보기"
      aria-pressed={visible}
      title="이름 모두 보기"
      onClick={() => onChange(!visible)}
    >
      이름
    </button>
  )
}
