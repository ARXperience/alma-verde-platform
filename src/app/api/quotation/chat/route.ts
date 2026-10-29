import { NextRequest, NextResponse } from 'next/server'
import { aiChat, type ChatMessage } from '@/lib/ai/engine'
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

        const fullMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: String(m.content),
            })),
        ]

        const response = await aiChat('chat', fullMessages)

        return NextResponse.json({ response })
    } catch (error) {
        console.error('Error in chat:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
