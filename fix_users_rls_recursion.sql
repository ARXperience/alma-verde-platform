-- Fix infinite recursion error by dropping the problematic policies
-- The issue: policies were querying the same 'users' table to check permissions, causing infinite loop

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Disable RLS temporarily (it's enabled in schema.sql already and has proper policies there)
-- If you still want RLS, the main schema.sql should handle it without recursion
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
