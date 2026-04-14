import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/gemini/client'
import { buildPrompt, GENERATE_RENDER_PROMPT } from '@/lib/gemini/prompts'

export async function POST(request: NextRequest) {
    try {
        const { project_type, description, style, materials, dimensions } = await request.json()

        if (!project_type || !description) {
            return NextResponse.json(
                { error: 'Project type and description are required' },
                { status: 400 }
            )
        }

        // Build prompt for render description
        const prompt = buildPrompt(GENERATE_RENDER_PROMPT, {
            project_type,
            description,
            style: style || 'moderno y profesional',
            materials: Array.isArray(materials) ? materials.join(', ') : materials || 'materiales de alta calidad',
            dimensions: dimensions || 'proporciones estándar',
        })

        // Generate render description using Gemini
        const renderDescription = await generateText(prompt)

        // Note: For actual image generation, you would integrate with:
        // - DALL-E 3 (OpenAI)
        // - Midjourney API
        // - Stable Diffusion
        // - Or use Gemini's vision capabilities when available

        // For now, we return the detailed description
        // which can be used with any image generation service

        return NextResponse.json({
            render_description: renderDescription,
            note: 'Use this description with your preferred image generation service (DALL-E, Midjourney, etc.)'
        })
    } catch (error) {
        console.error('Error generating render description:', error)
        return NextResponse.json(
            { error: 'Failed to generate render description' },
            { status: 500 }
        )
    }
}
