-- ============================================================================
-- Fix: 0004 blockierte auch legitime Updates aus dem Supabase SQL Editor /
-- Service-Role-Kontext, weil dort auth.uid() NULL ist und daher nie als
-- "privilegiert" durchging. NULL-auth.uid() = Dashboard/Service-Role/System
-- (RLS wird dort ohnehin umgangen) -> als privilegiert behandeln.
-- ============================================================================

create or replace function public.protect_profile_privileged_fields()
returns trigger language plpgsql security definer as $$
declare
  acting_is_privileged boolean;
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if auth.uid() is null then
    return new; -- Dashboard / service_role / System-Kontext
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

create or replace function public.protect_bench_privileged_fields()
returns trigger language plpgsql security definer as $$
declare
  acting_is_privileged boolean;
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if auth.uid() is null then
    return new; -- Dashboard / service_role / System-Kontext
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
