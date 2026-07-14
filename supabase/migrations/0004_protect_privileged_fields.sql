-- ============================================================================
-- Schutz privilegierter Spalten vor Selbst-Update durch normale User
-- Hintergrund: "profiles_update_own" / "benches_update_own" erlauben (korrekt)
-- dass Owner ihre eigene Zeile updaten – aber ohne Spalten-Einschränkung
-- konnte das auch role/is_blocked bzw. status/avg_rating/rating_count/
-- favorite_count umfassen. Fix per BEFORE-UPDATE-Trigger statt RLS, weil
-- Postgres RLS keine Spalten-granulare WITH CHECK-Logik kennt.
-- ============================================================================

-- profiles: role & is_blocked dürfen nur von admin/moderator geändert werden
create or replace function public.protect_profile_privileged_fields()
returns trigger language plpgsql security definer as $$
declare
  acting_is_privileged boolean;
begin
  -- Updates, die von anderen Triggern/Funktionen ausgelöst werden (z.B.
  -- handle_new_user), sollen nicht blockiert werden.
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'moderator')
  ) into acting_is_privileged;

  if not acting_is_privileged then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged on public.profiles;
create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- benches: status/avg_rating/rating_count/favorite_count dürfen nur vom
-- System (Trigger-Rekalkulation) oder von admin/moderator geändert werden
create or replace function public.protect_bench_privileged_fields()
returns trigger language plpgsql security definer as $$
declare
  acting_is_privileged boolean;
begin
  -- recalc_bench_rating / recalc_favorite_count aktualisieren benches
  -- verschachtelt aus einem anderen Trigger heraus – das lassen wir durch.
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'moderator')
  ) into acting_is_privileged;

  if not acting_is_privileged then
    new.status := old.status;
    new.avg_rating := old.avg_rating;
    new.rating_count := old.rating_count;
    new.favorite_count := old.favorite_count;
  end if;

  return new;
end;
$$;

drop trigger if exists benches_protect_privileged on public.benches;
create trigger benches_protect_privileged
  before update on public.benches
  for each row execute function public.protect_bench_privileged_fields();
