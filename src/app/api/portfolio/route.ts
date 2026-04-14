import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// GET — List all published portfolio items
export async function GET() {
    try {
        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*, project:projects(id, title, metadata)')
            .not('published_at', 'is', null)
            .order('is_featured', { ascending: false })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('Portfolio GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST — Create a new portfolio item
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            project_id,
            title,
            description,
            featured_image_url,
            gallery_images,
            tags,
            is_featured,
            display_order,
            published_at
        } = body

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
            .from('portfolio_items')
            .insert({
                project_id: project_id || null,
                title,
                description: description || null,
                featured_image_url: featured_image_url || null,
                gallery_images: gallery_images || [],
                tags: tags || [],
                is_featured: is_featured || false,
                display_order: display_order || 0,
                business_unit: 'alma_verde',
                published_at: published_at || null
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Portfolio POST error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
