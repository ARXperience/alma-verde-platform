-- Create project_files table if it doesn't exist (it should, but safe fallback)
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- 1. Policy for Clients to VIEW their own project files
DROP POLICY IF EXISTS "Clients can view their project files" ON public.project_files;
CREATE POLICY "Clients can view their project files"
ON public.project_files FOR SELECT
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE client_id = auth.uid()
    )
);

-- 2. Policy for Clients to INSERT files (if client-side insert is used)
DROP POLICY IF EXISTS "Clients can upload project files" ON public.project_files;
CREATE POLICY "Clients can upload project files"
ON public.project_files FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects WHERE client_id = auth.uid()
    )
);

-- 3. Policy for Clients to DELETE files
DROP POLICY IF EXISTS "Clients can delete their project files" ON public.project_files;
CREATE POLICY "Clients can delete their project files"
ON public.project_files FOR DELETE
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE client_id = auth.uid()
    )
);

-- 4. Policy for Admins (View/Manage ALL)
DROP POLICY IF EXISTS "Admins can manage all project files" ON public.project_files;
CREATE POLICY "Admins can manage all project files"
ON public.project_files FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'diseno', 'produccion')
    )
);
