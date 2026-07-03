import type { LucideIcon } from 'lucide-react'

interface FilterChipProps {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}

export default function FilterChip({ icon: Icon, label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-forest-600 bg-forest-600 text-white'
          : 'border-forest-100 bg-white text-stone-600 hover:border-forest-300 dark:border-white/10 dark:bg-white/5 dark:text-stone-300'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}
