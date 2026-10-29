import { AiConfig, AiProvider, AiTask, AiTaskConfig, DEFAULT_CONFIG, apiKey, getAiConfig } from './config'

// One entry point per AI capability. Each call uses the provider configured for its task in the
// admin, and if that provider fails (PC bridge offline, missing key…) retries once with the default
// provider so the public quotation flow keeps working.

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }
export type GeneratedImage = { buffer: ArrayBuffer; mime: string; provider: AiProvider; model: string }

const BRIDGE_STALE_MS = 3 * 60_000

// `strict` (used by the admin "Probar" button) reports the configured provider's own error instead
async function withFallback<T>(task: AiTask, run: (config: AiConfig, task: AiTaskConfig) => Promise<T>, strict = false): Promise<T> {
    const config = await getAiConfig()
    const chosen = config.tasks[task]
    try {
        return await run(config, chosen)
    } catch (error) {
        const fallback = DEFAULT_CONFIG.tasks[task]
        if (strict || (chosen.provider === fallback.provider && chosen.model === fallback.model)) throw error
        console.warn(`[ai] ${task} via ${chosen.provider}/${chosen.model} failed, falling back to ${fallback.provider}:`, error)
        return run(config, fallback)
    }
}

// ---------- text / chat ----------

// `validate` runs inside the attempt, so an unusable answer (e.g. broken JSON) also triggers the fallback
export async function aiChat(task: AiTask, messages: ChatMessage[], opts: { json?: boolean; strict?: boolean; validate?: (text: string) => void } = {}): Promise<string> {
    return withFallback(task, async (config, { provider, model }) => {
        const raw = provider === 'gemini' ? await geminiChat(config, model, messages, opts.json)
            : provider === 'openai' ? await openaiChat(config, model, messages, opts.json)
            : provider === 'local' ? await localChat(config, model, messages)
            : unsupported(provider, task)
        const text = stripThinking(raw)
        opts.validate?.(text)
        return text
    }, opts.strict)
}

export function aiText(task: AiTask, prompt: string) {
    return aiChat(task, [{ role: 'user', content: prompt }])
}

export async function aiJSON<T>(task: AiTask, prompt: string): Promise<T> {
    let result: T | undefined
    await aiChat(task, [{ role: 'user', content: `${prompt}\n\nResponde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.` }], {
        json: true,
        validate: text => { result = parseJSON<T>(text) },
    })
    return result as T
}

// ---------- audio ----------

export async function aiTranscribe(file: File): Promise<string> {
    return withFallback('transcribe', async (config, { provider, model }) => {
        if (provider === 'gemini') {
            const audio = Buffer.from(await file.arrayBuffer()).toString('base64')
            const parts = await gemini(config, model, {
                contents: [{
                    role: 'user',
                    parts: [
                        { inline_data: { mime_type: (file.type || 'audio/webm').split(';')[0], data: audio } },
                        { text: 'Transcribe este audio palabra por palabra, en el idioma en que se habla (normalmente español). Devuelve solo la transcripción, sin comentarios.' },
                    ],
                }],
            })
            return textOf(parts).trim()
        }
        if (provider === 'openai') {
            const form = new FormData()
            form.append('file', file, file.name || 'audio.webm')
            form.append('model', model)
            form.append('language', 'es')
            const data = await call('OpenAI', 'https://api.openai.com/v1/audio/transcriptions', {
                headers: { Authorization: `Bearer ${requireKey(config, 'openai')}` }, body: form, timeout: 120_000,
            })
            return data.text as string
        }
        return unsupported(provider, 'transcribe')
    })
}

// ---------- images ----------

export async function aiImage(prompt: string, opts: { strict?: boolean } = {}): Promise<GeneratedImage> {
    return withFallback('image', async (config, { provider, model }) => {
        if (provider === 'pollinations') {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1792&height=1024&nologo=true&model=${encodeURIComponent(model)}`
            const res = await fetch(url, { signal: AbortSignal.timeout(90_000) })
            if (!res.ok) throw new Error(`Pollinations ${res.status}`)
            return { buffer: await res.arrayBuffer(), mime: res.headers.get('content-type') || 'image/jpeg', provider, model }
        }
        if (provider === 'gemini') {
            const parts = await gemini(config, model, {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
            })
            const image = parts.find(p => p.inlineData)
            if (!image?.inlineData) throw new Error('Gemini no devolvió imagen')
            return { buffer: base64ToBuffer(image.inlineData.data), mime: image.inlineData.mimeType || 'image/png', provider, model }
        }
        if (provider === 'openai') {
            const dalle = model.startsWith('dall-e')
            const data = await call('OpenAI', 'https://api.openai.com/v1/images/generations', {
                headers: { Authorization: `Bearer ${requireKey(config, 'openai')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, n: 1, size: dalle ? '1792x1024' : '1536x1024', ...(dalle ? { response_format: 'b64_json' } : {}) }),
                timeout: 180_000,
            })
            return { buffer: base64ToBuffer(data.data[0].b64_json), mime: 'image/png', provider, model }
        }
        if (provider === 'local') {
            const data = await bridge(config, '/image', { prompt, model, width: 1344, height: 768 }, 240_000)
            return { buffer: base64ToBuffer(data.b64), mime: data.mime || 'image/png', provider, model }
        }
        return unsupported(provider, 'image')
    }, opts.strict)
}

