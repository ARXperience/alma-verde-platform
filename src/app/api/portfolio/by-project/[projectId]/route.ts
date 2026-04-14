import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// GET — Get portfolio item for a specific project
export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params
        const supabase = getSupabaseAdmin()

        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('project_id', projectId)
            .maybeSingle()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Portfolio by project GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
