-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Odyssey Plans (top-level container per user)
create table odyssey_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My Odyssey Plan',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Life Plans (3 per odyssey plan: expected, alternative, wildcard)
create table life_plans (
  id uuid primary key default uuid_generate_v4(),
  odyssey_plan_id uuid references odyssey_plans(id) on delete cascade not null,
  type text not null check (type in ('expected', 'alternative', 'wildcard')),
  title text not null default '',
  questions text[] not null default '{}',
  -- Dashboard gauges (0-100)
  gauge_resources integer not null default 50 check (gauge_resources between 0 and 100),
  gauge_likeability integer not null default 50 check (gauge_likeability between 0 and 100),
  gauge_confidence integer not null default 50 check (gauge_confidence between 0 and 100),
  gauge_coherence integer not null default 50 check (gauge_coherence between 0 and 100),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(odyssey_plan_id, type)
);

-- Milestones (tied to a life plan, placed in year 1-5)
create table milestones (
  id uuid primary key default uuid_generate_v4(),
  life_plan_id uuid references life_plans(id) on delete cascade not null,
  year integer not null check (year between 1 and 5),
  title text not null,
  description text not null default '',
  category text not null default 'other' check (
    category in ('career', 'personal', 'education', 'travel', 'relationship', 'health', 'finance', 'other')
  ),
  position integer not null default 0,
  created_at timestamptz default now() not null
);

-- Prototypes (experiments / interviews to test a life path)
create table prototypes (
  id uuid primary key default uuid_generate_v4(),
  life_plan_id uuid references life_plans(id) on delete cascade not null,
  type text not null check (type in ('experiment', 'interview', 'course', 'side_project')),
  title text not null,
  description text not null default '',
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'abandoned')),
  scheduled_date date,
  notes text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- AI chat messages per life plan
create table ai_messages (
  id uuid primary key default uuid_generate_v4(),
  life_plan_id uuid references life_plans(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table odyssey_plans enable row level security;
alter table life_plans enable row level security;
alter table milestones enable row level security;
alter table prototypes enable row level security;
alter table ai_messages enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users own their odyssey plans"
  on odyssey_plans for all
  using (auth.uid() = user_id);

create policy "Users own their life plans"
  on life_plans for all
  using (
    odyssey_plan_id in (
      select id from odyssey_plans where user_id = auth.uid()
    )
  );

create policy "Users own their milestones"
  on milestones for all
  using (
    life_plan_id in (
      select lp.id from life_plans lp
      join odyssey_plans op on op.id = lp.odyssey_plan_id
      where op.user_id = auth.uid()
    )
  );

create policy "Users own their prototypes"
  on prototypes for all
  using (
    life_plan_id in (
      select lp.id from life_plans lp
      join odyssey_plans op on op.id = lp.odyssey_plan_id
      where op.user_id = auth.uid()
    )
  );

create policy "Users own their ai messages"
  on ai_messages for all
  using (
    life_plan_id in (
      select lp.id from life_plans lp
      join odyssey_plans op on op.id = lp.odyssey_plan_id
      where op.user_id = auth.uid()
    )
  );

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger odyssey_plans_updated_at before update on odyssey_plans
  for each row execute function update_updated_at();

create trigger life_plans_updated_at before update on life_plans
  for each row execute function update_updated_at();

create trigger prototypes_updated_at before update on prototypes
  for each row execute function update_updated_at();
