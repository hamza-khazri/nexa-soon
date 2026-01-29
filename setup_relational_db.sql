-- ==============================================================================
-- 1. Create PUBLIC.USERS Table (Common Data)
-- ==============================================================================
create table public.users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text not null, -- 'technician', 'client', 'enterprise'
  full_name text,
  email text,
  phone_whatsapp text,
  phone_alt text,
  city_region text,
  language text,
  wants_updates boolean default false
);

-- Enable RLS for users
alter table public.users enable row level security;
-- Allow anonymous inserts (for public registration form)
create policy "Allow public insert users" on public.users for insert with check (true);
-- Allow public read (optional, or restricted) - keeping it open for dev, or just insert-only
create policy "Allow public read users" on public.users for select using (true);


-- ==============================================================================
-- 2. Create PUBLIC.TECHNICIANS Table
-- ==============================================================================
create table public.technicians (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  main_trade text,
  experience_years text,
  status text,
  company_name text,
  intervention_zones text,
  project_6m text, -- added based on form
  ready_clear_prices boolean default false,
  ready_documented boolean default false,
  ready_reviews boolean default false,
  ready_tracking boolean default false
);

alter table public.technicians enable row level security;
create policy "Allow public insert technicians" on public.technicians for insert with check (true);
create policy "Allow public read technicians" on public.technicians for select using (true);


-- ==============================================================================
-- 3. Create PUBLIC.ENTERPRISES Table
-- ==============================================================================
create table public.enterprises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  company_name text,
  activity_type text,
  company_name_2 text,
  activity_type_2 text,
  sites_count text,
  users_count text,
  main_needs text,
  current_management text
);

alter table public.enterprises enable row level security;
create policy "Allow public insert enterprises" on public.enterprises for insert with check (true);
create policy "Allow public read enterprises" on public.enterprises for select using (true);


-- ==============================================================================
-- 4. Create PUBLIC.CLIENTS Table (To store Client-specific details)
-- ==============================================================================
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  client_type text,      -- 'Homeowner', 'Tenant', etc.
  service_needed text,   -- 'Renovation', 'Repair'
  current_management text,
  project_6m text
);

alter table public.clients enable row level security;
create policy "Allow public insert clients" on public.clients for insert with check (true);
create policy "Allow public read clients" on public.clients for select using (true);
