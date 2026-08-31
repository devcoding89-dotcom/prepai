-- ============================================================================
-- PrepAI — ISOLATED SCHEMA INSTALL
--
-- Use this file INSTEAD OF 0001_init.sql when the Supabase project is already
-- used by another application. Everything lives in a dedicated `prepai`
-- schema, so nothing in `public` is touched: no table collisions, and your
-- existing handle_new_user() trigger is left exactly as it is.
--
-- After running this:
--   Dashboard -> Project Settings -> API -> "Exposed schemas"
--   add:  prepai      (keep public and graphql_public in the list)
--
-- Then set in .env.local:
--   SUPABASE_DB_SCHEMA=prepai
-- ============================================================================

create extension if not exists "pgcrypto";
create schema if not exists prepai;

-- ---------------------------------------------------------------- profiles
create table if not exists prepai.profiles (
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
create table if not exists prepai.questions (
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

create index if not exists idx_q_exam_subject on prepai.questions (exam, subject);
create index if not exists idx_q_topic        on prepai.questions (topic);
create index if not exists idx_q_active       on prepai.questions (is_active);

-- -------------------------------------------------------- practice_sessions
create table if not exists prepai.practice_sessions (
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

create index if not exists idx_ps_user on prepai.practice_sessions (user_id, started_at desc);

-- ---------------------------------------------------------- session_answers
create table if not exists prepai.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references prepai.practice_sessions on delete cascade,
  question_id uuid not null references prepai.questions on delete cascade,
  selected_option text,
  is_correct boolean,
  flagged boolean not null default false,
  time_taken_ms int not null default 0,
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists idx_sa_session on prepai.session_answers (session_id);

-- --------------------------------------------------------------- textbooks
create table if not exists prepai.textbooks (
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

create index if not exists idx_tb_tags on prepai.textbooks using gin (topic_tags);
create index if not exists idx_tb_exam on prepai.textbooks (exam, subject);

-- ---------------------------------------------------------- weakness_reports
create table if not exists prepai.weakness_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  session_id uuid references prepai.practice_sessions on delete cascade,
  exam text not null,
  subject text not null,
  topic text not null,
  weakness_score int not null check (weakness_score between 0 and 100),
  total_attempted int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  severity text not null default 'weak' check (severity in ('critical','weak','fair','strong')),
  recommendation text,
  textbook_id uuid references prepai.textbooks on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wr_user    on prepai.weakness_reports (user_id, created_at desc);
create index if not exists idx_wr_session on prepai.weakness_reports (session_id);

-- --------------------------------------------------------------- bookmarks
create table if not exists prepai.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  textbook_id uuid not null references prepai.textbooks on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, textbook_id)
);

-- ---------------------------------------------------------------- payments
create table if not exists prepai.payments (
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

create index if not exists idx_pay_user on prepai.payments (user_id, created_at desc);

-- ------------------------------------------------------------ app_settings
create table if not exists prepai.app_settings (
  id text primary key default 'singleton',
  site_name text not null default 'PrepAI',
  price_kobo int not null default 100000,
  currency text not null default 'NGN',
  free_questions_per_day int not null default 10,
  paywall_enabled boolean not null default true,
  weakness_threshold int not null default 50
);

insert into prepai.app_settings (id) values ('singleton') on conflict (id) do nothing;

-- ----------------------------------------------------------- battle_rooms
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

create index if not exists idx_br_code on prepai.battle_rooms (code);
create index if not exists idx_br_status on prepai.battle_rooms (status);

-- ----------------------------------------------------- battle_participants
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

create index if not exists idx_bp_room on prepai.battle_participants (room_id);

-- ============================================================================
-- Access
-- PrepAI reaches Postgres only through the server using the service_role key,
-- which bypasses RLS. We still enable RLS on every table and grant nothing to
-- anon/authenticated, so the tables cannot be read directly from a browser
-- even if the schema is exposed.
-- ============================================================================
grant usage on schema prepai to service_role;
grant all on all tables in schema prepai to service_role;
grant all on all sequences in schema prepai to service_role;
alter default privileges in schema prepai grant all on tables to service_role;

alter table prepai.profiles          enable row level security;
alter table prepai.questions         enable row level security;
alter table prepai.practice_sessions enable row level security;
alter table prepai.session_answers   enable row level security;
alter table prepai.weakness_reports  enable row level security;
alter table prepai.textbooks         enable row level security;
alter table prepai.bookmarks         enable row level security;
alter table prepai.payments          enable row level security;
alter table prepai.app_settings      enable row level security;
alter table prepai.battle_rooms       enable row level security;
alter table prepai.battle_participants enable row level security;

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
where table_schema = 'prepai'
order by table_name;
