-- ============================================================================
-- Migration 0007: Add Battle Rooms & Battle Participants for Live Multiplayer CBT
-- Works across all installation patterns: prepai isolated schema, standard public,
-- and public.prepai_* prefixed setups.
-- ============================================================================

-- 1. PREPAI ISOLATED SCHEMA (Default: SUPABASE_DB_SCHEMA=prepai)
create schema if not exists prepai;

create table if not exists prepai.battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  host_user_id text not null,
  host_name text not null,
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  subjects text[] not null default '{}',
  question_ids text[] not null default '{}',
  mode text not null default 'quick' check (mode in ('quick', 'standard')),
  duration_seconds int not null default 900,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  max_participants int not null default 30,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  expires_at timestamptz not null default (now() + interval '2 hours')
);

create index if not exists idx_prepai_br_code on prepai.battle_rooms (code);
create index if not exists idx_prepai_br_status on prepai.battle_rooms (status);

create table if not exists prepai.battle_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references prepai.battle_rooms on delete cascade,
  user_id text,
  display_name text not null,
  is_host boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  score_percent int not null default 0,
  correct_count int not null default 0,
  total_answered int not null default 0,
  finished boolean not null default false,
  joined_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_prepai_bp_room on prepai.battle_participants (room_id);

alter table prepai.battle_rooms enable row level security;
alter table prepai.battle_participants enable row level security;

drop policy if exists "prepai_br_select" on prepai.battle_rooms;
create policy "prepai_br_select" on prepai.battle_rooms for select using (true);
drop policy if exists "prepai_bp_select" on prepai.battle_participants;
create policy "prepai_bp_select" on prepai.battle_participants for select using (true);


-- 2. STANDARD PUBLIC SCHEMA (SUPABASE_DB_SCHEMA=public or default)
create table if not exists public.battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  host_user_id text not null,
  host_name text not null,
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  subjects text[] not null default '{}',
  question_ids text[] not null default '{}',
  mode text not null default 'quick' check (mode in ('quick', 'standard')),
  duration_seconds int not null default 900,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  max_participants int not null default 30,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  expires_at timestamptz not null default (now() + interval '2 hours')
);

create index if not exists idx_public_br_code on public.battle_rooms (code);
create index if not exists idx_public_br_status on public.battle_rooms (status);

create table if not exists public.battle_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms on delete cascade,
  user_id text,
  display_name text not null,
  is_host boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  score_percent int not null default 0,
  correct_count int not null default 0,
  total_answered int not null default 0,
  finished boolean not null default false,
  joined_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_public_bp_room on public.battle_participants (room_id);

alter table public.battle_rooms enable row level security;
alter table public.battle_participants enable row level security;

drop policy if exists "public_br_select" on public.battle_rooms;
create policy "public_br_select" on public.battle_rooms for select using (true);
drop policy if exists "public_bp_select" on public.battle_participants;
create policy "public_bp_select" on public.battle_participants for select using (true);


-- 3. PREFIXED PUBLIC SCHEMA (SUPABASE_TABLE_PREFIX=prepai_)
create table if not exists public.prepai_battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  host_user_id text not null,
  host_name text not null,
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
  subjects text[] not null default '{}',
  question_ids text[] not null default '{}',
  mode text not null default 'quick' check (mode in ('quick', 'standard')),
  duration_seconds int not null default 900,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  max_participants int not null default 30,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  expires_at timestamptz not null default (now() + interval '2 hours')
);

create index if not exists idx_prefixed_br_code on public.prepai_battle_rooms (code);
create index if not exists idx_prefixed_br_status on public.prepai_battle_rooms (status);

create table if not exists public.prepai_battle_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.prepai_battle_rooms on delete cascade,
  user_id text,
  display_name text not null,
  is_host boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  score_percent int not null default 0,
  correct_count int not null default 0,
  total_answered int not null default 0,
  finished boolean not null default false,
  joined_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_prefixed_bp_room on public.prepai_battle_participants (room_id);

alter table public.prepai_battle_rooms enable row level security;
alter table public.prepai_battle_participants enable row level security;

drop policy if exists "prefixed_br_select" on public.prepai_battle_rooms;
create policy "prefixed_br_select" on public.prepai_battle_rooms for select using (true);
drop policy if exists "prefixed_bp_select" on public.prepai_battle_participants;
create policy "prefixed_bp_select" on public.prepai_battle_participants for select using (true);
