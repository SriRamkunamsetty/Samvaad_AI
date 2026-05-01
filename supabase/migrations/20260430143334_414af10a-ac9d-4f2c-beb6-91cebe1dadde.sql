
-- Outreach runs: every generated message + reasoning + linked analyses
create table public.outreach_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prospect_label text,
  channel text,
  tone text,
  intel jsonb,
  outreach jsonb,
  analysis jsonb,
  followup jsonb,
  -- denormalized metrics for fast dashboard queries
  sentiment text,
  intent_score int,
  deal_temperature int,
  interest_level text,
  has_response boolean not null default false,
  has_followup boolean not null default false
);

create index outreach_runs_created_at_idx on public.outreach_runs(created_at desc);

-- Public share links
create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payload jsonb not null
);

alter table public.outreach_runs enable row level security;
alter table public.share_links enable row level security;

-- Demo-mode policies: app currently has no auth; anyone can read/write.
-- Replace with auth-scoped policies when auth is added.
create policy "demo read outreach" on public.outreach_runs for select using (true);
create policy "demo insert outreach" on public.outreach_runs for insert with check (true);
create policy "demo update outreach" on public.outreach_runs for update using (true);

create policy "demo read shares" on public.share_links for select using (true);
create policy "demo insert shares" on public.share_links for insert with check (true);
