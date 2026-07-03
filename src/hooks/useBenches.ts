import { useQuery } from '@tanstack/react-query'
import { fetchBenchesInBounds, fetchBenchById } from '@/lib/api/benches'
import type { BenchFilters, MapBounds } from '@/types/database'

export function useBenchesInBounds(bounds: MapBounds | null, filters: BenchFilters) {
  return useQuery({
    queryKey: ['benches', bounds, filters],
    queryFn: () => fetchBenchesInBounds(bounds as MapBounds, filters),
    enabled: bounds !== null,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

export function useBench(id: string | undefined) {
  return useQuery({
    queryKey: ['bench', id],
    queryFn: () => fetchBenchById(id as string),
    enabled: !!id,
  })
}
