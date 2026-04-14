import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini/client'
import { buildPrompt, CHAT_ASSISTANT_PROMPT } from '@/lib/gemini/prompts'

export async function POST(request: NextRequest) {
    try {
        const { messages, project_context } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
        }

        // Build system prompt with project context
        const systemPrompt = buildPrompt(CHAT_ASSISTANT_PROMPT, {
            project_context: project_context || 'Nuevo proyecto sin información previa',
        })

        // Prepend system message
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages,
        ]

        // Get response from Gemini
        const response = await chat(fullMessages)

        return NextResponse.json({ response })
    } catch (error) {
        console.error('Error in chat:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
