import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function generateImageWithImagen(prompt: string): Promise<string> {
    try {
        // Note: Using direct REST API for Imagen 3

        // Using the 'imagen-3.0-generate-001' model
        const modelId = 'imagen-3.0-generate-001'
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: prompt,
                        },
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: '16:9',
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Gemini Imagen API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        // Check for base64 image in response
        // The structure depends on the specific API version, usually predictions[0].bytesBase64Encoded or similar
        const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded

        if (!imageBase64) {
            console.error('Unexpected Gemini Imagen response structure:', JSON.stringify(data).substring(0, 200))
            throw new Error('No image found in Gemini response')
        }

        // Upload to Supabase Storage later or return base64
        // For now, let's return a data URL
        return `data:image/png;base64,${imageBase64}`

    } catch (error) {
        console.error('Error generating image with Gemini Imagen:', error)
        throw error
    }
}
