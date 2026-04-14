-- Create a table for public profiles using the auth.users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- NOTE: Commented out to avoid infinite recursion. 
-- The main schema.sql already has proper RLS policies for users.
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public profiles are viewable by everyone." ON public.users
--   FOR SELECT USING (true);

-- CREATE POLICY "Users can insert their own profile." ON public.users
--   FOR INSERT WITH CHECK (auth.uid() = id);

-- CREATE POLICY "Users can update own profile." ON public.users
--   FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'cliente'::user_role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create a user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users from auth.users (Safe to run multiple times due to ON CONFLICT DO NOTHING)
-- WARNING: This requires privileges to read auth.users which standard users don't have.
-- Run this in the SQL Editor as a Service Role or verify permissions.
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE(raw_user_meta_data->>'role', 'cliente')::user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;
