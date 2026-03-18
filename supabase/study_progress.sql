create table if not exists public.study_progress (
  user_id text primary key,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists study_progress_updated_at_idx
  on public.study_progress (updated_at desc);
