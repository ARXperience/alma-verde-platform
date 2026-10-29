import { NextResponse } from 'next/server'
import { aiTranscribe } from '@/lib/ai/engine'

export const maxDuration = 120

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        console.log('🎤 Receiving audio for transcription:', {
            name: file.name,
            type: file.type,
            size: file.size
        })

        // Provider (Gemini / OpenAI Whisper) is chosen in Admin > Configuración > Motor de IA
        const text = await aiTranscribe(file)

        console.log('✅ Transcription successful:', text.substring(0, 50) + '...')

        return NextResponse.json({ text })
    } catch (error) {
        console.error('❌ Error transcribing audio:', error)
        return NextResponse.json(
            { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
