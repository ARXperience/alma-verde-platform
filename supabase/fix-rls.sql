-- =====================================================
-- FIX: Complete RLS policies for user registration
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can insert their own profile during registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile (including after registration)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
