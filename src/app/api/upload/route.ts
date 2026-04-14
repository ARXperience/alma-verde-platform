
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const bucket = formData.get('bucket') as string || 'product-images'
        const folder = formData.get('folder') as string || ''

        if (!file) {
            return NextResponse.json(
                { error: 'No files received.' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = file.name.replaceAll(' ', '_')
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const ext = filename.split('.').pop()
        const basename = filename.replace(`.${ext}`, '')
        const finalName = `${folder ? folder + '/' : ''}${basename}-${uniqueSuffix}.${ext}`

        // Initialize Supabase Client with Service Role Key
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(finalName, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error('Supabase Storage Error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: publicUrl,
            path: data.path
        })

    } catch (error) {
        console.error('Upload Route Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
