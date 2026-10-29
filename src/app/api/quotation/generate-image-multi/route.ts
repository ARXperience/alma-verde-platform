import { NextResponse } from 'next/server'

import { aiImage } from '@/lib/ai/engine'
import { projectAccess } from '@/lib/projects/access'

export const maxDuration = 300

// Every render is a paid AI call: clients get this many per project, staff are not limited
const MAX_CLIENT_RENDERS = 12

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { projectId, prompt, projectDetails, instructions } = body

        console.log(`[GenerateImage] Starting for project: ${projectId}, `)

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const access = await projectAccess(projectId)
        if ('error' in access) return access.error
        // Service client (bypasses RLS) for the storage upload and render rows
        const supabase = access.admin

        if (!access.staff) {
            const { count } = await supabase.from('project_renders').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
            if ((count ?? 0) >= MAX_CLIENT_RENDERS) {
                return NextResponse.json({ error: `Ya generaste ${MAX_CLIENT_RENDERS} versiones para este proyecto. Un asesor puede crear más por ti.` }, { status: 429 })
            }
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

        // Provider (Pollinations / Gemini / OpenAI / ComfyUI on the office PC) is chosen in Admin > Motor de IA
        const image = await aiImage(imagePrompt)
        const imageBuffer = image.buffer
        console.log(`[GenerateImage] Image generated with ${image.provider}/${image.model}, size:`, imageBuffer.byteLength)

        const extension = image.mime.includes('jpeg') ? 'jpg' : image.mime.includes('webp') ? 'webp' : 'png'
        const fileName = `${projectId}/${Date.now()}-render.${extension}`
        console.log('[GenerateImage] Uploading to Storage:', fileName)

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-renders')
            .upload(fileName, imageBuffer, {
                contentType: image.mime,
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
                    metadata: { provider: image.provider, model: image.model }
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
                                provider: image.provider,
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
                provider: image.provider,
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
