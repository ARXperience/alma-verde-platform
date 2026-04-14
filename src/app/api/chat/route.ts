import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini/client'
import { buildPrompt, CHAT_ASSISTANT_PROMPT } from '@/lib/gemini/prompts'

export async function POST(request: NextRequest) {
    try {
        const { messages, projectContext } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
        }

        // Prepare system instruction
        // Note: Gemini API via GoogleGenerativeAI doesn't strictly support "system" role in the same way as OpenAI in the messages array for all models, 
        // but we can prepend it or use the system instruction feature if available in the model config.
        // For simplicity with the current client.ts, we will prepend the system prompt to the first message or use it to context.

        // However, looking at client.ts:
        // export async function chat(messages: { role: string; content: string }[]) {
        //    const chat = textModel.startChat({ ... })
        // }
        // We should inject the system prompt logic. 
        // The client.ts 'chat' function takes the history and sends the last message.

        // Let's create a specialized use here or adapt. 
        // We will prepend the system prompt to the conversation history logic if client.ts doesn't handle it.
        // But client.ts is simple. Let's try to pass the context in the first message if it's a new chat, 
        // or just rely on the model's general capability if we can't easily change client.ts right now without breaking things.

        // Better approach: Use the prompt template to wrap the user's input? No, that breaks chat history.
        // Let's modify the first message to include the system prompt if it's the start, or assume the "Assistant" persona is set.

        // Actually, let's look at `CHAT_ASSISTANT_PROMPT`.
        const systemPrompt = buildPrompt(CHAT_ASSISTANT_PROMPT, {
            project_context: projectContext ? JSON.stringify(projectContext) : 'No specific project context yet.'
        })

        // We'll prepend a system instruction-like message to the history for the model to know how to behave.
        // Google Generative AI Node SDK supports systemInstruction in model config, but our client.ts initializes model globally.
        // We will just prepend it to the first interaction effectively.

        const geminiMessages = [
            { role: 'user', content: systemPrompt + "\n\n[System Initialization]" },
            { role: 'model', content: "Entendido. Estoy listo para actuar como el asistente de Alma Verde." },
            ...messages
        ];

        // We need to call the chat function.
        // client.ts chat function expects plain messages. 
        // Let's send these prepared messages.

        const responseText = await chat(geminiMessages)

        return NextResponse.json({ message: responseText })
    } catch (error) {
        console.error('Error in chat API:', error)
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
