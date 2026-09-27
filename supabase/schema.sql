-- Habit Tracker database schema
-- Run this once in Supabase → SQL Editor → New query → Run.

-- ============ TABLES ============

-- A habit the user wants to track (e.g. "Drink water", "Read 20 min")
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  description text,
  color       text not null default '#4f46e5',
  created_at  timestamptz not null default now()
);

-- One row per day a habit was completed
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date       date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, date) -- can only check off a habit once per day
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs (user_id);

-- ============ ROW LEVEL SECURITY ============
-- Each user can only see and change their own rows.

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Users can view their own habits"
  on public.habits for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own habits"
  on public.habits for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on public.habits for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete to authenticated
  using (auth.uid() = user_id);

create policy "Users can view their own logs"
  on public.habit_logs for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own logs"
  on public.habit_logs for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())
  );

create policy "Users can delete their own logs"
  on public.habit_logs for delete to authenticated
  using (auth.uid() = user_id);
