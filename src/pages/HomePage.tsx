import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BenchMap from '@/components/map/BenchMap'
import FilterBar from '@/components/bench/FilterBar'
import { useGeolocation } from '@/hooks/useGeolocation'
import type { BenchFilters } from '@/types/database'

export default function HomePage() {
  const [filters, setFilters] = useState<BenchFilters>({})
  const geo = useGeolocation()
  const navigate = useNavigate()

  const userLocation = geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng } : null

  return (
    <div className="relative h-full w-full">
      <BenchMap
        filters={filters}
        userLocation={userLocation}
        onBenchSelect={(id) => navigate(`/bank/${id}`)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[900]">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
    </div>
  )
}
