import { NextResponse } from 'next/server'
import { generateProjectRender } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { projectId, projectDetails } = body

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            )
        }

        console.log('🎨 Generating render image for project:', projectId)

        // Generate the image using DALL-E 3
        const imageUrl = await generateProjectRender({
            projectType: projectDetails.project_type || 'exhibition stand',
            squareMeters: projectDetails.square_meters,
            materials: projectDetails.materials || [],
            stylePreferences: projectDetails.style_preferences,
            description: projectDetails.description
        })

        console.log('✅ Image generated successfully')

        // Save the render to the database
        const supabase = await createClient()

        const { data: renderData, error: renderError } = await (supabase
            .from('project_renders') as any)
            .insert({
                project_id: projectId,
                iteration: 1,
                description: `AI-generated render for ${projectDetails.project_type}`,
                image_url: imageUrl,
                status: 'completed',
            })
            .select()
            .single()

        if (renderError) {
            console.error('Error saving render to database:', renderError)
            // Don't fail the request if DB save fails, still return the image
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            renderId: renderData?.id,
        })
    } catch (error: any) {
        console.error('❌ Error generating render image:', error)
        return NextResponse.json(
            {
                error: 'Failed to generate render image',
                details: error.message
            },
            { status: 500 }
        )
    }
}
