'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Wifi, WifiOff, Copy, RefreshCw, FlaskConical, CheckCircle, XCircle, Cpu } from 'lucide-react'
import { TASKS, type AiProvider, type AiTask, type AiTaskConfig } from '@/lib/ai/tasks'

type KeyState = 'admin' | 'env' | 'none'
interface Bridge { url?: string; token?: string; lastSeen?: string; info?: { lmstudio?: { online?: boolean; models?: string[] }; comfy?: { online?: boolean; workflows?: string[] } } }
interface View { tasks: Record<AiTask, AiTaskConfig>; keys: Record<'gemini' | 'openai', KeyState>; bridge: Bridge }
interface TestResult { ok: boolean; ms?: number; reply?: string; preview?: string; error?: string }

const PROVIDERS: Record<AiProvider, string> = {
    gemini: 'Gemini (Google)',
    openai: 'ChatGPT (OpenAI)',
    local: 'Mi PC (LM Studio / ComfyUI)',
    pollinations: 'Pollinations (gratis)',
}

// Model suggestions per provider; the field accepts any model id
function suggestions(provider: AiProvider, task: AiTask, bridge: Bridge): string[] {
    if (provider === 'local') {
        return task === 'image'
            ? bridge.info?.comfy?.workflows ?? ['z-image-turbo', 'qwen-image']
            : bridge.info?.lmstudio?.models ?? ['kimi-vl-a3b-thinking-2506']
    }
    if (provider === 'pollinations') return ['flux', 'turbo']
    if (provider === 'gemini') {
        if (task === 'image') return ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-2.5-flash-image']
        if (task === 'reasoning') return ['gemini-3.1-pro-preview', 'gemini-pro-latest', 'gemini-3.5-flash']
        return ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite']
    }
    if (task === 'transcribe') return ['gpt-4o-mini-transcribe', 'whisper-1']
    if (task === 'image') return ['gpt-image-1', 'dall-e-3']
    if (task === 'reasoning') return ['o4-mini', 'gpt-5', 'gpt-5-mini']
    return ['gpt-5-mini', 'gpt-4o-mini', 'gpt-5']
}

const isOnline = (bridge: Bridge) => !!bridge.lastSeen && Date.now() - new Date(bridge.lastSeen).getTime() < 3 * 60_000

