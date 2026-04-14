import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'DUMMY_KEY',
})

/**
 * Generate an image using DALL-E 3
 * @param prompt - Description of the image to generate
 * @param size - Image size (1024x1024, 1024x1792, or 1792x1024)
 * @param quality - Image quality (standard or hd)
 * @returns URL of the generated image
 */
export async function generateImage(
    prompt: string,
    size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024',
    quality: 'standard' | 'hd' = 'hd'
): Promise<string> {
    try {
        console.log('🎨 Generating image with DALL-E 3:', { prompt: prompt.substring(0, 100) + '...', size, quality })

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size,
            quality,
            response_format: 'url',
        })

        const imageUrl = response?.data?.[0]?.url
        if (!imageUrl) {
            throw new Error('No image URL returned from DALL-E 3')
        }

        console.log('✅ Image generated successfully:', imageUrl)
        return imageUrl
    } catch (error: any) {
        console.error('❌ Error generating image with DALL-E 3:', error)
        throw new Error(`Failed to generate image: ${error.message}`)
    }
}

/**
 * Download an image from a URL and convert to base64
 * @param url - URL of the image to download
 * @returns Base64 encoded image data
 */
export async function downloadImageAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return buffer.toString('base64')
    } catch (error: any) {
        console.error('Error downloading image:', error)
        throw new Error(`Failed to download image: ${error.message}`)
    }
}

/**
 * Generate a project render image based on project details
 * @param projectDetails - Details about the project for the render
 * @returns URL of the generated render image
 */
export async function generateProjectRender(projectDetails: {
    projectType: string
    squareMeters?: number
    materials?: string[]
    stylePreferences?: string
    description?: string
}): Promise<string> {
    // Create a detailed prompt for DALL-E 3
    const prompt = `
Professional architectural 3D render of a ${projectDetails.projectType}.
${projectDetails.squareMeters ? `Size: ${projectDetails.squareMeters} square meters.` : ''}
${projectDetails.materials && projectDetails.materials.length > 0
            ? `Materials: ${projectDetails.materials.join(', ')}.`
            : ''}
${projectDetails.stylePreferences
            ? `Style: ${projectDetails.stylePreferences}.`
            : 'Modern and professional style.'}
${projectDetails.description || ''}

The render should be:
- Photorealistic and high quality
- Well-lit with professional lighting
- Show the complete structure from an attractive angle
- Include context and environment
- Professional architectural visualization quality
`.trim()

    return generateImage(prompt, '1792x1024', 'hd')
}

export { openai }
