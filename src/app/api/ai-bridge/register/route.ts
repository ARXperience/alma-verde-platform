import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { getAiConfig, saveBridgeState } from '@/lib/ai/config'

// Heartbeat from the local AI bridge (alma-verde-bridge on the office PC).
// It announces its public tunnel URL and what it has available; authenticated with the bridge token.
export async function POST(request: Request) {
    const config = await getAiConfig(true)
    const sent = Buffer.from(request.headers.get('x-bridge-token') || '')
    const expected = Buffer.from(config.bridge.token || '')
    if (!expected.length || sent.length !== expected.length || !timingSafeEqual(sent, expected)) {
        return NextResponse.json({ error: 'Token del puente inválido' }, { status: 401 })
    }

    const { url, info } = await request.json()
    if (typeof url !== 'string' || !/^https:\/\/[\w.-]+(:\d+)?$/.test(url)) {
        return NextResponse.json({ error: 'URL del puente inválida (debe ser https sin ruta)' }, { status: 400 })
    }

    const safeInfo = typeof info === 'object' && info && JSON.stringify(info).length < 20_000 ? info : {}
    await saveBridgeState({ url, lastSeen: new Date().toISOString(), info: safeInfo })
    return NextResponse.json({ ok: true, tasks: config.tasks })
}
