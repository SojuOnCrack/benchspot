-- Neue Baenke gehen zuerst in die Moderation, einfache Rate-Limits bremsen Spam,
-- und Foto-Uploads muessen zum Besitzer der Bank gehoeren.

alter table public.benches alter column status set default 'pending';

create or replace function public.current_user_is_moderator()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'moderator')
      and not coalesce(p.is_blocked, false)
  );
$$;

create or replace function public.limit_bench_spam()
returns trigger
language plpgsql
as $$
begin
  if public.current_user_is_moderator() then
    return new;
  end if;

  if (
    select count(*)
    from public.benches b
    where b.owner_id = auth.uid()
      and b.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Zu viele neue Baenke in kurzer Zeit. Bitte spaeter erneut versuchen.';
  end if;

  new.status := 'pending';
  return new;
end;
$$;

drop trigger if exists benches_limit_spam on public.benches;
create trigger benches_limit_spam
  before insert on public.benches
  for each row execute function public.limit_bench_spam();

-- Aufräumen: Objekte aus früheren Fassungen dieser Migration entfernen (idempotent)
drop trigger if exists benches_rate_limit on public.benches;
drop function if exists public.limit_bench_creation();
drop policy if exists "bench_photos_auth_insert" on storage.objects;
drop policy if exists "bench_photos_owner_delete" on storage.objects;
drop policy if exists "bench_photos_bench_owner_insert" on storage.objects;
drop policy if exists "bench_photos_owner_insert" on storage.objects;
drop policy if exists "bench_photos_uploader_or_moderator_delete" on storage.objects;
drop policy if exists "photos_insert_own" on public.photos;
drop policy if exists "photos_delete_own" on public.photos;
drop policy if exists "photos_insert_bench_owner" on public.photos;
drop policy if exists "photos_delete_bench_owner" on public.photos;

alter table public.benches alter column status set default 'pending';

create policy "bench_photos_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'bench-photos'
    and exists (
      select 1 from public.benches b
      where b.id::text = (storage.foldername(name))[1]
        and b.owner_id = auth.uid()
    )
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
    and (
      metadata->>'size' is null
      or ((metadata->>'size') ~ '^[0-9]+$' and (metadata->>'size')::bigint <= 5242880)
    )
  );

create policy "bench_photos_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'bench-photos'
    and (
      public.current_user_is_moderator()
      or exists (
        select 1 from public.benches b
        where b.id::text = (storage.foldername(name))[1]
          and b.owner_id = auth.uid()
      )
    )
  );

create policy "photos_insert_bench_owner" on public.photos
  for insert with check (
    auth.uid() = uploader_id
    and exists (select 1 from public.benches b where b.id = bench_id and b.owner_id = auth.uid())
    and split_part(storage_path, '/', 1) = bench_id::text
  );

create policy "photos_delete_bench_owner" on public.photos
  for delete using (
    public.current_user_is_moderator()
    or exists (select 1 from public.benches b where b.id = bench_id and b.owner_id = auth.uid())
  );
