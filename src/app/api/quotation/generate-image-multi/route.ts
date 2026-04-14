import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/openai/client'
import { createAdminClient } from '@/lib/supabase/server'

// Robust UUID generator fallback
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { projectId, prompt, projectDetails, instructions } = body
        // Use Admin Client to bypass RLS for storage upload
        const supabase = await createAdminClient()

        console.log(`[GenerateImage] Starting for project: ${projectId}, Provider: DALL-E`)

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        // Generate comprehensive prompt
        let imagePrompt = prompt || ''

        // If prompt is empty or we want to auto-generate based on details
        if (!imagePrompt && projectDetails) {
            const rawDescription = projectDetails.description || '';

            // Construct a strong, DALL-E optimized prompt manually
            imagePrompt = `Architectural visualization of: "${rawDescription}". `
            imagePrompt += `Project type: ${projectDetails.project_type}. `
            imagePrompt += `Size: ${projectDetails.square_meters} m2. `
            imagePrompt += `Materials: ${projectDetails.materials?.join(', ') || 'Standard'}. `
            imagePrompt += `Style: ${projectDetails.style_preferences || 'Modern'}. `
            imagePrompt += `High quality, photorealistic, 8k, ultra-detailed professional render, cinematic lighting.`

            if (instructions) {
                imagePrompt += ` IMPORTANT: ${instructions}`
            }
        } else if (instructions && imagePrompt) {
            imagePrompt += `. Note: ${instructions}`
        }

        console.log('[GenerateImage] Generating with DALL-E 3...')

        // Generate with DALL-E 3
        console.log('[GenerateImage] Requesting image from DALL-E...')
        const dalleUrl = await generateImage(imagePrompt, '1792x1024', 'hd')
        console.log('[GenerateImage] DALL-E URL received:', dalleUrl)

        // PERSISTENCE: Download image and upload to Supabase Storage
        console.log('[GenerateImage] Downloading from DALL-E...')
        const imageRes = await fetch(dalleUrl)
        if (!imageRes.ok) throw new Error(`Failed to download image from DALL-E: ${imageRes.statusText}`)
        const imageBuffer = await imageRes.arrayBuffer()
        console.log('[GenerateImage] Image downloaded, buffer size:', imageBuffer.byteLength)

        const fileName = `${projectId}/${Date.now()}-render.png`
        console.log('[GenerateImage] Uploading to Storage:', fileName)

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-renders')
            .upload(fileName, imageBuffer, {
                contentType: 'image/png',
                upsert: false
            })

        if (uploadError) {
            console.error('[GenerateImage] Storage Upload Error:', uploadError)
            throw new Error(`Storage Upload Failed: ${uploadError.message}`)
        }
        console.log('[GenerateImage] Storage Upload Success')

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('project-renders')
            .getPublicUrl(fileName)

        console.log('[GenerateImage] Persisted URL:', publicUrl)

        // Save to database with PERMANENT URL
        try {
            const { data: currentRenders } = await supabase
                .from('project_renders')
                .select('version')
                .eq('project_id', projectId)
                .order('version', { ascending: false })
                .limit(1)

            // Safe version increment - Handle potential null/empty
            const nextVersion = (currentRenders && currentRenders.length > 0) ? (currentRenders[0] as any).version + 1 : 1

            // Unselect previous renders
            await (supabase
                .from('project_renders') as any)
                .update({ is_selected: false })
                .eq('project_id', projectId)

            // Insert new render
            const { error: saveError } = await (supabase
                .from('project_renders') as any)
                .insert({
                    project_id: projectId,
                    image_url: publicUrl, // Use persistent URL
                    prompt: imagePrompt,
                    version: nextVersion,
                    is_selected: true,
                    // status: 'completed' 
                    metadata: { provider: 'dall-e-3', original_url: dalleUrl }
                })

            if (saveError) {
                console.error('[GenerateImage] Error saving to DB:', saveError)
                throw saveError
            }

            // Update Project Metadata for backward compatibility / fast access
            try {
                const { data: projectData } = await (supabase
                    .from('projects') as any)
                    .select('metadata')
                    .eq('id', projectId)
                    .single()

                if (projectData) {
                    const currentMetadata = (projectData.metadata as any) || {}
                    const updatedMetadata = {
                        ...currentMetadata,
                        render_image: publicUrl,
                        render_images: [
                            ...(Array.isArray(currentMetadata.render_images) ? currentMetadata.render_images : []),
                            {
                                url: publicUrl,
                                prompt: imagePrompt,
                                provider: 'dall-e-3',
                                created_at: new Date().toISOString(),
                                version: nextVersion
                            }
                        ]
                    }

                    await (supabase
                        .from('projects') as any)
                        .update({ metadata: updatedMetadata })
                        .eq('id', projectId)
                }
            } catch (metaError) {
                console.error('[GenerateImage] Metadata update error:', metaError)
            }
        } catch (dbError) {
            console.error('[GenerateImage] DB save error:', dbError)
            throw dbError
        }

        return NextResponse.json({
            images: [{
                provider: 'dall-e-3',
                url: publicUrl,
                prompt: imagePrompt
            }],
            message: 'Images generated and persisted successfully'
        })
    } catch (error: any) {
        console.error('[GenerateImage] Fatal Error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
