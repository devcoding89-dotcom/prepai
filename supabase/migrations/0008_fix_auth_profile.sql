-- ============================================================================
-- Migration 0008: Fix auth & profile issues for new user sign-up / sign-in
-- 
-- This migration fixes the following issues:
--   1. `target_exam` check constraint on prepai.profiles did not include
--      'AI GENERATED' (migration 0005 may not have run on the prepai schema).
--   2. `exam_date` column may be missing from prepai.profiles (migration 0006
--      may not have applied cleanly).
--   3. Missing RLS policy bypass for service_role on profiles INSERT/UPDATE.
--   4. PostgREST schema cache reload to ensure all changes are picked up.
-- ============================================================================

-- 1. Add exam_date column to prepai.profiles if it doesn't exist
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'prepai'
      and table_name   = 'profiles'
      and column_name  = 'exam_date'
  ) then
    alter table prepai.profiles add column exam_date date;
    raise notice 'Added exam_date column to prepai.profiles';
  else
    raise notice 'exam_date column already exists on prepai.profiles';
  end if;
end $$;

-- 2. Fix target_exam CHECK constraint to include 'AI GENERATED'
do $$
declare
  constraint_name text;
begin
  -- Drop any old constraint that lacks 'AI GENERATED'
  for constraint_name in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'prepai.profiles'::regclass
      and con.contype  = 'c'
      and pg_get_constraintdef(con.oid) like '%target_exam%'
      and pg_get_constraintdef(con.oid) not like '%AI GENERATED%'
  loop
    execute format('alter table prepai.profiles drop constraint %I', constraint_name);
    raise notice 'Dropped old target_exam constraint: %', constraint_name;
  end loop;

  -- Add the correct constraint (if it doesn't exist already)
  if not exists (
    select 1
    from pg_constraint con
    where con.conrelid = 'prepai.profiles'::regclass
      and con.contype  = 'c'
      and pg_get_constraintdef(con.oid) like '%AI GENERATED%'
      and pg_get_constraintdef(con.oid) like '%target_exam%'
  ) then
    alter table prepai.profiles
      add constraint profiles_target_exam_ai_check
      check (target_exam in ('JAMB', 'WAEC', 'NECO', 'AI GENERATED'));
    raise notice 'Added updated target_exam constraint with AI GENERATED';
  end if;
end $$;

-- 3. Ensure service_role has full grants (idempotent)
grant usage on schema prepai to service_role;
grant all on all tables    in schema prepai to service_role;
grant all on all sequences in schema prepai to service_role;
alter default privileges in schema prepai grant all on tables    to service_role;
alter default privileges in schema prepai grant all on sequences to service_role;

-- 4. Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- Sanity check — show the profiles columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'prepai'
  and table_name   = 'profiles'
order by ordinal_position;
