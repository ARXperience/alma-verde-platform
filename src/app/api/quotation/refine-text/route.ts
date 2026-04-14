import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/client'

export async function POST(request: Request) {
    try {
        const { text } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Architectural Visualization Specialist and Copywriter. 
                    Your task is to refine the user's project description to be highly professional, clear, and optimized for 3D rendering briefs.
                    
                    Guidelines:
                    1. Clarity & Flow: Fix grammar, remove fillers, and organize the text logically.
                    2. 3D Specs: Infer and explicitly add professional details relevant to the context if missing (e.g., "cinematic lighting," "photorealistic textures," "modern minimalist style," "high-end finishes").
                    3. Structure: Keep it as a cohesive paragraph or structured description.
                    4. Tone: Professional, persuasive, and descriptive.
                    5. Language: MANDATORY - Output the refined text in the SAME LANGUAGE as the input (likely Spanish). Do NOT translate to English unless the input is in English.
                    
                    Input Text: "${text}"
                    
                    Output ONLY the refined text.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 600,
        })

        const refinedText = completion.choices[0].message.content

        return NextResponse.json({ text: refinedText })
    } catch (error: any) {
        console.error('Error refining text:', error)
        return NextResponse.json(
            { error: 'Failed to refine text', details: error.message },
            { status: 500 }
        )
    }
}
