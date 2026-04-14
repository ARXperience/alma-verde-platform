import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'
import type { QuotationVariables } from '@/types/quotation'

export async function POST(request: NextRequest) {
    try {
        const { briefing } = await request.json()

        if (!briefing || typeof briefing !== 'string') {
            return NextResponse.json(
                { error: 'Briefing is required' },
                { status: 400 }
            )
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an AI Cost Estimator for an architecture agency. Extract key variables from the project briefing into a JSON object.
                    
                    Required JSON Structure:
                    {
                        "project_type": string, // MUST be one of: "stand", "evento", "branding", "decoracion", "mobiliario", "alquiler", "otro"
                                               // Examples: furniture/sofas→"mobiliario", exhibitions→"stand", events→"evento", interior design→"decoracion"
                        "square_meters": number, // Estimated area. If range, take average. If missing, estimate based on context or use 0.
                        "location": string, // City or specific location. Default "Bogotá" if unknown.
                        "production_time": number, // Days. Default 15 if unknown.
                        "materials": string[], // List of mentioned or implied materials (e.g., "madera", "vidrio", "metal").
                        "style_preferences": string, // e.g., "moderno", "industrial", "eco-friendly"
                        "budget_range": string // e.g., "low", "medium", "high"
                    }
                    
                    CRITICAL: project_type must be one of these exact values: "stand", "evento", "branding", "decoracion", "mobiliario", "alquiler", "otro". 
                    If the project doesn't fit these categories, use "otro".
                    If specific values are missing, infer reasonable defaults based on the project type.`
                },
                {
                    role: "user",
                    content: briefing
                }
            ]
        })

        const content = completion.choices[0].message.content
        if (!content) throw new Error("No content generated")

        const variables = JSON.parse(content) as QuotationVariables

        return NextResponse.json({ variables })
    } catch (error: any) {
        console.error('Error extracting variables with OpenAI:', error)
        return NextResponse.json(
            { error: 'Failed to extract variables', details: error.message },
            { status: 500 }
        )
    }
}
