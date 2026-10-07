import { Link } from 'react-router-dom'
import { Star, TreePine } from 'lucide-react'
import type { Bench } from '@/types/database'

const CATEGORY_LABEL: Record<string, string> = {
  standard: 'Standard',
  panorama: 'Panorama',
  waterfront: 'Am Wasser',
  forest: 'Wald',
  urban: 'Stadt',
  picnic: 'Picknick',
}

export default function BenchMarkerPopup({ bench }: { bench: Bench }) {
  return (
    <Link to={`/bank/${bench.id}`} className="block min-w-[200px] no-underline">
      <div className="flex items-center gap-1 text-emerald-700">
        <TreePine size={14} />
        <span className="text-[11px] font-medium uppercase tracking-wide">{CATEGORY_LABEL[bench.category] ?? bench.category}</span>
      </div>
      <h3 className="mt-0.5 text-sm font-semibold text-stone-800">{bench.title}</h3>
      <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        <span>
          {bench.avg_rating > 0 ? bench.avg_rating.toFixed(1) : 'Noch keine Bewertung'}
          {bench.rating_count > 0 && ` (${bench.rating_count})`}
        </span>
      </div>
    </Link>
  )
}
