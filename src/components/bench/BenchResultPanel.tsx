import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, MapPin, Plus, RotateCcw, SearchX, Star, TreePine, TriangleAlert } from 'lucide-react'
import { ATTRIBUTES } from '@/lib/benchAttributes'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CATEGORY_LABEL } from '@/lib/benchLabels'
import { distanceMeters, formatDistance, type LatLng } from '@/lib/geo'
import type { Bench } from '@/types/database'

const MAX_VISIBLE = 50
const MAX_ATTRIBUTES = 3

interface BenchResultPanelProps {
  benches: Bench[]
  loading: boolean
  error: boolean
  onRetry: () => void
  searchText: string
  isSearchResult: boolean
  userLocation: LatLng | null
  filtersActive: boolean
  onResetFilters: () => void
  open: boolean
  onToggle: () => void
  onShowOnMap: (bench: Bench) => void
}

interface Item {
  bench: Bench
  distance: number | null
}

const BenchResultCard = memo(function BenchResultCard({
  item,
  onShowOnMap,
}: {
  item: Item
  onShowOnMap: (bench: Bench) => void
}) {
  const { bench, distance } = item
  const attributes = ATTRIBUTES.filter((a) => bench[a.key] === true)
  const shownAttributes = attributes.slice(0, MAX_ATTRIBUTES)
  const hiddenCount = attributes.length - shownAttributes.length

  return (
    <li className="flex items-stretch rounded-2xl border border-stone-200 bg-white transition-colors focus-within:border-forest-400 hover:border-forest-300 dark:border-white/10 dark:bg-stone-900/60 dark:hover:border-forest-500">
      <Link to={`/bank/${bench.id}`} className="flex min-w-0 flex-1 gap-3 rounded-l-2xl p-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 dark:bg-white/10 dark:text-forest-200"
        >
          <TreePine size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
            {bench.title}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-600 dark:text-stone-300">
            <span>{CATEGORY_LABEL[bench.category] ?? bench.category}</span>
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
              {bench.avg_rating > 0 ? (
                <>
                  {bench.avg_rating.toFixed(1)}
                  <span className="sr-only"> von 5 Sternen,</span>
                  <span aria-hidden="true">({bench.rating_count})</span>
                  <span className="sr-only">{bench.rating_count} Bewertungen</span>
                </>
              ) : (
                'Neu'
              )}
            </span>
            {distance !== null && (
              <span className="font-medium text-forest-700 dark:text-forest-200">
                <span className="sr-only">Entfernung </span>
                {formatDistance(distance)}
              </span>
            )}
          </span>
          {shownAttributes.length > 0 && (
            <span className="mt-1.5 flex flex-wrap gap-1">
              {shownAttributes.map(({ key, icon: Icon, label }) => (
                <span
                  key={key}
                  className="flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-[11px] text-forest-800 dark:bg-white/10 dark:text-forest-100"
                >
                  <Icon size={11} aria-hidden="true" />
                  {label}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600 dark:bg-white/10 dark:text-stone-300">
                  +{hiddenCount}
                </span>
              )}
            </span>
          )}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => onShowOnMap(bench)}
        aria-label={`${bench.title} auf der Karte zeigen`}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl border-l border-stone-100 text-forest-700 transition hover:bg-forest-50 active:bg-forest-100 dark:border-white/10 dark:text-forest-200 dark:hover:bg-white/10"
      >
        <MapPin size={20} aria-hidden="true" />
      </button>
    </li>
  )
})

