-- Common table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  role text not null check (role in ('technician','client','enterprise')),
  full_name text not null,
  email text not null,
  phone_whatsapp text not null,
  phone_alt text not null,
  city_region text not null,
  language text not null,
  wants_updates boolean not null default false
);

-- Technician table (role specific)
create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,

  main_trade text not null,
  experience_years text not null,
  status text not null,
  company_name text,
  project_6m text,

  ready_clear_prices boolean not null default false,
  ready_documented boolean not null default false,
  ready_reviews boolean not null default false,
  ready_tracking boolean not null default false
);

-- Enterprise table (role specific)
create table if not exists public.enterprises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,

  company_name text not null,
  activity_type text not null,
  sites_count text not null,
  users_count text not null,
  main_needs text not null,
  current_management text not null
);

-- Client table (role specific) - optional but recommended
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,

  client_type text not null,
  service_needed text not null,
  current_management text not null,
  project_6m text
);

create index if not exists users_created_at_idx on public.users(created_at desc);
create index if not exists tech_user_id_idx on public.technicians(user_id);
create index if not exists ent_user_id_idx on public.enterprises(user_id);
create index if not exists client_user_id_idx on public.clients(user_id);
