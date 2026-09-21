-- ============================================================================
-- Migration 0009: Add Announcements / Notices System
-- Supports admin notices regarding subject availability and general app updates.
-- Works across all installation patterns: prepai isolated schema, standard public,
-- and public.prepai_* prefixed setups.
-- ============================================================================

-- 1. PREPAI ISOLATED SCHEMA (Default: SUPABASE_DB_SCHEMA=prepai)
create schema if not exists prepai;

create table if not exists prepai.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'warning' check (type in ('info', 'warning', 'alert', 'success')),
  target_exam text not null default 'ALL' check (target_exam in ('ALL', 'JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_prepai_ann_active on prepai.announcements (is_active);
create index if not exists idx_prepai_ann_exam on prepai.announcements (target_exam);

alter table prepai.announcements enable row level security;

drop policy if exists "prepai_ann_select" on prepai.announcements;
create policy "prepai_ann_select" on prepai.announcements for select using (true);

-- Insert initial subject availability notice if table is empty
insert into prepai.announcements (title, message, type, target_exam, is_active)
select 
  'Subject Availability Notice',
  'Questions for Agricultural Science, Arabic, Computer Studies, French, and Further Mathematics are currently being compiled and reviewed manually. CBT practice for these subjects will be available shortly.',
  'warning',
  'ALL',
  true
where not exists (select 1 from prepai.announcements limit 1);


-- 2. STANDARD PUBLIC SCHEMA (SUPABASE_DB_SCHEMA=public or default)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'warning' check (type in ('info', 'warning', 'alert', 'success')),
  target_exam text not null default 'ALL' check (target_exam in ('ALL', 'JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_public_ann_active on public.announcements (is_active);
create index if not exists idx_public_ann_exam on public.announcements (target_exam);

alter table public.announcements enable row level security;

drop policy if exists "public_ann_select" on public.announcements;
create policy "public_ann_select" on public.announcements for select using (true);

insert into public.announcements (title, message, type, target_exam, is_active)
select 
  'Subject Availability Notice',
  'Questions for Agricultural Science, Arabic, Computer Studies, French, and Further Mathematics are currently being compiled and reviewed manually. CBT practice for these subjects will be available shortly.',
  'warning',
  'ALL',
  true
where not exists (select 1 from public.announcements limit 1);


-- 3. PREFIXED SCHEMA (SUPABASE_TABLE_PREFIX=prepai_)
create table if not exists public.prepai_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'warning' check (type in ('info', 'warning', 'alert', 'success')),
  target_exam text not null default 'ALL' check (target_exam in ('ALL', 'JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_prefixed_ann_active on public.prepai_announcements (is_active);
create index if not exists idx_prefixed_ann_exam on public.prepai_announcements (target_exam);

alter table public.prepai_announcements enable row level security;

drop policy if exists "prefixed_ann_select" on public.prepai_announcements;
create policy "prefixed_ann_select" on public.prepai_announcements for select using (true);

insert into public.prepai_announcements (title, message, type, target_exam, is_active)
select 
  'Subject Availability Notice',
  'Questions for Agricultural Science, Arabic, Computer Studies, French, and Further Mathematics are currently being compiled and reviewed manually. CBT practice for these subjects will be available shortly.',
  'warning',
  'ALL',
  true
where not exists (select 1 from public.prepai_announcements limit 1);
