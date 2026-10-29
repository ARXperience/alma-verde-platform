import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Profile of the signed-in user. The user comes from the access token, never from the query:
// taking ?userId= from the request let anyone read any user's email, phone and role.
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
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
