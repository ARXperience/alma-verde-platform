import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

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

        // Whisper transcription
        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'es', // Set language to Spanish explicitly or leave auto-detect
        })

        console.log('✅ Transcription successful:', transcription.text.substring(0, 50) + '...')

        return NextResponse.json({
            text: transcription.text
        })
    } catch (error: any) {
        console.error('❌ Error transcribing audio:', error)
        return NextResponse.json(
            { error: 'Failed to transcribe audio', details: error.message },
            { status: 500 }
        )
    }
}
