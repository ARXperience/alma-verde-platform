import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

// Every role except 'cliente' works in the admin (same list as app/admin/layout.tsx)
const STAFF_ROLES = ['admin', 'comercial', 'diseno', 'produccion', 'marketing', 'financiero']

const deny = (status: number, error: string) => ({ error: NextResponse.json({ error }, { status }) })

async function sessionUser() {
    const { data: { user } } = await (await createClient()).auth.getUser()
    return user
}

async function isStaff(admin: Awaited<ReturnType<typeof createAdminClient>>, userId: string) {
    const { data: profile } = await admin.from('users').select('role').eq('id', userId).maybeSingle()
    return STAFF_ROLES.includes(profile?.role)
}

// API routes used only by admin screens (portfolio, uploads…)
// Returns `{ error }` with the response to send back, or the service client and the user.
export async function requireStaff() {
    const user = await sessionUser()
    if (!user) return deny(401, 'Inicia sesión para continuar')
    const admin = await createAdminClient()
    if (!(await isStaff(admin, user.id))) return deny(403, 'Solo el equipo de Alma Verde puede hacer esto')
    return { admin, user }
}

// API routes that act on a project: allowed for the project's client and for internal staff.
export async function projectAccess(projectId: string) {
    const user = await sessionUser()
    if (!user) return deny(401, 'Inicia sesión para continuar')

    const admin = await createAdminClient()
    const { data: project } = await admin.from('projects').select('id, client_id, metadata').eq('id', projectId).maybeSingle()
    if (!project) return deny(404, 'Proyecto no encontrado')
    if (project.client_id === user.id) return { admin, project, user, staff: false }

    if (!(await isStaff(admin, user.id))) return deny(403, 'No tienes acceso a este proyecto')
    return { admin, project, user, staff: true }
}
