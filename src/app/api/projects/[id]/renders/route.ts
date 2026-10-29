import { NextResponse } from 'next/server'
import { projectAccess } from '@/lib/projects/access'

// Chooses the main render of a project (shown as cover in the dashboard and the proposal).
// Goes through the server because clients can't update project_renders under RLS.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { imageUrl } = await request.json()

    const access = await projectAccess(id)
    if ('error' in access) return access.error
    const { admin, project } = access
    const metadata = project.metadata || {}

    // Only images that already belong to this project
    const { data: renders } = await admin.from('project_renders').select('image_url').eq('project_id', id)
    const known = [
        ...(renders || []).map((r: { image_url: string }) => r.image_url),
        ...(Array.isArray(metadata.render_images) ? metadata.render_images : []).map((r: { url: string }) => r.url),
    ]
    if (typeof imageUrl !== 'string' || !known.includes(imageUrl)) {
        return NextResponse.json({ error: 'La imagen no pertenece a este proyecto' }, { status: 400 })
    }

    await admin.from('project_renders').update({ is_selected: false }).eq('project_id', id)
    await admin.from('project_renders').update({ is_selected: true }).eq('project_id', id).eq('image_url', imageUrl)
    const { error } = await admin.from('projects').update({ metadata: { ...metadata, render_image: imageUrl } }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
}
