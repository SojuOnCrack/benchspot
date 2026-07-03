import { supabase } from '@/lib/supabase'
import type { Bench, BenchFilters, MapBounds } from '@/types/database'

export async function fetchBenchesInBounds(bounds: MapBounds, filters: BenchFilters = {}) {
  const { data, error } = await supabase.rpc('benches_in_bbox', {
    min_lat: bounds.minLat,
    min_lng: bounds.minLng,
    max_lat: bounds.maxLat,
    max_lng: bounds.maxLng,
    only_accessible: filters.onlyAccessible ?? false,
    only_shade: filters.onlyShade ?? false,
    only_view: filters.onlyView ?? false,
    only_dogs: filters.onlyDogs ?? false,
    only_playground: filters.onlyPlayground ?? false,
    only_table: filters.onlyTable ?? false,
    only_with_photos: filters.onlyWithPhotos ?? false,
    only_rated: filters.onlyRated ?? false,
    min_rating: filters.minRating ?? 0,
  })

  if (error) throw error
  return data as Bench[]
}

export async function fetchBenchById(id: string) {
  const { data, error } = await supabase.from('benches').select('*').eq('id', id).single()
  if (error) throw error
  return data as Bench
}

export async function fetchNearbyBenches(lat: number, lng: number, radiusMeters = 5000, limit = 50) {
  const { data, error } = await supabase.rpc('benches_nearby', {
    origin_lat: lat,
    origin_lng: lng,
    radius_meters: radiusMeters,
    result_limit: limit,
  })
  if (error) throw error
  return data
}

export type NewBenchInput = Omit<
  Bench,
  | 'id'
  | 'owner_id'
  | 'avg_rating'
  | 'rating_count'
  | 'favorite_count'
  | 'status'
  | 'created_at'
  | 'updated_at'
>

export async function createBench(input: NewBenchInput, ownerId: string) {
  const { data, error } = await supabase
    .from('benches')
    .insert({ ...input, owner_id: ownerId })
    .select()
    .single()

  if (error) throw error
  return data as Bench
}

export async function updateBench(id: string, patch: Partial<NewBenchInput>) {
  const { data, error } = await supabase.from('benches').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Bench
}

export async function deleteBench(id: string) {
  const { error } = await supabase.from('benches').delete().eq('id', id)
  if (error) throw error
}

export async function fetchFavoriteBenchIds(userId: string) {
  const { data, error } = await supabase.from('favorites').select('bench_id').eq('user_id', userId)
  if (error) throw error
  return data.map((row) => row.bench_id as string)
}

export async function toggleFavorite(userId: string, benchId: string, isFavorite: boolean) {
  if (isFavorite) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('bench_id', benchId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('favorites').insert({ user_id: userId, bench_id: benchId })
    if (error) throw error
  }
}
