-- ============================================================================
-- PrepAI — full database schema for Supabase (Postgres)
-- Run this in Supabase Studio → SQL Editor, or `supabase db push`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
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

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists target_exam text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists subscription_status text not null default 'inactive';
alter table public.profiles add column if not exists subscription_expires_at timestamptz;
alter table public.profiles add column if not exists exam_date date;

-- --------------------------------------------------------------- questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null check (exam in ('JAMB', 'WAEC', 'NECO', 'AI GENERATED')),
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

alter table public.questions add column if not exists is_active boolean not null default true;
alter table public.questions add column if not exists explanation text;
alter table public.questions add column if not exists difficulty text not null default 'medium';
alter table public.questions add column if not exists year int;
alter table public.questions add column if not exists image_url text;

create index if not exists idx_questions_exam_subject on public.questions (exam, subject);
create index if not exists idx_questions_topic on public.questions (topic);
create index if not exists idx_questions_active on public.questions (is_active);

-- -------------------------------------------------------- practice_sessions
create table if not exists public.practice_sessions (
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

create index if not exists idx_sessions_user on public.practice_sessions (user_id, started_at desc);

-- ---------------------------------------------------------- session_answers
create table if not exists public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  selected_option text,
  is_correct boolean,
  flagged boolean not null default false,
  time_taken_ms int not null default 0,
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists idx_answers_session on public.session_answers (session_id);

-- ---------------------------------------------------------- weakness_reports
create table if not exists public.weakness_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  session_id uuid references public.practice_sessions on delete cascade,
  exam text not null,
  subject text not null,
  topic text not null,
  weakness_score int not null check (weakness_score between 0 and 100),
  total_attempted int not null default 0,
  correct_count int not null default 0,
  wrong_count int not null default 0,
  severity text not null default 'weak' check (severity in ('critical','weak','fair','strong')),
  recommendation text,
  textbook_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_weakness_user on public.weakness_reports (user_id, created_at desc);
create index if not exists idx_weakness_session on public.weakness_reports (session_id);

-- --------------------------------------------------------------- textbooks
create table if not exists public.textbooks (
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

create index if not exists idx_textbooks_tags on public.textbooks using gin (topic_tags);
create index if not exists idx_textbooks_exam_subject on public.textbooks (exam, subject);

alter table public.weakness_reports
  drop constraint if exists weakness_reports_textbook_id_fkey;
alter table public.weakness_reports
  add constraint weakness_reports_textbook_id_fkey
  foreign key (textbook_id) references public.textbooks on delete set null;

-- --------------------------------------------------------------- bookmarks
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  textbook_id uuid not null references public.textbooks on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, textbook_id)
);

-- ---------------------------------------------------------------- payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  email text not null,
  amount int not null,                    -- kobo (100000 = ₦1,000)
  paystack_ref text not null unique,
  paystack_transaction_id text,
  channel text,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user on public.payments (user_id, created_at desc);

-- ------------------------------------------------------------ app_settings
create table if not exists public.app_settings (
  id text primary key default 'singleton',
  site_name text not null default 'PrepAI',
  price_kobo int not null default 100000,
  currency text not null default 'NGN',
  free_questions_per_day int not null default 10,
  paywall_enabled boolean not null default true,
  weakness_threshold int not null default 50
);

insert into public.app_settings (id) values ('singleton') on conflict (id) do nothing;

-- ----------------------------------------------------------- battle_rooms
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

create index if not exists idx_battle_rooms_code on public.battle_rooms (code);
create index if not exists idx_battle_rooms_status on public.battle_rooms (status);

-- ----------------------------------------------------- battle_participants
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

create index if not exists idx_battle_participants_room on public.battle_participants (room_id);

-- ============================================================================
-- Auto-create a profile whenever a user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the caller an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- helper: does the caller have an active subscription?
create or replace function public.is_subscriber()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin'
        or (p.subscription_status = 'active' and p.subscription_expires_at > now()))
  );
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.questions         enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.session_answers   enable row level security;
alter table public.weakness_reports  enable row level security;
alter table public.textbooks         enable row level security;
alter table public.bookmarks         enable row level security;
alter table public.payments          enable row level security;
alter table public.app_settings      enable row level security;
alter table public.battle_rooms       enable row level security;
alter table public.battle_participants enable row level security;

drop policy if exists "battle_rooms_read_all" on public.battle_rooms;
create policy "battle_rooms_read_all" on public.battle_rooms for select using (true);

drop policy if exists "battle_participants_read_all" on public.battle_participants;
create policy "battle_participants_read_all" on public.battle_participants for select using (true);

-- profiles ------------------------------------------------------------------
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- questions -----------------------------------------------------------------
drop policy if exists "questions readable" on public.questions;
create policy "questions readable" on public.questions
  for select to authenticated using (is_active or public.is_admin());

drop policy if exists "admins write questions" on public.questions;
create policy "admins write questions" on public.questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- practice sessions ---------------------------------------------------------
drop policy if exists "own sessions" on public.practice_sessions;
create policy "own sessions" on public.practice_sessions
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

-- session answers -----------------------------------------------------------
drop policy if exists "own answers" on public.session_answers;
create policy "own answers" on public.session_answers
  for all using (
    exists (select 1 from public.practice_sessions s
            where s.id = session_id and (s.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.practice_sessions s
            where s.id = session_id and s.user_id = auth.uid())
  );

-- weakness reports ----------------------------------------------------------
drop policy if exists "own reports" on public.weakness_reports;
create policy "own reports" on public.weakness_reports
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "insert own reports" on public.weakness_reports;
create policy "insert own reports" on public.weakness_reports
  for insert with check (auth.uid() = user_id);

-- textbooks -----------------------------------------------------------------
drop policy if exists "subscribers read textbooks" on public.textbooks;
create policy "subscribers read textbooks" on public.textbooks
  for select to authenticated using (is_published and public.is_subscriber());

drop policy if exists "admins write textbooks" on public.textbooks;
create policy "admins write textbooks" on public.textbooks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- bookmarks -----------------------------------------------------------------
drop policy if exists "own bookmarks" on public.bookmarks;
create policy "own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- payments ------------------------------------------------------------------
drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments
  for select using (auth.uid() = user_id or public.is_admin());

-- app settings --------------------------------------------------------------
drop policy if exists "settings readable" on public.app_settings;
create policy "settings readable" on public.app_settings for select using (true);

drop policy if exists "admins update settings" on public.app_settings;
create policy "admins update settings" on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Storage bucket for textbook files
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('textbooks', 'textbooks', true)
on conflict (id) do nothing;

drop policy if exists "public read textbooks bucket" on storage.objects;
create policy "public read textbooks bucket" on storage.objects
  for select using (bucket_id = 'textbooks');

drop policy if exists "admins upload textbooks" on storage.objects;
create policy "admins upload textbooks" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'textbooks' and public.is_admin());