// ---------- providers ----------

type GeminiPart = { text?: string; thought?: boolean; inlineData?: { data: string; mimeType?: string } }

async function gemini(config: AiConfig, model: string, body: Record<string, unknown>): Promise<GeminiPart[]> {
    const data = await call('Gemini', `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        headers: { 'x-goog-api-key': requireKey(config, 'gemini'), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        timeout: 180_000,
    })
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) throw new Error(`Gemini no devolvió contenido (${data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || 'sin motivo'})`)
    return parts
}

async function geminiChat(config: AiConfig, model: string, messages: ChatMessage[], json?: boolean) {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n')
    const parts = await gemini(config, model, {
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: messages.filter(m => m.role !== 'system')
            .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 8192, ...(json ? { responseMimeType: 'application/json' } : {}) },
    })
    return textOf(parts)
}

async function openaiChat(config: AiConfig, model: string, messages: ChatMessage[], json?: boolean) {
    const data = await call('OpenAI', 'https://api.openai.com/v1/chat/completions', {
        headers: { Authorization: `Bearer ${requireKey(config, 'openai')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, ...(json ? { response_format: { type: 'json_object' } } : {}) }),
        timeout: 180_000,
    })
    return data.choices[0].message.content as string
}

// LM Studio behind the local bridge speaks the OpenAI chat API
async function localChat(config: AiConfig, model: string, messages: ChatMessage[]) {
    const data = await bridge(config, '/v1/chat/completions', { model, messages, temperature: 0.4 }, 240_000)
    return data.choices[0].message.content as string
}

async function bridge(config: AiConfig, path: string, body: unknown, timeout: number) {
    const { url, token, lastSeen } = config.bridge
    if (!url || !token) throw new Error('El puente local no está configurado')
    if (!lastSeen || Date.now() - new Date(lastSeen).getTime() > BRIDGE_STALE_MS) throw new Error('El puente local está desconectado')
    // No retries: a bridge error is usually real (ComfyUI failed…) and image runs are slow
    return call('Puente local', url + path, {
        headers: { 'x-bridge-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        timeout,
    }, 0)
}

// ---------- helpers ----------

function requireKey(config: AiConfig, provider: 'gemini' | 'openai') {
    const key = apiKey(config, provider)
    if (!key) throw new Error(`Falta la API key de ${provider === 'gemini' ? 'Gemini' : 'OpenAI'}`)
    return key
}

const RETRYABLE = new Set([429, 500, 502, 503, 504])

// POST returning JSON; retries transient upstream errors (rate limit, "high demand" overload) after 1.5 s and 4.5 s
async function call(name: string, url: string, init: { headers: Record<string, string>; body: BodyInit; timeout: number }, retries = 2) {
    for (let attempt = 0; ; attempt++) {
        const res = await fetch(url, { method: 'POST', headers: init.headers, body: init.body, signal: AbortSignal.timeout(init.timeout) })
        if (res.ok) return res.json()
        const detail = (await res.text()).slice(0, 300)
        if (!RETRYABLE.has(res.status) || attempt >= retries) throw new Error(`${name} respondió ${res.status}: ${detail}`)
        await new Promise(resolve => setTimeout(resolve, 1500 * 3 ** attempt))
    }
}

function unsupported(provider: string, task: string): never {
    throw new Error(`El proveedor ${provider} no soporta la tarea ${task}`)
}

const textOf = (parts: GeminiPart[]) => parts.filter(p => p.text && !p.thought).map(p => p.text).join('')

// Thinking models (Kimi-VL Thinking, DeepSeek-R1, Qwen3…) may inline their reasoning
function stripThinking(text: string) {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/◁think▷[\s\S]*?◁\/think▷/g, '').trim()
}

export function parseJSON<T>(text: string): T {
    const cleaned = stripThinking(text).replace(/```(?:json)?/g, '').trim()
    try {
        return JSON.parse(cleaned)
    } catch {
        const start = cleaned.search(/[{[]/)
        const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'))
        if (start < 0 || end <= start) throw new Error(`La IA no devolvió JSON: ${cleaned.slice(0, 200)}`)
        return JSON.parse(cleaned.slice(start, end + 1))
    }
}

function base64ToBuffer(b64: string): ArrayBuffer {
    const buf = Buffer.from(b64, 'base64')
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}
