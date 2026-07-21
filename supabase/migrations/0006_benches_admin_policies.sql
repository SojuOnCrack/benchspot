-- ============================================================================
-- Admins/Moderatoren konnten bisher weder fremde, unveroeffentlichte Baenke
-- sehen noch deren Status aendern oder sie loeschen (RLS erlaubte nur
-- status='published' oder owner_id=auth.uid()). Fuer die Admin-Baenke-
-- verwaltung braucht es explizite Policies, analog zu profiles_admin_update
-- aus 0003_profile_search_admin.sql.
-- ============================================================================

create policy "benches_admin_select" on public.benches
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'moderator')
    )
  );

create policy "benches_admin_update" on public.benches
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'moderator')
    )
  );

create policy "benches_admin_delete" on public.benches
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'moderator')
    )
  );
