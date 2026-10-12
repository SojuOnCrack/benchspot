import { ATTRIBUTES } from '@/lib/benchAttributes'
import type { Bench } from '@/types/database'

export default function BenchAttributeGrid({ bench }: { bench: Bench }) {
  const active = ATTRIBUTES.filter((a) => bench[a.key] === true)
  if (active.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {active.map(({ key, icon: Icon, label }) => (
        <div
          key={key}
          className="flex items-center gap-2 rounded-xl border border-forest-100 px-3 py-2 text-xs text-stone-600 dark:border-white/10 dark:text-stone-300"
        >
          <Icon size={15} className="text-forest-600 dark:text-forest-300" />
          {label}
        </div>
      ))}
    </div>
  )
}
