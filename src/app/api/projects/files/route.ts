
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { project_id, file_name, url, type, size } = body

        if (!project_id || !file_name || !url) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Initialize Supabase with Service Role Key to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabaseAdmin
            .from('project_files')
            .insert({
                project_id,
                file_name,
                file_url: url,   // Mapped to file_url
                file_type: type, // Mapped to file_type
                file_size: size  // Mapped to file_size
            })
            .select()
            .single()

        if (error) {
            console.error('Database insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
