-- ============================================================================
-- RPCs für Karten-/Suchabfragen
-- ============================================================================

-- Bänke innerhalb eines Bounding Box + optionaler Filter, für Map-Viewport-Loading
create or replace function public.benches_in_bbox(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  only_accessible boolean default false,
  only_shade boolean default false,
  only_view boolean default false,
  only_dogs boolean default false,
  only_playground boolean default false,
  only_table boolean default false,
  only_with_photos boolean default false,
  only_rated boolean default false,
  min_rating numeric default 0
)
returns setof public.benches
language sql stable as $$
  select b.*
  from public.benches b
  where b.status = 'published'
    and b.lat between min_lat and max_lat
    and b.lng between min_lng and max_lng
    and (not only_accessible or b.wheelchair_accessible)
    and (not only_shade or b.shade)
    and (not only_view or (b.view_lake or b.view_river or b.view_mountain or b.view_city))
    and (not only_dogs or b.dog_friendly)
    and (not only_playground or b.has_playground)
    and (not only_table or b.has_table)
    and (not only_with_photos or exists (select 1 from public.photos p where p.bench_id = b.id))
    and (not only_rated or b.rating_count > 0)
    and b.avg_rating >= min_rating
  limit 2000;
$$;

-- Nächstgelegene Bänke zu einem Punkt (für "Sortiert nach Entfernung")
create or replace function public.benches_nearby(
  origin_lat double precision,
  origin_lng double precision,
  radius_meters integer default 5000,
  result_limit integer default 50
)
returns table (
  id uuid,
  title text,
  lat double precision,
  lng double precision,
  avg_rating numeric,
  distance_meters double precision
)
language sql stable as $$
  select b.id, b.title, b.lat, b.lng, b.avg_rating,
         st_distance(b.location, st_setsrid(st_point(origin_lng, origin_lat), 4326)::geography) as distance_meters
  from public.benches b
  where b.status = 'published'
    and st_dwithin(b.location, st_setsrid(st_point(origin_lng, origin_lat), 4326)::geography, radius_meters)
  order by distance_meters asc
  limit result_limit;
$$;

-- Badge-Vergabe nach Bank-Erstellung prüfen (wird per Edge Function / Trigger aufgerufen)
create or replace function public.check_and_award_badges(target_user uuid)
returns void language plpgsql as $$
declare
  bench_total integer;
  rating_total integer;
  city_total integer;
begin
  select bench_count into bench_total from public.profiles where id = target_user;
  select rating_count into rating_total from public.profiles where id = target_user;

  if bench_total >= 1 then
    insert into public.user_badges (user_id, badge_id) values (target_user, 'first_bench')
      on conflict do nothing;
  end if;
  if bench_total >= 10 then
    insert into public.user_badges (user_id, badge_id) values (target_user, 'ten_benches')
      on conflict do nothing;
  end if;
  if bench_total >= 100 then
    insert into public.user_badges (user_id, badge_id) values (target_user, 'hundred_benches')
      on conflict do nothing;
  end if;
  if rating_total >= 50 then
    insert into public.user_badges (user_id, badge_id) values (target_user, 'top_rater')
      on conflict do nothing;
  end if;
end;
$$;
