import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Profile fetch error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (err: any) {
        console.error('Profile API error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
