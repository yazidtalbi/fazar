create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.waitlist enable row level security;

create policy "Enable insert for anonymous users" 
  on public.waitlist for insert 
  with check (true);

create policy "Enable read access for authenticated users only"
  on public.waitlist for select
  using (auth.role() = 'authenticated');
