import { useQuery } from '@tanstack/react-query'
import {
  fetchBenchById,
  fetchBenchComments,
  fetchBenchPhotos,
  fetchBenchRatings,
  fetchBenchesInBounds,
  fetchOpenReports,
  fetchProfilesForAdmin,
  searchBenches,
} from '@/lib/api/benches'
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

export function useBenchSearch(searchText: string) {
  return useQuery({
    queryKey: ['bench-search', searchText],
    queryFn: () => searchBenches(searchText),
    enabled: searchText.trim().length > 0,
    staleTime: 60_000,
  })
}

export function useBench(id: string | undefined) {
  return useQuery({
    queryKey: ['bench', id],
    queryFn: () => fetchBenchById(id as string),
    enabled: !!id,
  })
}

export function useBenchPhotos(id: string | undefined) {
  return useQuery({
    queryKey: ['bench-photos', id],
    queryFn: () => fetchBenchPhotos(id as string),
    enabled: !!id,
  })
}

export function useBenchRatings(id: string | undefined) {
  return useQuery({
    queryKey: ['bench-ratings', id],
    queryFn: () => fetchBenchRatings(id as string),
    enabled: !!id,
  })
}

export function useBenchComments(id: string | undefined) {
  return useQuery({
    queryKey: ['bench-comments', id],
    queryFn: () => fetchBenchComments(id as string),
    enabled: !!id,
  })
}

export function useOpenReports(enabled = true) {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: fetchOpenReports,
    enabled,
  })
}

export function useAdminProfiles(search: string, enabled = true) {
  return useQuery({
    queryKey: ['admin-profiles', search],
    queryFn: () => fetchProfilesForAdmin(search),
    enabled,
  })
}
