create table plan_reflections (
  id uuid primary key default gen_random_uuid(),
  odyssey_plan_id uuid references odyssey_plans(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now() not null
);
alter table plan_reflections enable row level security;
create policy "users own reflections" on plan_reflections
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
