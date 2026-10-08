import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LocateFixed } from 'lucide-react'
import BenchMap from '@/components/map/BenchMap'
import FilterBar from '@/components/bench/FilterBar'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useBenchSearch } from '@/hooks/useBenches'
import { geocodePlace } from '@/lib/api/geocoding'
import type { BenchFilters } from '@/types/database'

export default function HomePage() {
  const [filters, setFilters] = useState<BenchFilters>({})
  const [searchParams] = useSearchParams()
  // Standort erst nach Klick auf den Standort-Button abfragen.
  const geo = useGeolocation(false, false)

  const userLocation = geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : null
  const searchText = (searchParams.get('q') ?? '').trim()
  const { data: searchBenches = [], isFetching: isSearchingBenches } = useBenchSearch(searchText)
  const { data: searchPlace, isFetching: isSearchingPlace } = useQuery({
    queryKey: ['place-search', searchText],
    queryFn: () => geocodePlace(searchText),
    enabled: searchText.length > 0,
    staleTime: 300_000,
  })

  const firstSearchBench = searchBenches[0]
  const searchFocus = firstSearchBench
    ? { lat: firstSearchBench.lat, lng: firstSearchBench.lng, zoom: 16 }
    : searchPlace
      ? { lat: searchPlace.lat, lng: searchPlace.lng, zoom: 13 }
      : null

  const benchesOverride = searchText && searchBenches.length > 0 ? searchBenches : undefined

  return (
    <div className="relative h-full w-full">
      <BenchMap
        filters={filters}
        userLocation={userLocation}
        focusLocation={searchFocus}
        benchesOverride={benchesOverride}
        loadingOverride={isSearchingBenches || isSearchingPlace}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[900]">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
      <div className="absolute bottom-24 right-4 z-[900] flex max-w-[calc(100%-2rem)] flex-col items-end gap-2 sm:bottom-4">
        {geo.error && (
          <p className="rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-stone-700 shadow-sm backdrop-blur dark:bg-stone-900/95 dark:text-stone-100">
            {geo.error}
          </p>
        )}
        <button
          type="button"
          onClick={geo.requestLocation}
          disabled={geo.loading}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-forest-700 shadow-lg shadow-black/15 transition hover:bg-forest-50 disabled:opacity-60 dark:bg-stone-900 dark:text-forest-200"
          aria-label="Eigenen Standort anzeigen"
        >
          <LocateFixed size={22} className={geo.loading ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  )
}
