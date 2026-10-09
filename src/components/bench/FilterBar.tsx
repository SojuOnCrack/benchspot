import { Accessibility, TreeDeciduous, Mountain, Dog, Baby, Table2, Image, Star, X } from 'lucide-react'
import FilterChip from './FilterChip'
import type { BenchFilters } from '@/types/database'

interface FilterBarProps {
  filters: BenchFilters
  onChange: (filters: BenchFilters) => void
}

const CHIPS: Array<{ key: keyof BenchFilters; icon: typeof Star; label: string }> = [
  { key: 'onlyAccessible', icon: Accessibility, label: 'Barrierefrei' },
  { key: 'onlyShade', icon: TreeDeciduous, label: 'Schatten' },
  { key: 'onlyView', icon: Mountain, label: 'Aussicht' },
  { key: 'onlyDogs', icon: Dog, label: 'Hunde erlaubt' },
  { key: 'onlyPlayground', icon: Baby, label: 'Spielplatz' },
  { key: 'onlyTable', icon: Table2, label: 'Tisch' },
  { key: 'onlyWithPhotos', icon: Image, label: 'Mit Bildern' },
  { key: 'onlyRated', icon: Star, label: 'Bewertet' },
]

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = (key: keyof BenchFilters) => {
    onChange({ ...filters, [key]: !filters[key] })
  }
  const activeCount = CHIPS.filter((chip) => Boolean(filters[chip.key])).length

  return (
    <div
      role="group"
      aria-label="Filter"
      className="pointer-events-auto flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none]"
    >
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-stone-800 px-3.5 text-sm font-medium text-white shadow-sm transition active:scale-[0.97] dark:bg-stone-100 dark:text-stone-900"
        >
          <X size={16} aria-hidden="true" />
          Zurücksetzen ({activeCount})
        </button>
      )}
      {CHIPS.map((chip) => (
        <FilterChip
          key={chip.key}
          icon={chip.icon}
          label={chip.label}
          active={Boolean(filters[chip.key])}
          onClick={() => toggle(chip.key)}
        />
      ))}
    </div>
  )
}
