# Configuración de Supabase - Guía Paso a Paso

## 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Completa:
   - **Name**: `alma-verde-platform`
   - **Database Password**: (guarda esta contraseña de forma segura)
   - **Region**: `South America (São Paulo)` (más cercano a Colombia)
   - **Pricing Plan**: Free (puedes actualizar después)
5. Click en "Create new project"
6. Espera 2-3 minutos mientras se crea el proyecto

## 2. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (ícono de engranaje en la barra lateral)
2. Click en **API**
3. Copia y guarda:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (clave pública)
   - **service_role key**: `eyJhbGc...` (clave privada - ¡NO compartir!)

## 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Google Gemini (lo configuraremos después)
GOOGLE_GEMINI_API_KEY=

# Bold (lo configuraremos después)
BOLD_API_KEY=
BOLD_SECRET_KEY=  

# Facturación (lo configuraremos después)
INVOICING_API_KEY=
```

## 4. Ejecutar el Schema SQL

1. En Supabase, ve a **SQL Editor** (ícono de base de datos en la barra lateral)
2. Click en "New query"
3. Copia y pega el contenido de `supabase/schema.sql`
4. Click en "Run" (o presiona Ctrl+Enter)
5. Verifica que no haya errores

## 5. Ejecutar los Datos de Prueba (Opcional)

1. En el mismo SQL Editor
2. Crea una nueva query
3. Copia y pega el contenido de `supabase/seed.sql`
4. Click en "Run"

## 6. Configurar Storage

1. Ve a **Storage** en la barra lateral
2. Click en "Create a new bucket"
3. Crea los siguientes buckets:
   - **Name**: `project-files`, **Public**: No
   - **Name**: `project-renders`, **Public**: Yes
   - **Name**: `audio-recordings`, **Public**: No
   - **Name**: `portfolio-images`, **Public**: Yes
   - **Name**: `product-images`, **Public**: Yes

## 7. Verificar Configuración

Una vez completado, verifica:
- ✅ Proyecto creado
- ✅ Credenciales copiadas
- ✅ `.env.local` creado
- ✅ Schema ejecutado sin errores
- ✅ Buckets de storage creados

## Próximo Paso

Una vez completado, ejecuta:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Y estaremos listos para implementar la autenticación.
