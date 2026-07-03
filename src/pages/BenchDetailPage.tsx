import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Navigation, Star, Heart, Share2 } from 'lucide-react'
import { useBench } from '@/hooks/useBenches'
import PageSkeleton from '@/components/ui/PageSkeleton'
import BenchAttributeGrid from '@/components/bench/BenchAttributeGrid'

export default function BenchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: bench, isLoading } = useBench(id)

  if (isLoading) return <PageSkeleton />
  if (!bench) return <p className="p-6 text-center text-stone-500">Parkbank nicht gefunden.</p>

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bench.lat},${bench.lng}`

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="relative h-64 bg-forest-100">
        <Link
          to="/"
          className="absolute left-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur"
          aria-label="Zurück"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur" aria-label="Favorisieren">
            <Heart size={18} />
          </button>
          <button className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur" aria-label="Teilen">
            <Share2 size={18} />
          </button>
        </div>
        {/* Galerie-Platzhalter: photos-Tabelle per bench_id laden und hier als Swiper rendern */}
        <div className="flex h-full items-center justify-center text-forest-400">Fotogalerie</div>
      </div>

      <div className="space-y-6 px-5 pt-5">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100">{bench.title}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-stone-500">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span>
              {bench.avg_rating > 0 ? bench.avg_rating.toFixed(1) : 'Neu'}
              {bench.rating_count > 0 && ` · ${bench.rating_count} Bewertungen`}
            </span>
          </div>
        </div>

        {bench.description && <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{bench.description}</p>}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-forest-600 py-3 text-sm font-medium text-white transition hover:bg-forest-700"
        >
          <Navigation size={16} />
          Navigation starten
        </a>

        <BenchAttributeGrid bench={bench} />

        {bench.notes && (
          <div className="rounded-2xl bg-forest-50 p-4 text-sm text-stone-600 dark:bg-white/5 dark:text-stone-300">
            {bench.notes}
          </div>
        )}

        {/* Bewertungen & Kommentare: ratings/comments per bench_id laden, siehe src/lib/api */}
      </div>
    </div>
  )
}
