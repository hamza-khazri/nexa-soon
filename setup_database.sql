-- Create the table for storing registrations
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  role text not null,
  full_name text,
  email text,
  phone_whatsapp text,
  phone_alt text,
  city_region text,
  language text,
  wants_updates boolean default false,
  details jsonb default '{}'::jsonb
);

-- Enable Row Level Security (RLS) is recommended
alter table public.registrations enable row level security;

-- Create a policy to allow anyone (anon) to insert data
-- This is necessary for a public registration form
create policy "Enable insert for everyone" 
on public.registrations for insert 
to anon 
with check (true);

-- Optional: Create a policy to allow service role to view all data
-- (The dashboard uses service role by default, so this is just for clarity)
create policy "Enable select for service role" 
on public.registrations for select 
to service_role 
using (true);
