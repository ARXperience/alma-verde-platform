import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { AiConfig, AiTask, TASKS, getAiConfig, publicView, saveAiConfig, saveBridgeState } from '@/lib/ai/config'
import { aiChat, aiImage } from '@/lib/ai/engine'

export const maxDuration = 300

// Only the `admin` role may read or change the AI engine (it holds API keys and the bridge token)
async function isAdmin() {
    const { data: { user } } = await (await createSessionClient()).auth.getUser()
    if (!user) return false
    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data } = await service.from('users').select('role').eq('id', user.id).single()
    return data?.role === 'admin'
}

const forbidden = () => NextResponse.json({ error: 'Solo un administrador puede configurar el motor de IA' }, { status: 403 })

export async function GET() {
    if (!(await isAdmin())) return forbidden()
    return NextResponse.json(publicView(await getAiConfig(true)))
}

// Body: { tasks?, keys?: { gemini?: string | null, openai?: string | null }, regenerateToken?: boolean }
// A key set to "" is left unchanged, null removes it (the env variable is used again).
export async function PUT(request: Request) {
    if (!(await isAdmin())) return forbidden()
    const body = await request.json()
    const config: AiConfig = await getAiConfig(true)

    for (const task of TASKS) {
        const next = body.tasks?.[task.id]
        if (!next) continue
        const model = String(next.model || '').trim()
        if (!task.providers.includes(next.provider) || !model || model.length > 120) {
            return NextResponse.json({ error: `Configuración inválida para "${task.label}"` }, { status: 400 })
        }
        config.tasks[task.id] = { provider: next.provider, model }
    }
    for (const provider of ['gemini', 'openai'] as const) {
        const value = body.keys?.[provider]
        if (value === null) delete config.keys[provider]
        else if (typeof value === 'string' && value.trim()) config.keys[provider] = value.trim()
    }
    if (body.regenerateToken || !config.bridge.token) {
        // A new token disconnects the old bridge until its .env is updated
        config.bridge = { token: randomBytes(24).toString('hex') }
        await saveBridgeState({})
    }

    await saveAiConfig(config)
    return NextResponse.json(publicView(config))
}

// "Probar": runs the configured provider for one task without falling back
export async function POST(request: Request) {
    if (!(await isAdmin())) return forbidden()
    const { task } = (await request.json()) as { task: AiTask }
    const config = await getAiConfig(true)
    const started = Date.now()
    try {
        if (task === 'image') {
            const image = await aiImage('Stand ecológico de cartón para feria, render fotorrealista, iluminación suave', { strict: true })
            const preview = `data:${image.mime};base64,${Buffer.from(image.buffer).toString('base64')}`
            return NextResponse.json({ ok: true, ms: Date.now() - started, preview })
        }
        if (task === 'transcribe') {
            return NextResponse.json({ ok: false, error: 'Para probar la transcripción graba un audio en /cotizar' })
        }
        const reply = await aiChat(task, [{ role: 'user', content: 'Responde en una sola frase corta en español: ¿qué es un stand ecológico?' }], { strict: true })
        return NextResponse.json({ ok: true, ms: Date.now() - started, reply, provider: config.tasks[task] })
    } catch (error) {
        return NextResponse.json({ ok: false, ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) })
    }
}
