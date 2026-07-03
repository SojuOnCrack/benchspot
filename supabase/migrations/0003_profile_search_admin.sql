-- ============================================================================
-- Signup profiles, map search, and moderation helpers
-- ============================================================================

alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

create policy "profiles_admin_update" on public.profiles
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','moderator')
        and not p.is_blocked
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text := nullif(trim(new.raw_user_meta_data->>'username'), '');
  final_username text;
begin
  final_username := coalesce(base_username, split_part(new.email, '@', 1), 'benchspot');
  final_username := regexp_replace(lower(final_username), '[^a-z0-9_]+', '_', 'g');
  final_username := trim(both '_' from final_username);

  if final_username = '' then
    final_username := 'benchspot';
  end if;

  insert into public.profiles (id, username)
  values (new.id, final_username)
  on conflict (id) do nothing;

  if not found then
    return new;
  end if;

  return new;
exception
  when unique_violation then
    insert into public.profiles (id, username)
    values (new.id, final_username || '_' || left(new.id::text, 8))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  min_rating numeric default 0,
  search_text text default ''
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
    and (
      coalesce(nullif(trim(search_text), ''), '') = ''
      or to_tsvector(
        'simple',
        concat_ws(
          ' ',
          b.title,
          b.description,
          b.notes,
          b.category,
          b.material,
          case when b.wheelchair_accessible then 'barrierefrei rollstuhl accessible' end,
          case when b.shade then 'schatten shade' end,
          case when b.sun then 'sonnig sun' end,
          case when b.dog_friendly then 'hunde hund dog' end,
          case when b.has_playground then 'spielplatz kinder playground' end,
          case when b.has_table then 'tisch table picknick' end,
          case when b.view_lake or b.view_river or b.view_mountain or b.view_city then 'aussicht panorama blick view' end,
          case when b.is_quiet then 'ruhig quiet' end,
          case when b.picnic_friendly then 'picknick picnic' end
        )
      ) @@ plainto_tsquery('simple', search_text)
    )
  limit 2000;
$$;
