import type { LucideIcon } from 'lucide-react'

interface ToggleFieldProps {
  icon: LucideIcon
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function ToggleField({ icon: Icon, label, checked, onChange }: ToggleFieldProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
        checked
          ? 'border-forest-500 bg-forest-50 text-forest-800 dark:bg-forest-500/10 dark:text-forest-200'
          : 'border-forest-100 text-stone-600 dark:border-white/10 dark:text-stone-300'
      }`}
    >
      <Icon size={16} className={checked ? 'text-forest-600' : 'text-stone-400'} />
      {label}
    </button>
  )
}
