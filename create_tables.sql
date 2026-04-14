
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Project Messages
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal BOOLEAN DEFAULT false,
    is_ai BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for project_messages
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their projects" 
ON public.project_messages FOR SELECT 
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE client_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'diseno', 'produccion')
    )
);

CREATE POLICY "Users can insert messages for their projects" 
ON public.project_messages FOR INSERT 
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects WHERE client_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'diseno', 'produccion')
    )
);

-- ==========================================
-- 2. Quotations
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id),
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    items JSONB DEFAULT '[]'::jsonb, -- Array of items included
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own quotations" 
ON public.quotations FOR SELECT 
USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'financiero')
    )
);

-- ==========================================
-- 3. Orders (Pedidos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    client_id UUID REFERENCES auth.users(id),
    quotation_id UUID REFERENCES public.quotations(id),
    total_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_status TEXT DEFAULT 'unpaid',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own orders" 
ON public.orders FOR SELECT 
USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'produccion', 'financiero')
    )
);

-- ==========================================
-- 4. Products (For Ecommerce)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    images JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    category TEXT,
    business_unit TEXT DEFAULT 'alma_home',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" 
ON public.products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
-- Admin write access
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'comercial', 'marketing')
    )
);

-- ==========================================
-- 5. Portfolio Items
-- ==========================================
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id),
    featured_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    business_unit TEXT DEFAULT 'alma_verde',
    published_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}'::jsonb, -- e.g. { views: 0, likes: 0 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for portfolio" ON public.portfolio_items;
CREATE POLICY "Public read access for portfolio" 
ON public.portfolio_items FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can manage portfolio" ON public.portfolio_items;
CREATE POLICY "Admins can manage portfolio" 
ON public.portfolio_items FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'marketing', 'diseno')
    )
);
