import { GoogleGenerativeAI } from '@google/generative-ai'

const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || 'DUMMY_KEY';

if (!process.env.GOOGLE_GEMINI_API_KEY && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ GOOGLE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Model for text generation and analysis
export const textModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    },
})

// Model for image analysis
export const imageModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 32,
        maxOutputTokens: 4096,
    },
})

// Helper function to generate text
export async function generateText(prompt: string) {
    try {
        const result = await textModel.generateContent(prompt)
        const response = result.response
        return response.text()
    } catch (error) {
        console.error('Error generating text with Gemini:', error)
        throw error
    }
}

// Helper function to generate structured JSON
export async function generateJSON<T>(prompt: string): Promise<T> {
    try {
        const result = await textModel.generateContent(prompt + '\n\nRespond ONLY with valid JSON, no markdown formatting.')
        const response = result.response
        const text = response.text()

        // Remove markdown code blocks if present
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        return JSON.parse(cleanedText)
    } catch (error) {
        console.error('Error generating JSON with Gemini:', error)
        throw error
    }
}

// Helper function for chat-based interaction
export async function chat(messages: { role: string; content: string }[]) {
    try {
        const chat = textModel.startChat({
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        })

        const lastMessage = messages[messages.length - 1]
        const result = await chat.sendMessage(lastMessage.content)
        const response = result.response
        return response.text()
    } catch (error) {
        console.error('Error in chat with Gemini:', error)
        throw error
    }
}

// Helper function to analyze images
export async function analyzeImage(imageData: string, prompt: string) {
    try {
        const result = await imageModel.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageData,
                },
            },
        ])
        const response = result.response
        return response.text()
    } catch (error) {
        console.error('Error analyzing image with Gemini:', error)
        throw error
    }
}

// Helper function to generate images (Imagen)
export async function generateImage(prompt: string): Promise<string> {
    try {
        // Use the imagen model
        const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' })

        const result = await model.generateContent(prompt)
        const response = result.response

        // Imagen response usually contains images in parts or a specific field
        // For the current API version, we might get a base64 string or a URL
        // Inspecting the response structure is crucial, but assuming standard 'text' might fail if it's binary
        // However, the JS SDK often returns images as inlineData in parts for multimodal

        // NOTE: If using the REST API for Imagen on Vertex AI, it's different.
        // But for AI Studio, let's assume it returns a base64 in the content.

        // Fallback for now: If SDK doesn't support it directly, valid standard is to check candidates
        // For now, let's return a placeholder or the raw text if it's a description
        // But the requirement is an IMAGE. 

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error('No image candidate returned')
        }

        // Check for inline data (base64)
        const firstPart = response.candidates[0].content.parts[0]
        if (!firstPart) throw new Error('No content parts')

        if ('inlineData' in firstPart && firstPart.inlineData) {
            return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`
        }

        throw new Error('Unexpected response format from Imagen')

    } catch (error) {
        console.error('Error generating image with Gemini:', error)
        throw error
    }
}

export { genAI }
