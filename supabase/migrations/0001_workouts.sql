-- Saved workouts, one row per workout, owned by a Supabase auth user.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  rounds integer not null check (rounds between 1 and 99),
  -- [{ id, label, seconds, phase: 'warmup'|'round'|'cooldown', kind: 'work'|'rest' }]
  steps jsonb not null check (
    case when jsonb_typeof(steps) = 'array'
      then jsonb_array_length(steps) between 1 and 50
      else false
    end
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_user_id_updated_at_idx
  on public.workouts (user_id, updated_at desc);

-- Row Level Security: each user only sees and changes their own rows.
alter table public.workouts enable row level security;

create policy "workouts_select_own" on public.workouts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "workouts_insert_own" on public.workouts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workouts_update_own" on public.workouts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workouts_delete_own" on public.workouts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();
