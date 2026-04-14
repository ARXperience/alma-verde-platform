  -- =====================================================
  -- TEMPORARY FIX: Disable RLS for development
  -- =====================================================
  -- WARNING: This is for development only!
  -- Re-enable RLS before going to production

  -- Disable RLS temporarily
  ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

  -- If you want to re-enable it later with proper policies:
  /*
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  -- Then add these policies:
  CREATE POLICY "Allow all operations for authenticated users" ON public.users
    FOR ALL USING (auth.uid() IS NOT NULL);
  */
