import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LocateFixed, TriangleAlert } from 'lucide-react'
import BenchMap, { type MapFocus, type MapResults } from '@/components/map/BenchMap'
import FilterBar from '@/components/bench/FilterBar'
import BenchResultPanel from '@/components/bench/BenchResultPanel'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useBenchSearch } from '@/hooks/useBenches'
import { geocodePlace } from '@/lib/api/geocoding'
import type { Bench, BenchFilters } from '@/types/database'

const INITIAL_RESULTS: MapResults = { benches: [], loading: true, error: false, refetch: () => undefined }

export default function HomePage() {
  const [filters, setFilters] = useState<BenchFilters>({})
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<MapResults>(INITIAL_RESULTS)
  const [manualFocus, setManualFocus] = useState<(MapFocus & { forText: string }) | null>(null)
  // Standort erst nach Klick auf den Standort-Button abfragen.
  const geo = useGeolocation(false, false)

  const userLocation = useMemo(
    () => (geo.lat !== null && geo.lng !== null ? { lat: geo.lat, lng: geo.lng } : null),
    [geo.lat, geo.lng]
  )
  const searchText = (searchParams.get('q') ?? '').trim()
  const listOpen = searchParams.get('ansicht') === 'liste'
  const { data: searchBenches = [], isFetching: isSearchingBenches } = useBenchSearch(searchText)
  const { data: searchPlace, isFetching: isSearchingPlace } = useQuery({
    queryKey: ['place-search', searchText],
    queryFn: () => geocodePlace(searchText),
    enabled: searchText.length > 0,
    staleTime: 300_000,
  })

  const firstSearchBench = searchBenches[0]
  const searchFocus = useMemo<MapFocus | null>(() => {
    if (firstSearchBench) return { lat: firstSearchBench.lat, lng: firstSearchBench.lng, zoom: 16 }
    if (searchPlace) return { lat: searchPlace.lat, lng: searchPlace.lng, zoom: 13 }
    return null
  }, [firstSearchBench, searchPlace])

  // Ein Klick auf "Auf Karte zeigen" gilt nur für die aktuelle Suche.
  const focus = manualFocus && manualFocus.forText === searchText ? manualFocus : searchFocus
  const benchesOverride = searchText && searchBenches.length > 0 ? searchBenches : undefined
  const searchLoading = isSearchingBenches || isSearchingPlace
  const filtersActive = Object.values(filters).some(Boolean)

  const setListOpen = useCallback(
    (open: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (open) next.set('ansicht', 'liste')
          else next.delete('ansicht')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const showOnMap = useCallback(
    (bench: Bench) => {
      setManualFocus({ lat: bench.lat, lng: bench.lng, zoom: 17, nonce: Date.now(), forText: searchText })
      setListOpen(false)
    },
    [searchText, setListOpen]
  )

  const resetFilters = useCallback(() => setFilters({}), [])
  const toggleList = useCallback(() => setListOpen(!listOpen), [listOpen, setListOpen])

  return (
    <div className="relative h-full w-full md:flex">
      <div className="relative h-full min-w-0 md:flex-1">
        <BenchMap
          filters={filters}
          userLocation={userLocation}
          focusLocation={focus}
          benchesOverride={benchesOverride}
          loadingOverride={searchLoading}
          onResults={setResults}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[900]">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
        <div
          className={`absolute bottom-[4.75rem] right-4 z-[900] flex max-w-[calc(100%-2rem)] flex-col items-end gap-2 md:bottom-8 ${
            listOpen ? 'max-md:hidden' : ''
          }`}
        >
          {geo.error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-stone-800 shadow-lg dark:bg-stone-900 dark:text-stone-100"
            >
              <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
              {geo.error}
            </p>
          )}
          <button
            type="button"
            onClick={geo.requestLocation}
            disabled={geo.loading}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg shadow-black/15 transition hover:bg-forest-50 active:scale-95 disabled:opacity-60 dark:bg-stone-900 ${
              userLocation ? 'text-blue-600 dark:text-blue-400' : 'text-forest-700 dark:text-forest-200'
            }`}
            aria-label={geo.loading ? 'Standort wird ermittelt' : 'Eigenen Standort anzeigen'}
          >
            <LocateFixed size={22} className={geo.loading ? 'animate-pulse' : ''} aria-hidden="true" />
          </button>
        </div>
      </div>

      <BenchResultPanel
        benches={results.benches}
        loading={results.loading}
        error={results.error}
        onRetry={() => void results.refetch()}
        searchText={searchText}
        isSearchResult={Boolean(benchesOverride)}
        userLocation={userLocation}
        filtersActive={filtersActive}
        onResetFilters={resetFilters}
        open={listOpen}
        onToggle={toggleList}
        onShowOnMap={showOnMap}
      />
    </div>
  )
}
