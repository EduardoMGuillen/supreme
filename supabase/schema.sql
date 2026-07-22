-- Supremo site state for shared persistence on Vercel
create table if not exists supremo_site_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table supremo_site_state enable row level security;
