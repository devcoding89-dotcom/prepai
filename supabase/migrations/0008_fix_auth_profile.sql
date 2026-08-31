-- ============================================================================
-- Migration 0008: Fix auth & profile issues for new user sign-up / sign-in
-- 
-- This migration fixes the following issues:
--   1. "Database error creating new user" on signup:
--      A legacy or broken trigger `on_auth_user_created` on `auth.users` was
--      calling `public.handle_new_user()`, which attempts an insert into
--      `public.profiles (id, email, full_name)` where `email` column was missing
--      or schema mismatched.
--      PrepAI manages profiles in `prepai.profiles` directly inside app code.
--      This migration drops the broken trigger and makes `public.handle_new_user()`
--      fail-safe.
--   2. `target_exam` check constraint on `prepai.profiles` including 'AI GENERATED'.
--   3. `exam_date` column on `prepai.profiles`.
--   4. Full service_role grants and PostgREST schema cache reload.
-- ============================================================================

-- 1. DROP BROKEN AUTH TRIGGER THAT CAUSES "Database error creating new user"
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Make handle_new_user() function fail-safe so it never aborts user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- PrepAI creates profiles in prepai.profiles directly from the Next.js backend.
  -- This function is made fail-safe so no database exception blocks auth signup.
  begin
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'profiles'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
      ) then
        insert into public.profiles (id, email, full_name)
        values (new.id, new.email, new.raw_user_meta_data->>'full_name')
        on conflict (id) do nothing;
      else
        insert into public.profiles (id, full_name)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (id) do nothing;
      end if;
    end if;
  exception when others then
    -- Catch all errors so auth.users insert NEVER fails
    null;
  end;
  return new;
end;
$$;

-- 3. Add exam_date column to prepai.profiles if it doesn't exist
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

-- 4. Fix target_exam CHECK constraint to include 'AI GENERATED' on prepai.profiles
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

-- 5. Ensure service_role has full grants (idempotent)
grant usage on schema prepai to service_role;
grant all on all tables    in schema prepai to service_role;
grant all on all sequences in schema prepai to service_role;
alter default privileges in schema prepai grant all on tables    to service_role;
alter default privileges in schema prepai grant all on sequences to service_role;

-- 6. Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- Sanity check — show the profiles columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'prepai'
  and table_name   = 'profiles'
order by ordinal_position;
