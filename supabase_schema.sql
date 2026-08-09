-- Supabase Schema for BoardPrep AI

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  board_name text,
  target_percentage numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can select own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- 2. SUBJECTS TABLE (Shared catalog)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_order integer default 0
);

alter table public.subjects enable row level security;

create policy "Authenticated users can select subjects"
  on public.subjects for select
  using (auth.role() = 'authenticated');

create policy "Anyone can insert subjects"
  on public.subjects for insert
  with check (true);

-- 3. CHAPTERS TABLE (Shared catalog)
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  chapter_name text not null,
  chapter_number integer,
  created_at timestamptz default now()
);

alter table public.chapters enable row level security;

create policy "Authenticated users can select chapters"
  on public.chapters for select
  using (auth.role() = 'authenticated');

create policy "Anyone can insert chapters"
  on public.chapters for insert
  with check (true);

-- 4. USER CHAPTER PROGRESS TABLE
create table if not exists public.user_chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  status text not null default 'Not Started',
  last_revised_at timestamptz,
  updated_at timestamptz default now(),
  constraint user_chapter_progress_user_id_chapter_id_key unique (user_id, chapter_id)
);

alter table public.user_chapter_progress enable row level security;

create policy "Users can select own chapter progress"
  on public.user_chapter_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own chapter progress"
  on public.user_chapter_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chapter progress"
  on public.user_chapter_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own chapter progress"
  on public.user_chapter_progress for delete
  using (auth.uid() = user_id);

-- 5. NOTES TABLE
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  content text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;

create policy "Users can select own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- 6. PYQS TABLE
create table if not exists public.pyqs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  question text not null,
  marks integer,
  tags text[],
  created_at timestamptz default now()
);

alter table public.pyqs enable row level security;

create policy "Users can select own pyqs"
  on public.pyqs for select
  using (auth.uid() = user_id);

create policy "Users can insert own pyqs"
  on public.pyqs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pyqs"
  on public.pyqs for update
  using (auth.uid() = user_id);

create policy "Users can delete own pyqs"
  on public.pyqs for delete
  using (auth.uid() = user_id);

-- 7. DOUBTS TABLE
create table if not exists public.doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  question text not null,
  priority text default 'Medium',
  status text default 'Unresolved',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.doubts enable row level security;

create policy "Users can select own doubts"
  on public.doubts for select
  using (auth.uid() = user_id);

create policy "Users can insert own doubts"
  on public.doubts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own doubts"
  on public.doubts for update
  using (auth.uid() = user_id);

create policy "Users can delete own doubts"
  on public.doubts for delete
  using (auth.uid() = user_id);

-- 8. DAILY TASKS TABLE
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_description text not null,
  target_date date default current_date,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table public.daily_tasks enable row level security;

create policy "Users can select own daily tasks"
  on public.daily_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily tasks"
  on public.daily_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily tasks"
  on public.daily_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily tasks"
  on public.daily_tasks for delete
  using (auth.uid() = user_id);

-- 9. STUDY SESSIONS TABLE
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null default 0,
  session_date date default current_date,
  created_at timestamptz default now()
);

alter table public.study_sessions enable row level security;

create policy "Users can select own study sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own study sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own study sessions"
  on public.study_sessions for delete
  using (auth.uid() = user_id);
