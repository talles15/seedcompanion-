-- SeedCompanion initial schema
-- Run with: supabase db push (or apply via SQL editor)

create extension if not exists "pgcrypto";

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  uploaded_at timestamptz not null default now(),
  row_count integer not null default 0
);

create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  numerolote text not null unique,
  cultivar text,
  classe text,
  peneira text,
  unidade text,
  empresa text,
  represents_original text,
  represents_sc40 text,
  pesobag numeric,
  pesolote numeric,
  mer numeric,
  tsim text,
  statuslt text,
  tsi text,
  ccheck text,
  germ_ofic numeric,
  bas numeric,
  databas date,
  upload_id uuid references public.uploads(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists lots_cultivar_idx on public.lots (cultivar);
create index if not exists lots_empresa_idx on public.lots (empresa);

create table if not exists public.tz_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 4),
  protocolo text,
  vigor numeric,
  viabilidade numeric,
  dm_c1_8 numeric,
  umid_c1_8 numeric,
  perc_c1_8 numeric,
  c1_c2 numeric,
  c1_c2_c3 numeric,
  c3r numeric,
  soma_1a3r numeric,
  sem_duras numeric,
  esverdeadas numeric,
  helicoverpa numeric,
  mort_mecanico numeric,
  mort_umidade numeric,
  percevejo numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.ea72_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 2),
  protocolo text,
  normais numeric,
  fortes numeric,
  fracas numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.ea24_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null default 1 check (round = 1),
  protocolo text,
  normais numeric,
  fortes numeric,
  fracas numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.ea48_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 3),
  protocolo text,
  normais numeric,
  fortes numeric,
  fracas numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.areia_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 8),
  protocolo text,
  l1 numeric,
  l2 numeric,
  resultado numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.pms (
  lot_id uuid primary key references public.lots(id) on delete cascade,
  protocolo text,
  pms numeric
);

create table if not exists public.umidade (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 4),
  valor numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.dm (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 4),
  valor numeric,
  data date,
  unique (lot_id, round)
);

create table if not exists public.gp_rounds (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  round smallint not null check (round between 1 and 3),
  protocolo text,
  normais numeric,
  data date,
  pc_pureza numeric,
  unique (lot_id, round)
);

create table if not exists public.test_thresholds (
  test_type text primary key check (test_type in ('VIGOR','EA72','EA48','EA24','AREIA','GERM')),
  min_value numeric
);

insert into public.test_thresholds (test_type, min_value)
values ('VIGOR', null), ('EA72', null), ('EA48', null), ('EA24', null), ('AREIA', null), ('GERM', null)
on conflict (test_type) do nothing;

-- Enable RLS on every table
alter table public.uploads enable row level security;
alter table public.lots enable row level security;
alter table public.tz_rounds enable row level security;
alter table public.ea72_rounds enable row level security;
alter table public.ea24_rounds enable row level security;
alter table public.ea48_rounds enable row level security;
alter table public.areia_rounds enable row level security;
alter table public.pms enable row level security;
alter table public.umidade enable row level security;
alter table public.dm enable row level security;
alter table public.gp_rounds enable row level security;
alter table public.test_thresholds enable row level security;

-- Public read access
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'uploads','lots','tz_rounds','ea72_rounds','ea24_rounds','ea48_rounds',
    'areia_rounds','pms','umidade','dm','gp_rounds','test_thresholds'
  ])
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s;', t);
    execute format('create policy "public read %1$s" on public.%1$s for select using (true);', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$s;', t);
    execute format('create policy "auth write %1$s" on public.%1$s for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);', t);
  end loop;
end $$;
