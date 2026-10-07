import { supabase } from '@/lib/supabase'
import type { Bench, BenchFilters, MapBounds, Photo, Rating, Comment, Report, Profile } from '@/types/database'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

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
    search_text: filters.searchText?.trim() || '',
  })

  if (error) throw error
  return data as Bench[]
}

export async function searchBenches(searchText: string, limit = 50) {
  const query = searchText.trim()
  if (!query) return []

  const { data, error } = await supabase.rpc('search_benches', {
    search_text: query,
    result_limit: limit,
  })

  if (!error) return data as Bench[]

  const like = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_').replaceAll(',', ' ')}%`
  const fallback = await supabase
    .from('benches')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.${like},description.ilike.${like},notes.ilike.${like},category.ilike.${like}`)
    .limit(limit)

  if (fallback.error) throw fallback.error
  return fallback.data as Bench[]
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

export async function uploadBenchPhotos(benchId: string, userId: string, files: File[]) {
  if (files.length === 0) return []

  const rows: Array<Pick<Photo, 'bench_id' | 'uploader_id' | 'storage_path' | 'sort_order'>> = []

  for (const [index, file] of files.entries()) {
    if (!ALLOWED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
      throw new Error('Nur JPG, PNG oder WebP bis 5 MB pro Datei.')
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${benchId}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('bench-photos').upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })
    if (error) throw error
    rows.push({ bench_id: benchId, uploader_id: userId, storage_path: path, sort_order: index })
  }

  const { data, error } = await supabase.from('photos').insert(rows).select()
  if (error) throw error
  return data as Photo[]
}

export async function deleteBenchPhoto(photo: Photo) {
  const storage = await supabase.storage.from('bench-photos').remove([photo.storage_path])
  if (storage.error) throw storage.error

  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}

export async function fetchBenchPhotos(benchId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('bench_id', benchId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data as Photo[]).map((photo) => ({
    ...photo,
    public_url: supabase.storage.from('bench-photos').getPublicUrl(photo.storage_path).data.publicUrl,
  }))
}

export async function fetchBenchRatings(benchId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('bench_id', benchId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Rating[]
}

export async function upsertBenchRating(benchId: string, userId: string, stars: number) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({ bench_id: benchId, user_id: userId, stars }, { onConflict: 'bench_id,user_id' })
    .select()
    .single()

  if (error) throw error
  return data as Rating
}

export async function fetchBenchComments(benchId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles:user_id(username, display_name, avatar_url)')
    .eq('bench_id', benchId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Comment[]
}

export async function addBenchComment(benchId: string, userId: string, body: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ bench_id: benchId, user_id: userId, body })
    .select('*, profiles:user_id(username, display_name, avatar_url)')
    .single()

  if (error) throw error
  return data as Comment
}

export async function deleteBenchComment(id: string) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

export async function createReport(
  reporterId: string,
  targetType: Report['target_type'],
  targetId: string,
  reason: Report['reason'],
  details?: string
) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details?.trim() || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Report
}

export async function fetchOpenReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*, profiles:reporter_id(username, display_name, avatar_url)')
    .in('status', ['open', 'reviewing'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Report[]
}

export async function updateReportStatus(id: string, status: Report['status']) {
  const { data, error } = await supabase
    .from('reports')
    .update({ status, resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Report
}

export async function fetchProfilesForAdmin(search = '') {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(25)
  if (search.trim()) query = query.ilike('username', `%${search.trim()}%`)
  const { data, error } = await query
  if (error) throw error
  return data as Array<Profile & { is_blocked?: boolean }>
}

export async function setProfileBlocked(id: string, isBlocked: boolean) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_blocked: isBlocked })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Profile & { is_blocked?: boolean }
}

export async function fetchBenchesForAdmin(search = '') {
  let query = supabase
    .from('benches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

  const { data, error } = await query
  if (error) throw error
  return data as Bench[]
}

export async function updateBenchStatusAdmin(id: string, status: Bench['status']) {
  const { data, error } = await supabase
    .from('benches')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Bench
}

export async function deleteBenchAdmin(id: string) {
  const { error } = await supabase.from('benches').delete().eq('id', id)
  if (error) throw error
}
