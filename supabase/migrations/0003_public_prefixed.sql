-- ============================================================================
-- PrepAI — PREFIXED INSTALL (no dashboard configuration required)
--
-- Creates every PrepAI table inside the existing `public` schema, prefixed
-- with `prepai_`. Because `public` is already exposed to the Data API, this
-- works immediately — no "Exposed schemas" change needed.
--
-- Nothing existing is touched: your email app's `profiles`, `campaigns`,
-- `templates`, `contacts`, `email_lists`, `email_logs` and the stale
-- `questions` table are all left exactly as they are, and your
-- handle_new_user() trigger is NOT modified.
--
-- Safe to re-run. After running, set in .env.local:
--     SUPABASE_TABLE_PREFIX=prepai_
-- ============================================================================

create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------- profiles
create table if not exists public.prepai_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  target_exam text check (target_exam in ('JAMB', 'WAEC', 'NECO')),
  avatar_url text,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'active', 'expired')),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------- questions
create table if not exists public.prepai_questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO')),
  subject text not null,
  topic text not null,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null check (correct_answer in ('A','B','C','D','E')),
  explanation text,
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  year int,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_q_exam_subject on public.prepai_questions (exam, subject);
create index if not exists idx_q_topic        on public.prepai_questions (topic);
create index if not exists idx_q_active       on public.prepai_questions (is_active);

-- -------------------------------------------------------- practice_sessions
create table if not exists public.prepai_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO')),
  subjects text[] not null default '{}',
  mode text not null default 'quick' check (mode in ('quick','standard','mock','topic')),
  total_questions int not null,
  question_ids uuid[] not null default '{}',
  duration_seconds int not null default 600,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  unanswered_count int not null default 0,
  score_percent int,
  time_taken_seconds int,
  status text not null default 'in_progress'
    check (status in ('in_progress','completed','abandoned')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists idx_ps_user on public.prepai_practice_sessions (user_id, started_at desc);

-- ---------------------------------------------------------- session_answers
create table if not exists public.prepai_session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.prepai_practice_sessions on delete cascade,
  question_id uuid not null references public.prepai_questions on delete cascade,
  selected_option text,
  is_correct boolean,
  flagged boolean not null default false,
  time_taken_ms int not null default 0,
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists idx_sa_session on public.prepai_session_answers (session_id);

-- --------------------------------------------------------------- textbooks
create table if not exists public.prepai_textbooks (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO')),
  subject text not null,
  book_title text not null,
  title text not null,
  chapter_number int,
  description text,
  topic_tags text[] not null default '{}',
  content_html text,
  file_path text,
  page_count int,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_tb_tags on public.prepai_textbooks using gin (topic_tags);
create index if not exists idx_tb_exam on public.prepai_textbooks (exam, subject);

-- ---------------------------------------------------------- weakness_reports
create table if not exists public.prepai_weakness_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  session_id uuid references public.prepai_practice_sessions on delete cascade,
  exam text not null,
  subject text not null,
  topic text not null,
  weakness_score int not null check (weakness_score between 0 and 100),
  total_attempted int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  severity text not null default 'weak' check (severity in ('critical','weak','fair','strong')),
  recommendation text,
  textbook_id uuid references public.prepai_textbooks on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wr_user    on public.prepai_weakness_reports (user_id, created_at desc);
create index if not exists idx_wr_session on public.prepai_weakness_reports (session_id);

-- --------------------------------------------------------------- bookmarks
create table if not exists public.prepai_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  textbook_id uuid not null references public.prepai_textbooks on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, textbook_id)
);

-- ---------------------------------------------------------------- payments
create table if not exists public.prepai_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  email text not null,
  amount int not null,
  paystack_ref text not null unique,
  paystack_transaction_id text,
  channel text,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_pay_user on public.prepai_payments (user_id, created_at desc);

-- ------------------------------------------------------------ app_settings
create table if not exists public.prepai_app_settings (
  id text primary key default 'singleton',
  site_name text not null default 'PrepAI',
  price_kobo int not null default 100000,
  currency text not null default 'NGN',
  free_questions_per_day int not null default 10,
  paywall_enabled boolean not null default true,
  weakness_threshold int not null default 50
);

insert into public.prepai_app_settings (id) values ('singleton') on conflict (id) do nothing;

-- ----------------------------------------------------------- battle_rooms
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

-- ----------------------------------------------------- battle_participants
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

-- ============================================================================
-- Access
-- PrepAI reaches Postgres only through the server using the service_role key,
-- which bypasses RLS. We still enable RLS on every table and grant nothing to
-- anon/authenticated, so the tables cannot be read directly from a browser
-- even if the schema is exposed.
-- ============================================================================
-- public is already granted to service_role by Supabase; nothing extra needed.

alter table public.prepai_profiles          enable row level security;
alter table public.prepai_questions         enable row level security;
alter table public.prepai_practice_sessions enable row level security;
alter table public.prepai_session_answers   enable row level security;
alter table public.prepai_weakness_reports  enable row level security;
alter table public.prepai_textbooks         enable row level security;
alter table public.prepai_bookmarks         enable row level security;
alter table public.prepai_payments          enable row level security;
alter table public.prepai_app_settings      enable row level security;
alter table public.prepai_battle_rooms       enable row level security;
alter table public.prepai_battle_participants enable row level security;

-- ============================================================================
-- Storage bucket for textbook files (safe to run on a shared project)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('textbooks', 'textbooks', true)
on conflict (id) do nothing;

-- Tell PostgREST to pick up the new schema immediately
notify pgrst, 'reload schema';

-- Sanity check — should list 9 tables
select table_name
from information_schema.tables
where table_schema = 'public' and table_name like 'prepai_%'
order by table_name;
