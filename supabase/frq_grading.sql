create table if not exists public.frq_grade_cache (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  frq_key text not null,
  student_answer_hash text not null,
  detail_mode text not null default 'standard',
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists frq_grade_cache_lookup_idx
  on public.frq_grade_cache (user_id, frq_key, student_answer_hash);

create index if not exists frq_grade_cache_recent_idx
  on public.frq_grade_cache (user_id, updated_at desc);

create table if not exists public.frq_grade_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  frq_key text not null,
  student_answer_hash text not null,
  detail_mode text not null default 'standard',
  created_at timestamptz not null default now()
);

create index if not exists frq_grade_events_window_idx
  on public.frq_grade_events (user_id, created_at desc);
