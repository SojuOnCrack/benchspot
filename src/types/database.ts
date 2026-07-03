// Spiegelt supabase/migrations/0001_init_schema.sql

export type BenchCategory =
  | 'standard'
  | 'panorama'
  | 'waterfront'
  | 'forest'
  | 'urban'
  | 'picnic'

export type BenchMaterial = 'wood' | 'metal' | 'stone' | 'concrete' | 'plastic' | 'mixed'
export type BenchStatus = 'published' | 'pending' | 'hidden' | 'removed'
export type UserRole = 'user' | 'moderator' | 'admin'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  bench_count: number
  rating_count: number
  role: UserRole
  is_blocked?: boolean
  created_at: string
  updated_at: string
}

export interface Bench {
  id: string
  owner_id: string | null
  title: string
  description: string | null
  lat: number
  lng: number
  category: BenchCategory
  seats: number | null
  material: BenchMaterial | null
  has_roof: boolean
  has_backrest: boolean
  has_table: boolean
  wheelchair_accessible: boolean
  stroller_friendly: boolean
  has_bike_rack: boolean
  has_water_fountain: boolean
  has_trash_bin: boolean
  has_bbq: boolean
  has_playground: boolean
  dog_friendly: boolean
  shade: boolean
  sun: boolean
  view_lake: boolean
  view_river: boolean
  view_mountain: boolean
  view_city: boolean
  is_forest: boolean
  is_park: boolean
  is_quiet: boolean
  is_romantic: boolean
  picnic_friendly: boolean
  workspace_friendly: boolean
  notes: string | null
  avg_rating: number
  rating_count: number
  favorite_count: number
  status: BenchStatus
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  bench_id: string
  uploader_id: string | null
  storage_path: string
  public_url?: string
  width: number | null
  height: number | null
  sort_order: number
  created_at: string
}

export interface Rating {
  id: string
  bench_id: string
  user_id: string
  stars: number
  cleanliness: number | null
  view_rating: number | null
  quietness: number | null
  comfort: number | null
  shade_rating: number | null
  safety: number | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  bench_id: string
  user_id: string
  parent_id: string | null
  body: string
  like_count: number
  edited: boolean
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
}

export interface Report {
  id: string
  reporter_id: string | null
  target_type: 'bench' | 'photo' | 'comment' | 'user'
  target_id: string
  reason: 'spam' | 'inappropriate' | 'duplicate' | 'offensive' | 'fake' | 'other'
  details: string | null
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at: string | null
  profiles?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
}

export interface BenchFilters {
  onlyAccessible?: boolean
  onlyShade?: boolean
  onlyView?: boolean
  onlyDogs?: boolean
  onlyPlayground?: boolean
  onlyTable?: boolean
  onlyWithPhotos?: boolean
  onlyRated?: boolean
  minRating?: number
  searchText?: string
}

export interface MapBounds {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}
