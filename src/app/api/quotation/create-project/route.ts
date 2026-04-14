import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { QuotationVariables, PricingBreakdown } from '@/types/quotation'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const {
            briefing,
            variables,
            description,
            pricing,
            render_images,
        } = await request.json()

        if (!variables) {
            return NextResponse.json(
                { error: 'Variables are required' },
                { status: 400 }
            )
        }


        // Use Admin Client for database operations to avoid RLS issues
        const adminSupabase = await createAdminClient()

        console.log('[CREATE-PROJECT] About to insert project for user:', user.id)
        console.log('[CREATE-PROJECT] Variables:', JSON.stringify(variables, null, 2))

        // Create project with CORRECT schema fields (matching database.ts)
        const { data: project, error: projectError } = await (adminSupabase
            .from('projects') as any)
            .insert({
                client_id: user.id,
                business_unit: 'alma_verde', // Default
                title: `Cotización - ${variables.project_type || 'Proyecto'}`,
                description: description || briefing || 'Proyecto generado con IA',
                project_type: (variables.project_type || 'otro').toLowerCase(), // Ensure lowercase for Enum
                status: 'cotizacion',
                estimated_cost: pricing?.total || 0,

                // Detailed Data
                briefing: briefing || null,
                extracted_variables: variables || {},
                pricing_breakdown: pricing || {},

                // Metadata for other fields
                metadata: {
                    area: parseFloat(variables.square_meters?.toString() || '0'),
                    location: variables.location || null,
                    ai_generated: true,
                    ai_prompt: briefing || null,
                    render_images: render_images || []
                }
            })
            .select()
            .single()

        if (projectError) {
            console.error('[CREATE-PROJECT] Error creating project:', JSON.stringify(projectError, null, 2))
            return NextResponse.json(
                { error: 'Failed to create project', details: projectError },
                { status: 500 }
            )
        }

        console.log('[CREATE-PROJECT] Project created successfully:', project.id)

        // Save render images if any
        if (render_images && render_images.length > 0 && project) {
            const renderInserts = render_images.map((img: any, index: number) => ({
                project_id: project.id,
                image_url: img.url,
                prompt: img.prompt,
                version: index + 1,
                is_selected: index === 0,
                status: 'completed'
            }))

            const { error: renderError } = await (adminSupabase
                .from('project_renders') as any)
                .insert(renderInserts)

            if (renderError) {
                console.error('Error saving renders:', renderError)
            }
        }

        return NextResponse.json({
            project,
            message: 'Project created successfully'
        })
    } catch (error: any) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { error: 'Failed to create project', details: error.message },
            { status: 500 }
        )
    }
}