export function AiEngineTab() {
    const [view, setView] = useState<View | null>(null)
    const [tasks, setTasks] = useState<Record<AiTask, AiTaskConfig> | null>(null)
    const [newKeys, setNewKeys] = useState({ gemini: '', openai: '' })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [testing, setTesting] = useState<AiTask | null>(null)
    const [results, setResults] = useState<Partial<Record<AiTask, TestResult>>>({})

    async function load(bridgeOnly = false) {
        const res = await fetch('/api/admin/ai-config')
        const data = await res.json()
        if (!res.ok) return setError(data.error || 'No se pudo cargar la configuración')
        setView(data)
        if (!bridgeOnly) setTasks(data.tasks)
    }

    useEffect(() => {
        load()
        // Keep the bridge status fresh without overwriting edits in progress
        const timer = setInterval(() => load(true), 30_000)
        return () => clearInterval(timer)
    }, [])

    async function save(extra: Record<string, unknown> = {}) {
        setSaving(true)
        setError('')
        try {
            const res = await fetch('/api/admin/ai-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks, keys: newKeys, ...extra }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setView(data)
            setTasks(data.tasks)
            setNewKeys({ gemini: '', openai: '' })
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    async function test(task: AiTask) {
        setTesting(task)
        setResults(prev => ({ ...prev, [task]: undefined }))
        try {
            const res = await fetch('/api/admin/ai-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task }),
            })
            const data: TestResult = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }))
            setResults(prev => ({ ...prev, [task]: res.ok ? data : { ok: false, error: data.error || `HTTP ${res.status}` } }))
        } finally {
            setTesting(null)
        }
    }

    function setTask(task: AiTask, patch: Partial<AiTaskConfig>) {
        setTasks(prev => prev && { ...prev, [task]: { ...prev[task], ...patch } })
    }

    if (error && !view) {
        return <Card className="border-none shadow-sm rounded-3xl bg-white"><CardContent className="p-8 text-red-600">{error}</CardContent></Card>
    }
    if (!view || !tasks) {
        return <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    const bridge = view.bridge
    const online = isOnline(bridge)
    const dirty = JSON.stringify(tasks) !== JSON.stringify(view.tasks) || newKeys.gemini || newKeys.openai

    return (
        <div className="space-y-6">
            {/* Engine per task */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5" /> Motor de IA por función</CardTitle>
                    <CardDescription>
                        Elige qué IA usa cada paso de la cotización en /cotizar. Si el proveedor elegido falla
                        (por ejemplo, el PC está apagado), se usa automáticamente Gemini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100">
                    {TASKS.map(task => {
                        const current = tasks[task.id]
                        const result = results[task.id]
                        return (
                            <div key={task.id} className="py-5 first:pt-0">
                                <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto] md:items-center">
                                    <div>
                                        <p className="font-bold text-[#102216]">{task.label}</p>
                                        <p className="text-sm text-slate-500">{task.description}</p>
                                    </div>
                                    <select
                                        value={current.provider}
                                        onChange={e => {
                                            const provider = e.target.value as AiProvider
                                            setTask(task.id, { provider, model: suggestions(provider, task.id, bridge)[0] })
                                        }}
                                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
                                    >
                                        {task.providers.map(p => <option key={p} value={p}>{PROVIDERS[p]}</option>)}
                                    </select>
                                    <Input
                                        list={`models-${task.id}`}
                                        value={current.model}
                                        onChange={e => setTask(task.id, { model: e.target.value })}
                                        className="h-10 rounded-xl bg-slate-50 font-mono text-xs"
                                    />
                                    <datalist id={`models-${task.id}`}>
                                        {suggestions(current.provider, task.id, bridge).map(m => <option key={m} value={m} />)}
                                    </datalist>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!!testing || task.id === 'transcribe' || JSON.stringify(current) !== JSON.stringify(view.tasks[task.id])}
                                        title={task.id === 'transcribe' ? 'Prueba grabando un audio en /cotizar' : 'Guarda los cambios antes de probar'}
                                        onClick={() => test(task.id)}
                                        className="rounded-xl"
                                    >
                                        {testing === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                                        <span className="ml-1">Probar</span>
                                    </Button>
                                </div>
                                {current.provider === 'local' && !online && (
                                    <p className="mt-2 text-xs text-amber-600">El puente de tu PC está desconectado: mientras tanto se usará el proveedor por defecto.</p>
                                )}
                                {result && (
                                    <div className={`mt-3 rounded-xl p-3 text-sm ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                                        <p className="flex items-center gap-2 font-medium">
                                            {result.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            {result.ok ? `Funciona (${((result.ms || 0) / 1000).toFixed(1)} s)` : 'Falló'}
                                        </p>
                                        {result.reply && <p className="mt-1">{result.reply}</p>}
                                        {result.error && <p className="mt-1 break-words">{result.error}</p>}
                                        {result.preview && <img src={result.preview} alt="Prueba de imagen" className="mt-2 max-h-48 rounded-lg" />}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* API keys */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle>API keys</CardTitle>
                    <CardDescription>Se guardan en un almacenamiento privado del servidor y nunca se vuelven a mostrar. Si no pones una, se usa la del servidor (variables de entorno).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(['gemini', 'openai'] as const).map(provider => (
                        <div key={provider} className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-center">
                            <div>
                                <p className="font-bold text-[#102216]">{provider === 'gemini' ? 'Gemini' : 'OpenAI'}</p>
                                <Badge variant="outline" className={view.keys[provider] === 'none' ? 'border-red-200 text-red-600' : 'border-green-200 text-green-700'}>
                                    {view.keys[provider] === 'admin' ? 'Configurada aquí' : view.keys[provider] === 'env' ? 'Del servidor' : 'Sin configurar'}
                                </Badge>
                            </div>
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder={provider === 'gemini' ? 'AIza…' : 'sk-…'}
                                value={newKeys[provider]}
                                onChange={e => setNewKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                                className="h-10 rounded-xl bg-slate-50 font-mono"
                            />
                            {view.keys[provider] === 'admin' && (
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => save({ keys: { [provider]: null } })}>
                                    Quitar
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Local bridge */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {online ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-slate-400" />}
                        Puente con mi PC
                        <Badge className={online ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>{online ? 'Conectado' : 'Desconectado'}</Badge>
                    </CardTitle>
                    <CardDescription>
                        Ejecuta <code className="rounded bg-slate-100 px-1">iniciar-puente-ia.cmd</code> en el PC con LM Studio y ComfyUI.
                        El puente se conecta solo y avisa aquí su dirección.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {bridge.url && (
                        <div className="grid gap-2 md:grid-cols-2">
                            <p><span className="text-slate-500">Dirección:</span> <span className="font-mono text-xs">{bridge.url}</span></p>
                            <p><span className="text-slate-500">Última señal:</span> {bridge.lastSeen ? new Date(bridge.lastSeen).toLocaleString('es-CO') : '—'}</p>
                            <p><span className="text-slate-500">LM Studio:</span> {bridge.info?.lmstudio?.online ? `en línea · ${bridge.info.lmstudio.models?.join(', ') || 'sin modelos cargados'}` : 'apagado'}</p>
                            <p><span className="text-slate-500">ComfyUI:</span> {bridge.info?.comfy?.online ? `en línea · ${bridge.info.comfy.workflows?.join(', ')}` : 'apagado'}</p>
                        </div>
                    )}
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="mb-2 font-bold text-[#102216]">Token del puente</p>
                        <p className="mb-3 text-slate-500">Va en el archivo <code>.env</code> del puente como <code>BRIDGE_TOKEN</code>. Si lo regeneras, actualízalo allá.</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <code className="flex-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs">{bridge.token || 'Se genera al guardar'}</code>
                            {bridge.token && (
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigator.clipboard.writeText(bridge.token!)}>
                                    <Copy className="w-4 h-4 mr-1" /> Copiar
                                </Button>
                            )}
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                                if (window.confirm('El puente actual quedará desconectado hasta que actualices su .env. ¿Regenerar el token?')) save({ regenerateToken: true })
                            }}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Regenerar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
                <Button
                    onClick={() => save()}
                    disabled={saving || !dirty}
                    className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-black rounded-xl h-12 px-8"
                >
                    {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {saved ? 'Guardado' : 'Guardar cambios'}
                </Button>
            </div>
        </div>
    )
}
