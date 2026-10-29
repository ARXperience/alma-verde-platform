import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/projects/access'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// GET — List ALL portfolio items (for admin, includes unpublished)
export async function GET() {
    // Admin-only: these routes use the service key, so they must check the caller
    const staff = await requireStaff()
    if ('error' in staff) return staff.error

    try {
        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('Portfolio admin GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
