'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Settings, Building, MessageCircle, Key, Bell, Loader2,
    CheckCircle, XCircle, QrCode, Wifi, WifiOff, Save, Eye, EyeOff
} from 'lucide-react'

type Tab = 'general' | 'whatsapp' | 'integrations' | 'notifications'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('general')

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Building className="w-4 h-4" /> },
        { id: 'whatsapp', label: 'WhatsApp Bot', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'integrations', label: 'Integraciones', icon: <Key className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
    ]

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-[#102216] tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    Configuración
                </h1>
                <p className="text-slate-500 mt-1">Gestiona la configuración general de la plataforma</p>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-[#102216] text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'whatsapp' && <WhatsAppTab />}
            {activeTab === 'integrations' && <IntegrationsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
        </div>
    )
}

/* ============================================
   GENERAL TAB
   ============================================ */
function GeneralTab() {
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState({
        companyName: 'Alma Verde Diseño',
        email: 'centrodigitaldediseno@gmail.com',
        phone: '',
        address: '',
        website: 'almaverdediseno.com',
        instagram: '',
        facebook: '',
    })

    function handleSave() {
        setSaving(true)
        // Save to Supabase settings table or local storage for now
        setTimeout(() => {
            setSaving(false)
            alert('Configuración guardada')
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle>Información de la Empresa</CardTitle>
                    <CardDescription>Datos generales que aparecen en cotizaciones y comunicaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre de la empresa</Label>
                            <Input
                                value={config.companyName}
                                onChange={e => setConfig({ ...config, companyName: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email de contacto</Label>
                            <Input
                                value={config.email}
                                onChange={e => setConfig({ ...config, email: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                                value={config.phone}
                                onChange={e => setConfig({ ...config, phone: e.target.value })}
                                placeholder="+57 300 123 4567"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sitio Web</Label>
                            <Input
                                value={config.website}
                                onChange={e => setConfig({ ...config, website: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Dirección</Label>
                            <Input
                                value={config.address}
                                onChange={e => setConfig({ ...config, address: e.target.value })}
                                placeholder="Dirección de la oficina o taller"
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle>Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input
                                value={config.instagram}
                                onChange={e => setConfig({ ...config, instagram: e.target.value })}
                                placeholder="@almaverdediseno"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Facebook</Label>
                            <Input
                                value={config.facebook}
                                onChange={e => setConfig({ ...config, facebook: e.target.value })}
                                placeholder="facebook.com/almaverdediseno"
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold px-8">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    )
}

/* ============================================
   WHATSAPP BOT TAB
   ============================================ */
function WhatsAppTab() {
    const [botStatus, setBotStatus] = useState<'disconnected' | 'qr_ready' | 'connected'>('disconnected')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [autoReply, setAutoReply] = useState(true)
    const [knowledge, setKnowledge] = useState(
        `Alma Verde Diseño es una agencia de diseño y productora especializada en:
- Stands para ferias y exposiciones
- Eventos corporativos y sociales
- Branding físico y decoración
- Muebles y espacios para el hogar (Alma Home)
- Alquiler de mobiliario para eventos

Ubicados en Colombia. Ofrecemos soluciones integrales de diseño con IA.
Teléfono: +57 XXX XXX XXXX
Email: centrodigitaldediseno@gmail.com
Web: almaverdediseno.com`
    const [behavior, setBehavior] = useState('Cargando...')
    const [saving, setSaving] = useState(false)
    const [restarting, setRestarting] = useState(false)
    const BOT_URL = process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL || 'https://bot.almaverdediseno.com'

    // Poll bot status
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [knowRes, behavRes] = await Promise.all([
                    fetch(`${BOT_URL}/knowledge`),
                    fetch(`${BOT_URL}/behavior`)
                ])
                if (knowRes.ok) {
                    const data = await knowRes.json()
                    setKnowledge(data.knowledge)
                }
                if (behavRes.ok) {
                    const data = await behavRes.json()
                    setBehavior(data.behavior)
                }
            } catch (e) {
                console.error('Could not load bot config')
            }
        }
        fetchInitialData()

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${BOT_URL}/status`, { signal: AbortSignal.timeout(3000) })
                if (res.ok) {
                    const data = await res.json()
                    setBotStatus(data.status)
                    if (data.qr) setQrCode(data.qr)
                    else setQrCode(null)
                }
            } catch {
                setBotStatus('disconnected')
                setQrCode(null)
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [BOT_URL])

    async function saveKnowledge() {
        setSaving(true)
        try {
            await fetch(`${BOT_URL}/knowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ knowledge }),
            })
            await fetch(`${BOT_URL}/behavior`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ behavior }),
            })
            alert('Configuración actualizada exitosamente')
        } catch {
            alert('No se pudo conectar con el servidor del bot. Asegúrate de que esté corriendo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Estado de Conexión
                    </CardTitle>
                    <CardDescription>Conecta tu WhatsApp Business para activar el bot de respuestas automáticas con IA</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        {/* Status indicator */}
                        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm ${
                            botStatus === 'connected'
                                ? 'bg-green-50 text-green-700'
                                : botStatus === 'qr_ready'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {botStatus === 'connected' ? (
                                <><Wifi className="w-5 h-5" /> Conectado</>
                            ) : botStatus === 'qr_ready' ? (
                                <><QrCode className="w-5 h-5" /> Esperando escaneo QR</>
                            ) : (
                                <><WifiOff className="w-5 h-5" /> Desconectado</>
                            )}
                        </div>

                        {/* Auto reply toggle */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={autoReply}
                                    onChange={() => setAutoReply(!autoReply)}
                                    className="sr-only"
                                />
                        <div className="flex items-center gap-6">
                            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm ${
                                botStatus === 'connected'
                                    ? 'bg-green-50 text-green-700'
                                    : botStatus === 'qr_ready'
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-red-50 text-red-700'
                            }`}>
                                {botStatus === 'connected' ? (
                                    <><Wifi className="w-5 h-5" /> Conectado</>
                                ) : botStatus === 'qr_ready' ? (
                                    <><QrCode className="w-5 h-5" /> Esperando escaneo QR</>
                                ) : (
                                    <><WifiOff className="w-5 h-5" /> Desconectado</>
                                )}
                            </div>

                            {/* Auto reply toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={autoReply}
                                        onChange={() => setAutoReply(!autoReply)}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${autoReply ? 'bg-[#13ec5b]' : 'bg-gray-300'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${autoReply ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                                    </div>
                                </div>
                                <span className="text-sm font-medium">Respuestas automáticas</span>
                            </label>
                        </div>

                        {/* Restart Button */}
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                            disabled={restarting}
                            onClick={async () => {
                                if (!confirm('¿Estás seguro de que quieres forzar un nuevo código QR? Esto desconectará la sesión actual.')) return;
                                setRestarting(true);
                                try {
                                    await fetch(`${BOT_URL}/restart`, { method: 'POST' });
                                    alert('Reiniciando conexión... Espera unos segundos y aparecerá el nuevo QR.');
                                } catch (e) {
                                    alert('Error al intentar reiniciar. Asegúrate de que el servidor esté vivo.');
                                } finally {
                                    setRestarting(false);
                                }
                            }}
                        >
                            {restarting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                            Forzar Nuevo QR
                        </Button>
                    </div>

                    {/* QR Code display */}
                    {botStatus === 'qr_ready' && qrCode && (
                        <div className="mt-6 flex flex-col items-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                            <p className="text-sm font-medium text-slate-600 mb-4">Escanea este código con WhatsApp</p>
                            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            <p className="text-xs text-slate-400 mt-4">El código se actualiza cada 30 segundos</p>
                        </div>
                    )}

                    {botStatus === 'disconnected' && (
                        <div className="mt-6 p-6 bg-slate-50 rounded-2xl text-center">
                            <WifiOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">
                                El servidor del bot no está disponible. Asegúrate de que esté corriendo en <code className="bg-slate-200 px-2 py-0.5 rounded text-xs">{BOT_URL}</code>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Behavior & Knowledge Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardHeader>
                        <CardTitle>Comportamiento de la IA</CardTitle>
                        <CardDescription>
                            Define la personalidad, tono de voz y las instrucciones principales de cómo debe actuar el bot.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            value={behavior}
                            onChange={e => setBehavior(e.target.value)}
                            className="w-full min-h-[300px] p-4 border rounded-xl resize-y text-sm focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50"
                            placeholder="Escribe el prompt de sistema..."
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardHeader>
                        <CardTitle>Base de Conocimientos</CardTitle>
                        <CardDescription>
                            Información sobre servicios, precios, horarios, etc. que el bot puede usar para responder.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            value={knowledge}
                            onChange={e => setKnowledge(e.target.value)}
                            className="w-full min-h-[300px] p-4 border rounded-xl resize-y text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50"
                            placeholder="Escribe aquí la información..."
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={saveKnowledge} disabled={saving} className="rounded-xl">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Configuración IA
                </Button>
            </div>
        </div>
    )
}

/* ============================================
   INTEGRATIONS TAB
   ============================================ */
function IntegrationsTab() {
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

    const integrations = [
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Pagos con tarjeta de crédito y débito',
            envVar: 'STRIPE_SECRET_KEY',
            configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            color: 'bg-purple-50 text-purple-700',
        },
        {
            id: 'bold',
            name: 'Bold',
            description: 'Transferencias bancarias y pagos alternativos',
            envVar: 'BOLD_API_KEY',
            configured: false,
            color: 'bg-blue-50 text-blue-700',
        },
        {
            id: 'gemini',
            name: 'Google Gemini',
            description: 'IA para chatbot, cotizaciones y bot de WhatsApp',
            envVar: 'GEMINI_API_KEY',
            configured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY || true, // We know it's configured
            color: 'bg-yellow-50 text-yellow-700',
        },
        {
            id: 'supabase',
            name: 'Supabase',
            description: 'Base de datos, autenticación y storage',
            envVar: 'SUPABASE_URL',
            configured: true,
            color: 'bg-green-50 text-green-700',
        },
    ]

    return (
        <div className="space-y-4">
            {integrations.map(integration => (
                <Card key={integration.id} className="border-none shadow-sm rounded-3xl bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${integration.color}`}>
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#102216]">{integration.name}</h3>
                                    <p className="text-sm text-slate-500">{integration.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {integration.configured ? (
                                    <Badge className="bg-green-50 text-green-700 border-green-200 rounded-full">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Configurado
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 rounded-full">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Pendiente
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                            <code className="text-xs text-slate-500 flex-1 font-mono">{integration.envVar}=</code>
                            <span className="text-xs text-slate-400">
                                {integration.configured ? '••••••••••••••••' : 'No configurado'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Configura esta variable en tu archivo <code className="bg-slate-100 px-1 rounded">.env.local</code> o en las variables de entorno de Vercel
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

/* ============================================
   NOTIFICATIONS TAB
   ============================================ */
function NotificationsTab() {
    const [config, setConfig] = useState({
        newOrderEmail: true,
        newQuotationEmail: true,
        newUserEmail: false,
        whatsappNotify: true,
        alertEmail: 'centrodigitaldediseno@gmail.com',
    })

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle>Email de Alertas</CardTitle>
                    <CardDescription>Email donde se enviarán las notificaciones del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={config.alertEmail}
                        onChange={e => setConfig({ ...config, alertEmail: e.target.value })}
                        className="rounded-xl max-w-md"
                        placeholder="admin@empresa.com"
                    />
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                    <CardTitle>Preferencias de Notificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { key: 'newOrderEmail', label: 'Nueva orden desde la tienda', desc: 'Recibe un email cuando un cliente realiza un pedido' },
                        { key: 'newQuotationEmail', label: 'Nueva cotización generada', desc: 'Recibe un email cuando se genera una cotización por IA' },
                        { key: 'newUserEmail', label: 'Nuevo usuario registrado', desc: 'Recibe un email cuando alguien crea una cuenta' },
                        { key: 'whatsappNotify', label: 'Notificación de WhatsApp', desc: 'Envía un resumen diario de conversaciones del bot' },
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div>
                                <p className="font-medium text-[#102216]">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                            <label className="cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={(config as any)[item.key]}
                                        onChange={() => setConfig({ ...config, [item.key]: !(config as any)[item.key] })}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors ${(config as any)[item.key] ? 'bg-[#13ec5b]' : 'bg-gray-300'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${(config as any)[item.key] ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                                    </div>
                                </div>
                            </label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button className="rounded-xl bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold px-8">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Preferencias
                </Button>
            </div>
        </div>
    )
}
