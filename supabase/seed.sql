-- =====================================================
-- ALMA VERDE PLATFORM - SEED DATA
-- =====================================================
-- This file contains sample data for development and testing

-- Note: You'll need to create actual users through Supabase Auth first
-- Then you can insert their user_id here

-- Sample admin user (replace with actual UUID after creating in Supabase Auth)
-- INSERT INTO public.users (id, email, full_name, role, phone, company, business_unit)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'admin@almaverde.co', 'Admin User', 'admin', '+573001234567', 'Alma Verde', 'alma_verde');

-- Sample projects (for testing)
INSERT INTO public.projects (
  title,
  description,
  project_type,
  status,
  business_unit,
  estimated_cost,
  briefing
) VALUES
  (
    'Stand Feria Internacional Tech 2026',
    'Stand modular de 50m² para feria tecnológica con zona de demos interactivas',
    'stand',
    'cotizacion',
    'alma_verde',
    25000000,
    'Necesitamos un stand moderno para la feria de tecnología. Debe tener espacio para demos, reuniones y almacenamiento.'
  ),
  (
    'Evento Corporativo Anual',
    'Evento de fin de año para 500 personas con ambientación navideña',
    'evento',
    'aprobado',
    'alma_verde',
    45000000,
    'Evento corporativo de fin de año con decoración navideña, escenario para presentaciones y zona de cóctel.'
  ),
  (
    'Decoración Apartamento Moderno',
    'Proyecto de decoración integral para apartamento de 120m²',
    'decoracion',
    'en_diseno',
    'alma_home',
    18000000,
    'Apartamento moderno que necesita decoración completa: sala, comedor, habitaciones. Estilo minimalista contemporáneo.'
  );

-- Sample portfolio items
INSERT INTO public.portfolio_items (
  title,
  description,
  category,
  client_name,
  business_unit,
  featured_image_url,
  metrics,
  tags,
  is_featured
) VALUES
  (
    'Stand Expo Construcción 2025',
    'Stand de 80m² con zona de reuniones privadas y exhibición de productos',
    'Stands',
    'BuildCo SAS',
    'alma_verde',
    '/portfolio/stand-buildco.jpg',
    '{"square_meters": 80, "budget_range": "30M - 40M", "duration_days": 15}',
    ARRAY['stand', 'construccion', 'feria'],
    true
  ),
  (
    'Lanzamiento Producto Fashion Brand',
    'Evento de lanzamiento con escenografía premium y ambientación de marca',
    'Eventos',
    'Fashion Brand Colombia',
    'alma_verde',
    '/portfolio/evento-fashion.jpg',
    '{"attendees": 300, "budget_range": "40M - 50M", "duration_days": 1}',
    ARRAY['evento', 'lanzamiento', 'moda'],
    true
  ),
  (
    'Decoración Residencial Chicó',
    'Proyecto integral de decoración para apartamento de lujo',
    'Decoración',
    'Cliente Privado',
    'alma_home',
    '/portfolio/deco-chico.jpg',
    '{"square_meters": 150, "budget_range": "20M - 25M", "duration_days": 20}',
    ARRAY['decoracion', 'residencial', 'lujo'],
    false
  );

-- Sample products (for ecommerce)
INSERT INTO public.products (
  name,
  description,
  category,
  price,
  compare_at_price,
  stock_quantity,
  business_unit,
  images
) VALUES
  (
    'Mesa de Centro Moderna',
    'Mesa de centro en madera y metal, diseño minimalista contemporáneo',
    'Mobiliario',
    1200000,
    1500000,
    5,
    'alma_home',
    '["https://placehold.co/600x400/png"]'
  ),
  (
    'Lámpara de Piso Industrial',
    'Lámpara de piso estilo industrial con acabado en negro mate',
    'Iluminación',
    450000,
    550000,
    10,
    'alma_home',
    '["https://placehold.co/600x400/png"]'
  ),
  (
    'Stand Modular 3x3',
    'Stand modular básico de 9m² para ferias y eventos',
    'Alquiler',
    3500000,
    NULL,
    3,
    'alma_verde',
    '["https://placehold.co/600x400/png"]'
  );

-- Sample notifications (will be created dynamically in the app)
-- INSERT INTO public.notifications (user_id, title, message, type, link)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Nuevo Proyecto', 'Se ha creado un nuevo proyecto: Stand Feria Tech 2026', 'project', '/admin/projects/1');
