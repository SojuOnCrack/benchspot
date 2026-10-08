-- Neue Eintraege werden zuerst moderiert. Bestehende, bereits sichtbare Inhalte
-- bleiben unveraendert; nur kuenftige Inserts erhalten den sicheren Default.
alter table public.benches alter column status set default 'pending';

-- Der Besitzer einer Bank (oder die Moderation) darf nur in deren Ordner schreiben.
drop policy if exists "bench_photos_auth_insert" on storage.objects;
create policy "bench_photos_bench_owner_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'bench-photos'
    and split_part(name, '/', 1) in (
      select id::text from public.benches where owner_id = auth.uid()
    )
  );

-- Ein Foto kann nur vom Uploader oder der Moderation entfernt werden.
drop policy if exists "bench_photos_owner_delete" on storage.objects;
create policy "bench_photos_uploader_or_moderator_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'bench-photos' and (
      owner = auth.uid() or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator')
      )
    )
  );

-- Rate limit fuer neue Bankeintraege: maximal 5 je Stunde und Benutzer.
create or replace function public.limit_bench_creation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.benches where owner_id = auth.uid() and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Zu viele neue Bänke. Bitte versuche es später erneut.';
  end if;
  return new;
end;
$$;
drop trigger if exists benches_rate_limit on public.benches;
create trigger benches_rate_limit before insert on public.benches
  for each row execute function public.limit_bench_creation();
