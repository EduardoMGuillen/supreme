-- SoySupremo site_state for shared persistence on Vercel
create table if not exists site_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_state enable row level security;
