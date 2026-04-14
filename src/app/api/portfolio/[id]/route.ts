import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// GET — Get a single portfolio item by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*, project:projects(id, title, project_type, metadata)')
            .eq('id', id)
            .maybeSingle()

        if (error) throw error
        if (!data) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Portfolio GET by ID error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT — Update a portfolio item
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = getSupabaseAdmin()

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        // Only include fields that were provided
        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.featured_image_url !== undefined) updateData.featured_image_url = body.featured_image_url
        if (body.gallery_images !== undefined) updateData.gallery_images = body.gallery_images
        if (body.tags !== undefined) updateData.tags = body.tags
        if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
        if (body.display_order !== undefined) updateData.display_order = body.display_order
        if (body.published_at !== undefined) updateData.published_at = body.published_at

        const { data, error } = await supabase
            .from('portfolio_items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Portfolio PUT error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE — Delete a portfolio item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = getSupabaseAdmin()

        const { error } = await supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Portfolio DELETE error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
