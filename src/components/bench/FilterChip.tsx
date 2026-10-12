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
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium shadow-sm transition-colors active:scale-[0.97] ${
        active
          ? 'border-forest-600 bg-forest-600 text-white'
          : 'border-stone-200 bg-white text-stone-700 hover:bg-forest-50 dark:border-white/15 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  )
}
