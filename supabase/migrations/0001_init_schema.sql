-- ============================================================================
-- BenchSpot – Initial Schema
-- Konvention: alle Tabellen mit RLS, snake_case, uuid PKs, timestamps via trigger
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists postgis; -- geo queries (distance/bbox)

-- ----------------------------------------------------------------------------
-- profiles (1:1 zu auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  bench_count integer not null default 0,
  rating_count integer not null default 0,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- benches
-- ----------------------------------------------------------------------------
create table public.benches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  description text check (char_length(description) <= 2000),
  location geography(point, 4326) not null,
  lat double precision not null,
  lng double precision not null,
  category text not null default 'standard'
    check (category in ('standard','panorama','waterfront','forest','urban','picnic')),
  seats smallint check (seats between 1 and 20),
  material text check (material in ('wood','metal','stone','concrete','plastic','mixed')),
  has_roof boolean not null default false,
  has_backrest boolean not null default true,
  has_table boolean not null default false,
  wheelchair_accessible boolean not null default false,
  stroller_friendly boolean not null default false,
  has_bike_rack boolean not null default false,
  has_water_fountain boolean not null default false,
  has_trash_bin boolean not null default false,
  has_bbq boolean not null default false,
  has_playground boolean not null default false,
  dog_friendly boolean not null default false,
  shade boolean not null default false,
  sun boolean not null default false,
  view_lake boolean not null default false,
  view_river boolean not null default false,
  view_mountain boolean not null default false,
  view_city boolean not null default false,
  is_forest boolean not null default false,
  is_park boolean not null default false,
  is_quiet boolean not null default false,
  is_romantic boolean not null default false,
  picnic_friendly boolean not null default false,
  workspace_friendly boolean not null default false,
  notes text,
  avg_rating numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  favorite_count integer not null default 0,
  status text not null default 'pending' check (status in ('published','pending','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index benches_location_gix on public.benches using gist (location);
create index benches_status_idx on public.benches (status);
create index benches_owner_idx on public.benches (owner_id);
create index benches_category_idx on public.benches (category);

alter table public.benches enable row level security;

create policy "benches_select_published" on public.benches
  for select using (status = 'published' or owner_id = auth.uid());

create policy "benches_insert_own" on public.benches
  for insert with check (auth.uid() = owner_id);

create policy "benches_update_own" on public.benches
  for update using (auth.uid() = owner_id);

create policy "benches_delete_own" on public.benches
  for delete using (auth.uid() = owner_id);

-- keep lat/lng in sync with the geography point for simple client reads
create or replace function public.sync_bench_location()
returns trigger language plpgsql as $$
begin
  new.location := st_setsrid(st_point(new.lng, new.lat), 4326)::geography;
  return new;
end;
$$;

create trigger benches_sync_location
  before insert or update of lat, lng on public.benches
  for each row execute function public.sync_bench_location();

-- ----------------------------------------------------------------------------
-- photos
-- ----------------------------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  bench_id uuid not null references public.benches(id) on delete cascade,
  uploader_id uuid references public.profiles(id) on delete set null,
  storage_path text not null,
  width integer,
  height integer,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index photos_bench_idx on public.photos (bench_id);

alter table public.photos enable row level security;

create policy "photos_select_all" on public.photos for select using (true);

create policy "photos_insert_own" on public.photos
  for insert with check (auth.uid() = uploader_id);

create policy "photos_delete_own" on public.photos
  for delete using (auth.uid() = uploader_id);

-- ----------------------------------------------------------------------------
-- ratings
-- ----------------------------------------------------------------------------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  bench_id uuid not null references public.benches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  cleanliness smallint check (cleanliness between 1 and 5),
  view_rating smallint check (view_rating between 1 and 5),
  quietness smallint check (quietness between 1 and 5),
  comfort smallint check (comfort between 1 and 5),
  shade_rating smallint check (shade_rating between 1 and 5),
  safety smallint check (safety between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bench_id, user_id)
);

alter table public.ratings enable row level security;

create policy "ratings_select_all" on public.ratings for select using (true);

create policy "ratings_upsert_own" on public.ratings
  for insert with check (auth.uid() = user_id);

create policy "ratings_update_own" on public.ratings
  for update using (auth.uid() = user_id);

create policy "ratings_delete_own" on public.ratings
  for delete using (auth.uid() = user_id);

create or replace function public.recalc_bench_rating()
returns trigger language plpgsql as $$
declare
  target_bench uuid := coalesce(new.bench_id, old.bench_id);
begin
  update public.benches b
  set avg_rating = coalesce((select round(avg(stars)::numeric, 1) from public.ratings where bench_id = target_bench), 0),
      rating_count = (select count(*) from public.ratings where bench_id = target_bench)
  where b.id = target_bench;
  return null;
end;
$$;

create trigger ratings_recalc
  after insert or update or delete on public.ratings
  for each row execute function public.recalc_bench_rating();

-- ----------------------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  bench_id uuid not null references public.benches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, bench_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

create or replace function public.recalc_favorite_count()
returns trigger language plpgsql as $$
declare
  target_bench uuid := coalesce(new.bench_id, old.bench_id);
begin
  update public.benches
  set favorite_count = (select count(*) from public.favorites where bench_id = target_bench)
  where id = target_bench;
  return null;
end;
$$;

create trigger favorites_recalc
  after insert or delete on public.favorites
  for each row execute function public.recalc_favorite_count();

-- ----------------------------------------------------------------------------
-- comments (mit Antworten via parent_id)
-- ----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  bench_id uuid not null references public.benches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  like_count integer not null default 0,
  edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_bench_idx on public.comments (bench_id);
create index comments_parent_idx on public.comments (parent_id);

alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_update_own" on public.comments
  for update using (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- comment_likes
-- ----------------------------------------------------------------------------
create table public.comment_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

alter table public.comment_likes enable row level security;

create policy "comment_likes_select_all" on public.comment_likes for select using (true);

create policy "comment_likes_insert_own" on public.comment_likes
  for insert with check (auth.uid() = user_id);

create policy "comment_likes_delete_own" on public.comment_likes
  for delete using (auth.uid() = user_id);

create or replace function public.recalc_comment_likes()
returns trigger language plpgsql as $$
declare
  target_comment uuid := coalesce(new.comment_id, old.comment_id);
begin
  update public.comments
  set like_count = (select count(*) from public.comment_likes where comment_id = target_comment)
  where id = target_comment;
  return null;
end;
$$;

create trigger comment_likes_recalc
  after insert or delete on public.comment_likes
  for each row execute function public.recalc_comment_likes();

-- ----------------------------------------------------------------------------
-- reports (Bänke, Bilder, Kommentare)
-- ----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('bench','photo','comment','user')),
  target_id uuid not null,
  reason text not null check (reason in ('spam','inappropriate','duplicate','offensive','fake','other')),
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.reports enable row level security;

create policy "reports_insert_authenticated" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_own_or_admin" on public.reports
  for select using (
    auth.uid() = reporter_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "reports_admin_update" on public.reports
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

-- ----------------------------------------------------------------------------
-- badges / gamification
-- ----------------------------------------------------------------------------
create table public.badges (
  id text primary key,
  label text not null,
  description text not null,
  icon text not null
);

insert into public.badges (id, label, description, icon) values
  ('first_bench', 'Erste Bank', 'Erste Parkbank hinzugefügt', 'Sprout'),
  ('ten_benches', '10 Bänke', '10 Parkbänke hinzugefügt', 'TreeDeciduous'),
  ('hundred_benches', '100 Bänke', '100 Parkbänke hinzugefügt', 'Trees'),
  ('top_rater', 'Top Bewerter', '50+ Bewertungen abgegeben', 'Star'),
  ('explorer', 'Entdecker', 'Bänke in 5 verschiedenen Städten hinzugefügt', 'Compass');

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.user_badges enable row level security;
create policy "user_badges_select_all" on public.user_badges for select using (true);

-- ----------------------------------------------------------------------------
-- updated_at helper trigger, angewendet auf relevante Tabellen
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger benches_touch before update on public.benches
  for each row execute function public.set_updated_at();
create trigger ratings_touch before update on public.ratings
  for each row execute function public.set_updated_at();
create trigger comments_touch before update on public.comments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- bench_count auf profiles pflegen
-- ----------------------------------------------------------------------------
create or replace function public.recalc_owner_bench_count()
returns trigger language plpgsql as $$
declare
  target_owner uuid := coalesce(new.owner_id, old.owner_id);
begin
  if target_owner is not null then
    update public.profiles
    set bench_count = (select count(*) from public.benches where owner_id = target_owner and status = 'published')
    where id = target_owner;
  end if;
  return null;
end;
$$;

create trigger benches_owner_count
  after insert or update of status or delete on public.benches
  for each row execute function public.recalc_owner_bench_count();

-- ----------------------------------------------------------------------------
-- storage buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('bench-photos', 'bench-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "bench_photos_public_read" on storage.objects
  for select using (bucket_id = 'bench-photos');

create policy "bench_photos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'bench-photos' and auth.role() = 'authenticated');

create policy "bench_photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'bench-photos' and owner = auth.uid());

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());
