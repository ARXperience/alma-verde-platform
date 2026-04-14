-- =====================================================
-- ALMA VERDE PLATFORM - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'comercial',
  'diseno',
  'produccion',
  'marketing',
  'financiero',
  'cliente'
);

-- Business units
CREATE TYPE business_unit AS ENUM (
  'alma_verde',
  'alma_home'
);

-- Project status
CREATE TYPE project_status AS ENUM (
  'cotizacion',
  'aprobado',
  'en_diseno',
  'en_produccion',
  'instalado',
  'finalizado',
  'cancelado'
);

-- Project types
CREATE TYPE project_type AS ENUM (
  'stand',
  'evento',
  'branding',
  'decoracion',
  'mobiliario',
  'alquiler',
  'otro'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pendiente',
  'parcial',
  'completado',
  'reembolsado'
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
  'borrador',
  'enviada',
  'pagada',
  'vencida',
  'cancelada'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'cliente',
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  business_unit business_unit DEFAULT 'alma_verde',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  business_unit business_unit NOT NULL DEFAULT 'alma_verde',
  
  -- Project details
  title TEXT NOT NULL,
  description TEXT,
  project_type project_type NOT NULL,
  status project_status NOT NULL DEFAULT 'cotizacion',
  
  -- Quotation data
  briefing TEXT,
  audio_transcription TEXT,
  audio_url TEXT,
  extracted_variables JSONB DEFAULT '{}',
  
  -- Pricing
  estimated_cost DECIMAL(12,2),
  final_cost DECIMAL(12,2),
  pricing_breakdown JSONB DEFAULT '{}',
  
  -- Timeline
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Assignment
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project renders (AI generated images)
CREATE TABLE public.project_renders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  version INTEGER DEFAULT 1,
  is_selected BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project files
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project messages (internal chat)
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project timeline/history
CREATE TABLE public.project_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'anticipo', 'parcial', 'final'
  status payment_status NOT NULL DEFAULT 'pendiente',
  
  -- Bold integration
  bold_transaction_id TEXT,
  bold_payment_link TEXT,
  
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  
  invoice_number TEXT UNIQUE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'borrador',
  
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  
  -- DIAN integration
  dian_cufe TEXT,
  dian_xml_url TEXT,
  dian_pdf_url TEXT,
  
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items (published projects)
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  business_unit business_unit NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  client_name TEXT,
  
  featured_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  
  metrics JSONB DEFAULT '{}', -- square_meters, budget_range, etc.
  tags TEXT[] DEFAULT '{}',
  
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (for ecommerce)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_unit business_unit NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  
  images JSONB DEFAULT '[]',
  
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_business_unit ON public.users(business_unit);
CREATE INDEX idx_users_email ON public.users(email);

CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_business_unit ON public.projects(business_unit);
CREATE INDEX idx_projects_assigned_to ON public.projects(assigned_to);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

CREATE INDEX idx_project_renders_project ON public.project_renders(project_id);
CREATE INDEX idx_project_files_project ON public.project_files(project_id);
CREATE INDEX idx_project_messages_project ON public.project_messages(project_id);
CREATE INDEX idx_project_timeline_project ON public.project_timeline(project_id);

CREATE INDEX idx_payments_project ON public.payments(project_id);
CREATE INDEX idx_payments_client ON public.payments(client_id);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE INDEX idx_invoices_project ON public.invoices(project_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

CREATE INDEX idx_portfolio_business_unit ON public.portfolio_items(business_unit);
CREATE INDEX idx_portfolio_featured ON public.portfolio_items(is_featured);

CREATE INDEX idx_products_business_unit ON public.products(business_unit);
CREATE INDEX idx_products_available ON public.products(is_available);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate project number
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.project_number = 'AV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('project_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS project_number_seq;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate project number
CREATE TRIGGER generate_project_number_trigger BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION generate_project_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies
CREATE POLICY "Clients can view their own projects" ON public.projects
  FOR SELECT USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'comercial', 'diseno', 'produccion', 'marketing', 'financiero')
    )
  );

CREATE POLICY "Internal users can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'comercial')
    )
  );

CREATE POLICY "Internal users can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'comercial', 'diseno', 'produccion')
    )
  );

-- Portfolio items (public read)
CREATE POLICY "Anyone can view published portfolio" ON public.portfolio_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage portfolio" ON public.portfolio_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'marketing')
    )
  );

-- Products (public read)
CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'comercial')
    )
  );

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- This will be in seed.sql
