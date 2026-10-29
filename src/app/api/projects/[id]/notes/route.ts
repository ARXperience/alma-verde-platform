import { NextResponse } from 'next/server'
import { projectAccess } from '@/lib/projects/access'

// Internal team notes on a project (project_messages with is_internal = true). Staff only.
const FIELDS = 'id, message, created_at, author:users(full_name, email)'

async function staffAccess(id: string) {
    const access = await projectAccess(id)
    if (!('error' in access) && !access.staff) {
        return { error: NextResponse.json({ error: 'Solo el equipo puede ver las notas internas' }, { status: 403 }) }
    }
    return access
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const access = await staffAccess(id)
    if ('error' in access) return access.error

    const { data, error } = await access.admin.from('project_messages').select(FIELDS)
        .eq('project_id', id).eq('is_internal', true).order('created_at')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ notes: data })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const access = await staffAccess(id)
    if ('error' in access) return access.error

    const { message } = await request.json()
    if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
        return NextResponse.json({ error: 'La nota debe tener entre 1 y 4000 caracteres' }, { status: 400 })
    }
    const { data, error } = await access.admin.from('project_messages')
        .insert({ project_id: id, user_id: access.user.id, message: message.trim(), is_internal: true })
        .select(FIELDS).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ note: data })
}
