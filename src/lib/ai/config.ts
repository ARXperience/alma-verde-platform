import { createClient } from '@supabase/supabase-js'
import type { AiTask, AiTaskConfig } from './tasks'

export * from './tasks'

// AI engine configuration, editable from Admin > Configuración > Motor de IA.
// Stored as JSON in the private `app-config` bucket (server-side only: it holds API keys).

export interface AiConfig {
    tasks: Record<AiTask, AiTaskConfig>
    keys: { gemini?: string; openai?: string }
    bridge: { url?: string; token?: string; lastSeen?: string; info?: Record<string, unknown> }
}

export const DEFAULT_CONFIG: AiConfig = {
    tasks: {
        transcribe: { provider: 'gemini', model: 'gemini-2.5-flash' },
        refine: { provider: 'gemini', model: 'gemini-2.5-flash' },
        extract: { provider: 'gemini', model: 'gemini-2.5-flash' },
        reasoning: { provider: 'gemini', model: 'gemini-3.1-pro-preview' },
        chat: { provider: 'gemini', model: 'gemini-2.5-flash' },
        // Pollinations' free API is often at its limit (503), so the default/fallback is Gemini
        image: { provider: 'gemini', model: 'gemini-3.1-flash-image' },
    },
    keys: {},
    bridge: {},
}

const BUCKET = 'app-config'
const CONFIG_FILE = 'ai-config.json' // tasks, keys, bridge token (written by the admin)
const BRIDGE_FILE = 'ai-bridge.json' // bridge url / heartbeat (written by the PC bridge every minute)
const CACHE_MS = 15_000
let cache: { at: number; config: AiConfig } | null = null

function admin() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Read straight from Storage with a unique query string: the Storage CDN sometimes keeps serving the
// previous version of an updated object, which would make saved admin changes look ignored.
async function readJSON(file: string) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${file}?t=${Date.now()}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: 'no-store',
    })
    // A missing file just means nothing was saved yet
    return res.ok ? res.json() : {}
}

async function writeJSON(file: string, value: unknown) {
    const { error } = await admin().storage.from(BUCKET)
        .upload(file, JSON.stringify(value, null, 2), { contentType: 'application/json', upsert: true, cacheControl: '0' })
    if (error) throw new Error(`No se pudo guardar ${file}: ${error.message}`)
}

export async function getAiConfig(fresh = false): Promise<AiConfig> {
    if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.config
    const [stored, bridgeState] = await Promise.all([readJSON(CONFIG_FILE), readJSON(BRIDGE_FILE)])
    const config: AiConfig = {
        tasks: { ...DEFAULT_CONFIG.tasks, ...stored.tasks },
        keys: { ...stored.keys },
        bridge: { token: stored.bridge?.token, ...bridgeState },
    }
    cache = { at: Date.now(), config }
    return config
}

export async function saveAiConfig(config: AiConfig) {
    await writeJSON(CONFIG_FILE, { tasks: config.tasks, keys: config.keys, bridge: { token: config.bridge.token } })
    cache = { at: Date.now(), config }
}

export async function saveBridgeState(state: { url?: string; lastSeen?: string; info?: Record<string, unknown> }) {
    await writeJSON(BRIDGE_FILE, state)
    cache = null
}

export function apiKey(config: AiConfig, provider: 'gemini' | 'openai') {
    return provider === 'gemini'
        ? config.keys.gemini || process.env.GOOGLE_GEMINI_API_KEY
        : config.keys.openai || process.env.OPENAI_API_KEY
}

// What the admin UI may see: keys only as "configured / from env", never the values
export function publicView(config: AiConfig) {
    const keyState = (provider: 'gemini' | 'openai') =>
        config.keys[provider] ? 'admin' : (provider === 'gemini' ? process.env.GOOGLE_GEMINI_API_KEY : process.env.OPENAI_API_KEY) ? 'env' : 'none'
    return {
        tasks: config.tasks,
        keys: { gemini: keyState('gemini'), openai: keyState('openai') },
        bridge: { url: config.bridge.url, token: config.bridge.token, lastSeen: config.bridge.lastSeen, info: config.bridge.info },
    }
}
