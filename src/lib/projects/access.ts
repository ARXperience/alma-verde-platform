import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

const STAFF_ROLES = ['admin', 'comercial', 'diseno', 'produccion']

// API routes that act on a project: allowed for the project's client and for internal staff.
// Returns `{ error }` with the response to send back, or the service client and project to continue.
export async function projectAccess(projectId: string) {
    const { data: { user } } = await (await createClient()).auth.getUser()
    if (!user) return { error: NextResponse.json({ error: 'Inicia sesión para continuar' }, { status: 401 }) }

    const admin = await createAdminClient()
    const { data: project } = await admin.from('projects').select('id, client_id, metadata').eq('id', projectId).maybeSingle()
    if (!project) return { error: NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 }) }
    if (project.client_id === user.id) return { admin, project, user, staff: false }

    const { data: profile } = await admin.from('users').select('role').eq('id', user.id).maybeSingle()
    if (!STAFF_ROLES.includes(profile?.role)) return { error: NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 }) }
    return { admin, project, user, staff: true }
}