export default function BenchResultPanel({
  benches,
  loading,
  error,
  onRetry,
  searchText,
  isSearchResult,
  userLocation,
  filtersActive,
  onResetFilters,
  open,
  onToggle,
  onShowOnMap,
}: BenchResultPanelProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const expanded = isDesktop || open

  const sortMode: 'relevance' | 'distance' | 'rating' = isSearchResult && !userLocation
    ? 'relevance'
    : userLocation
      ? 'distance'
      : 'rating'

  const items = useMemo<Item[]>(() => {
    const list = benches.map((bench) => ({
      bench,
      distance: userLocation ? distanceMeters(userLocation, bench) : null,
    }))
    if (sortMode === 'distance') list.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    else if (sortMode === 'rating') {
      list.sort((a, b) => b.bench.avg_rating - a.bench.avg_rating || a.bench.title.localeCompare(b.bench.title, 'de'))
    }
    return list
  }, [benches, userLocation, sortMode])

  const total = items.length
  const initialLoading = loading && total === 0 && !error

  let title: string
  if (error) title = 'Bänke konnten nicht geladen werden'
  else if (initialLoading) title = 'Bänke werden geladen…'
  else if (isSearchResult && searchText) title = `${total} Treffer für „${searchText}“`
  else title = `${total} ${total === 1 ? 'Bank' : 'Bänke'} in diesem Ausschnitt`

  const sortLabel =
    sortMode === 'distance'
      ? 'Nächste zuerst'
      : sortMode === 'rating'
        ? 'Beste Bewertung zuerst'
        : 'Beste Treffer zuerst'

  return (
    <section
      aria-label="Bänke in diesem Kartenausschnitt"
      className={`absolute inset-x-0 bottom-0 z-[950] flex flex-col overflow-hidden rounded-t-3xl border-t border-stone-200 bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[height] duration-300 ease-out dark:border-white/10 dark:bg-ink-900/95 md:static md:z-auto md:h-full md:w-[22rem] md:shrink-0 md:rounded-none md:border-r md:border-t-0 md:shadow-none lg:w-96 md:order-first ${
        open ? 'h-[62%]' : 'h-14'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls="bench-results"
        disabled={isDesktop}
        className="relative flex h-14 w-full shrink-0 items-center gap-3 px-4 text-left md:h-auto md:cursor-default md:px-4 md:pb-2 md:pt-4"
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-stone-300 dark:bg-stone-600 md:hidden"
        />
        <span className="min-w-0 flex-1 pt-1 md:pt-0">
          <span className="block truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</span>
          {expanded && !error && total > 0 && (
            <span className="block text-xs text-stone-600 dark:text-stone-300">{sortLabel}</span>
          )}
        </span>
        <ChevronUp
          size={20}
          aria-hidden="true"
          className={`shrink-0 text-stone-500 transition-transform duration-300 dark:text-stone-300 md:hidden ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id="bench-results"
        inert={!expanded}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
      >
        {error ? (
          <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <TriangleAlert size={28} className="text-amber-500" aria-hidden="true" />
            <p className="text-sm text-stone-600 dark:text-stone-300">
              Die Bänke konnten gerade nicht geladen werden. Bitte prüfe deine Verbindung.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="flex h-10 items-center gap-2 rounded-full bg-forest-600 px-4 text-sm font-medium text-white transition hover:bg-forest-700"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Erneut versuchen
            </button>
          </div>
        ) : initialLoading ? (
          <div role="status" className="space-y-2" aria-label="Bänke werden geladen">
            {[0, 1, 2].map((n) => (
              <div key={n} aria-hidden="true" className="h-[4.75rem] animate-pulse rounded-2xl bg-forest-50 dark:bg-white/5" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <SearchX size={28} className="text-forest-500" aria-hidden="true" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
              {filtersActive ? 'Keine Bank passt zu deinen Filtern.' : isSearchResult || searchText ? 'Keine Treffer für diese Suche.' : 'Hier gibt es noch keine Bänke.'}
            </p>
            <p className="max-w-xs text-xs text-stone-600 dark:text-stone-300">
              {filtersActive
                ? 'Mit den aktuellen Filtern passt keine Bank. Lockere die Filter oder zoome heraus.'
                : 'Verschiebe die Karte, zoome heraus oder trage hier die erste Bank ein.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {filtersActive && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="h-10 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:bg-forest-50 dark:border-white/20 dark:text-stone-100 dark:hover:bg-white/10"
                >
                  Filter zurücksetzen
                </button>
              )}
              <Link
                to="/hinzufuegen"
                className="flex h-10 items-center gap-1.5 rounded-full bg-forest-600 px-4 text-sm font-medium text-white transition hover:bg-forest-700"
              >
                <Plus size={16} aria-hidden="true" />
                Bank hinzufügen
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {items.slice(0, MAX_VISIBLE).map((item) => (
                <BenchResultCard key={item.bench.id} item={item} onShowOnMap={onShowOnMap} />
              ))}
            </ul>
            {total > MAX_VISIBLE && (
              <p className="mt-3 text-center text-xs text-stone-600 dark:text-stone-300">
                Es werden {MAX_VISIBLE} von {total} Bänken gezeigt. Zoome näher heran, um mehr zu sehen.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
