import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/gemini/client'
import { buildPrompt, CALCULATE_PRICING_PROMPT } from '@/lib/gemini/prompts'
import type { PricingBreakdown, QuotationVariables } from '@/types/quotation'

export async function POST(request: NextRequest) {
    try {
        const { variables } = await request.json()

        if (!variables) {
            return NextResponse.json(
                { error: 'Variables are required' },
                { status: 400 }
            )
        }

        // Build prompt with variables
        const prompt = buildPrompt(CALCULATE_PRICING_PROMPT, {
            variables: JSON.stringify(variables, null, 2),
        })

        // Calculate pricing using Gemini
        const pricing = await generateJSON<PricingBreakdown>(prompt)

        return NextResponse.json({ pricing })
    } catch (error) {
        console.error('Error calculating pricing:', error)
        return NextResponse.json(
            { error: 'Failed to calculate pricing' },
            { status: 500 }
        )
    }
}
