'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Lightbox } from '@/components/ui/lightbox'
import { Logo } from '@/components/layout/Logo'
import { Sparkles, Send, Loader2, CheckCircle, AlertCircle, Mic, FileText, Image as ImageIcon, Maximize2, Wand2 } from 'lucide-react'
import type { QuotationVariables, PricingBreakdown } from '@/types/quotation'
import { briefExcerpt, projectName } from '@/lib/projects/display'

type Step = 'briefing' | 'processing' | 'review' | 'pricing' | 'complete'

export default function QuotationPage() {
    const router = useRouter()
    const { user } = useAuth()

    const [step, setStep] = useState<Step>('briefing')
    const [briefing, setBriefing] = useState('')
    const [variables, setVariables] = useState<QuotationVariables | null>(null)
    const [pricing, setPricing] = useState<PricingBreakdown | null>(null)
    const [projectId, setProjectId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Renders of the draft project: the client can ask for several versions before confirming
    const [renders, setRenders] = useState<string[]>([])
    const [activeRender, setActiveRender] = useState<string | null>(null)
    const [generatingImage, setGeneratingImage] = useState(false)
    const [imageError, setImageError] = useState('')
    const [variantNote, setVariantNote] = useState('')
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false)
    const [transcribing, setTranscribing] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

    // Refinement state
    const [isRefining, setIsRefining] = useState(false)

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            recorder.ondataavailable = (e: any) => {
                if (e.data.size > 0) chunks.push(e.data)
            }

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' })
                await handleTranscribe(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            setError('Error al acceder al micrófono')
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop()
            setIsRecording(false)
            setMediaRecorder(null)
        }
    }

    async function handleTranscribe(audioBlob: Blob) {
        setTranscribing(true)
        try {
            const formData = new FormData()
            formData.append('file', audioBlob, 'recording.webm')

            const res = await fetch('/api/quotation/transcribe', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Error en la transcripción')

            const { text } = await res.json()
            setBriefing(prev => (prev ? `${prev}\n\n${text}` : text))
        } catch (err: any) {
            setError('Error al transcribir el audio: ' + err.message)
        } finally {
            setTranscribing(false)
        }
    }

    async function handleRefineText() {
        if (!briefing.trim()) return

        setIsRefining(true)
        try {
            const res = await fetch('/api/quotation/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: briefing }),
            })

            if (!res.ok) throw new Error('Error al mejorar el texto')

            const { text } = await res.json()
            setBriefing(text)
        } catch (err: any) {
            console.error('Error refining text:', err)
            setError('Error al mejorar el texto con IA')
        } finally {
            setIsRefining(false)
        }
    }

    async function handleSubmitBriefing() {
        if (!briefing.trim()) {
            setError('Por favor describe tu proyecto')
            return
        }

        setLoading(true)
        setError('')
        setStep('processing')

        try {
            // Extract variables from briefing
            const extractRes = await fetch('/api/quotation/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ briefing }),
            })

            if (!extractRes.ok) throw new Error('Error al procesar el briefing')

            const { variables: extractedVars } = await extractRes.json()
            setVariables(extractedVars)
            setStep('review')
        } catch (err: any) {
            setError(err.message || 'Error al procesar el briefing')
            setStep('briefing')
        } finally {
            setLoading(false)
        }
    }

    async function handleCalculateAndCreateDraft() {
        if (!variables) return

        setLoading(true)
        setError('')

        try {
            // 1. Calculate pricing
            const pricingRes = await fetch('/api/quotation/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variables }),
            })

            if (!pricingRes.ok) throw new Error('Error al calcular la cotización')

            const { pricing: calculatedPricing } = await pricingRes.json()
            setPricing(calculatedPricing)

            // 2. Create Draft Project
            const projectRes = await fetch('/api/quotation/create-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    briefing,
                    variables,
                    pricing: calculatedPricing,
                    description: `Proyecto de ${variables.project_type} - ${variables.square_meters}m²`,
                    status: 'cotizacion'
                }),
            })

            if (!projectRes.ok) throw new Error('Error al preparar el proyecto')
            const { project } = await projectRes.json()
            setProjectId(project.id)

            setStep('pricing') // Move to pricing step immediately

            // 3. First render in the background (the pricing is already visible)
            generateRender(project.id)

        } catch (err: any) {
            setError(err.message || 'Error al procesar la solicitud')
        } finally {
            setLoading(false)
        }
    }

    async function generateRender(pId: string, instructions = '') {
        if (!variables) return
        setGeneratingImage(true)
        setImageError('')
        try {
            const res = await fetch('/api/quotation/generate-image-multi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: pId,
                    projectDetails: { ...variables, description: briefing },
                    instructions,
                }),
            })
            const data = await res.json().catch(() => ({}))
            const url = data.images?.[0]?.url
            if (!res.ok || !url) {
                // 4xx messages are written for the client (limit reached, session expired…)
                throw new Error(res.status < 500 && data.error ? data.error : 'No pudimos generar la imagen en este momento. Intenta de nuevo.')
            }
            setRenders(prev => [...prev, url])
            setActiveRender(url)
            setVariantNote('')
        } catch (err: any) {
            setImageError(err.message)
        } finally {
            setGeneratingImage(false)
        }
    }

    async function handleFinalizeProject() {
        if (!projectId) return

        setLoading(true)
        setError('')
        try {
            // The newest render is the main one by default; keep the version the client picked instead
            if (activeRender && activeRender !== renders[renders.length - 1]) {
                const res = await fetch(`/api/projects/${projectId}/renders`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: activeRender }),
                })
                if (!res.ok) throw new Error('No se pudo guardar la imagen elegida. Intenta de nuevo.')
            }
            setStep('complete')
        } catch (err: any) {
            setError(err?.message || 'Error al finalizar el proyecto. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <CardTitle>Cotizador con IA</CardTitle>
                        <CardDescription>
                            Inicia sesión para cotizar tu proyecto con inteligencia artificial
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="gradient" className="w-full" onClick={() => router.push('/auth/login')}>
                            Iniciar Sesión
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#102216] relative overflow-hidden font-display text-white flex">
            {/* LEFT SIDE: the proposal render once there is one, the brand video before */}
            {activeRender && (step === 'pricing' || step === 'complete') ? (
                <div className="hidden lg:block flex-1 relative overflow-hidden">
                    <img
                        key={activeRender}
                        src={activeRender}
                        alt="Propuesta visual de tu proyecto"
                        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/5 to-[#102216]/40" />
                    <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#102216]/90 to-transparent" />

                    {generatingImage && (
                        <div className="absolute top-8 left-10 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin text-[#13ec5b]" />
                            Diseñando una nueva versión…
                        </div>
                    )}

                    <div className="absolute bottom-10 left-10 right-40 z-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-[#13ec5b]">
                            <Sparkles className="w-3.5 h-3.5" />
                            Propuesta visual · Versión {renders.indexOf(activeRender) + 1} de {renders.length}
                        </span>
                        <h2 className="mt-4 text-4xl xl:text-5xl font-black tracking-tight drop-shadow-lg">
                            {variables ? projectName({ extracted_variables: variables }) : 'Tu proyecto'}
                        </h2>
                        <p className="mt-2 max-w-xl text-white/75 line-clamp-2 drop-shadow">{briefExcerpt(briefing, 180)}</p>
                        <button
                            onClick={() => setLightboxIndex(renders.indexOf(activeRender))}
                            className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-sm font-semibold transition-colors"
                        >
                            <Maximize2 className="w-4 h-4" />
                            Ver en grande
                        </button>
                    </div>
                </div>
            ) : (
            <div className="hidden lg:flex flex-1 relative items-center justify-center">
                {/* Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/alma-verde-video.mp4" type="video/mp4" />
                </video>
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-[#102216]/30" />
                {/* Gradient edge that blends into the right panel */}
                <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#102216]/90 to-transparent z-10" />

                {/* Floating branding on top of video */}
                <div className="relative z-20 text-center px-12">
                    <Logo className="mx-auto mb-8 h-12 w-auto text-white drop-shadow-lg" />
                    {generatingImage ? (
                        <>
                            <h2 className="text-4xl xl:text-5xl font-black tracking-tight mb-4 drop-shadow-lg">
                                Diseñando tu<br />propuesta visual
                            </h2>
                            <p className="text-lg text-white/70 max-w-md mx-auto inline-flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-[#13ec5b]" />
                                La IA está creando el render de tu proyecto…
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl xl:text-5xl font-black tracking-tight mb-4 drop-shadow-lg">
                                Cotiza tu Proyecto<br/>con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec5b] to-[#0a8c35]">IA</span>
                            </h2>
                            <p className="text-lg text-white/70 max-w-md mx-auto">
                                Describe tu proyecto y nuestra inteligencia artificial generará una cotización detallada
                            </p>
                        </>
                    )}
                </div>

                {/* Animated glow */}
                <div className="absolute inset-0 pointer-events-none z-[1]">
                    <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-[#13ec5b]/8 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-[#0a8c35]/15 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-5000" />
                </div>
            </div>
            )}

            {/* RIGHT SIDE: Cotizador Panel */}
            <div className="w-full lg:w-[480px] xl:w-[520px] h-full flex flex-col bg-[#102216]/95 backdrop-blur-xl lg:border-l border-white/5 relative z-20">
                {/* Mobile-only video background */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                        <source src="/alma-verde-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-[#102216]/85" />
                </div>

                {/* Panel Header */}
                <div className="text-center pt-5 pb-2 px-5 flex-shrink-0 relative z-10">
                    <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium mb-2">
                        <Sparkles className="w-3 h-3 text-[#13ec5b]" />
                        <span className="text-[#13ec5b]">Cotizador Inteligente</span>
                    </div>
                    <h1 className="lg:hidden text-xl font-black tracking-tight mb-1">
                        Cotiza tu Proyecto con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec5b] to-[#0a8c35]">IA</span>
                    </h1>
                    
                    {/* Progress Steps - Vertical Compact */}
                    <div className="bg-black/20 px-3 py-2.5 rounded-xl border border-white/5 backdrop-blur-sm mt-2">
                        <div className="flex items-center justify-between">
                            {[
                                { key: 'briefing', label: 'Descripción' },
                                { key: 'review', label: 'Revisión' },
                                { key: 'pricing', label: 'Cotización' },
                                { key: 'complete', label: 'Listo' },
                            ].map((s, index) => (
                                <div key={s.key} className="flex items-center flex-1">
                                    <div className={`flex items-center gap-1 ${step === s.key ? 'text-[#13ec5b]' :
                                        ['review', 'pricing', 'complete'].indexOf(step) > ['review', 'pricing', 'complete'].indexOf(s.key as any) ? 'text-[#0a8c35]' :
                                            'text-slate-500'
                                        }`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${step === s.key ? 'border-[#13ec5b] bg-[#13ec5b]/20 shadow-[0_0_8px_rgba(19,236,91,0.3)]' :
                                            ['review', 'pricing', 'complete'].indexOf(step) > ['review', 'pricing', 'complete'].indexOf(s.key as any) ? 'border-[#0a8c35] bg-[#0a8c35]/20' :
                                                'border-slate-600 bg-transparent'
                                            }`}>
                                            {['review', 'pricing', 'complete'].indexOf(step) > ['review', 'pricing', 'complete'].indexOf(s.key as any) ? (
                                                <CheckCircle className="w-2.5 h-2.5 text-[#13ec5b]" />
                                            ) : (
                                                <span className="text-[10px] font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium hidden sm:block">{s.label}</span>
                                    </div>
                                    {index < 3 && (
                                        <div className={`h-0.5 flex-1 mx-1 transition-colors ${['review', 'pricing', 'complete'].indexOf(step) > index ? 'bg-[#0a8c35]' : 'bg-slate-700'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto px-5 pb-5 relative z-10">
                    <div>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Step 1: Briefing */}
                    {step === 'briefing' && (
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <div className="p-2 bg-[#13ec5b]/20 rounded-lg">
                                        <FileText className="w-5 h-5 text-[#13ec5b]" />
                                    </div>
                                    Describe tu Proyecto
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    Cuéntanos detalladamente sobre tu proyecto. Puedes escribir o usar el micrófono para hablar con la IA.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Textarea
                                    placeholder="Ejemplo: Necesito un stand de 50m² para una feria tecnológica en Corferias, Bogotá..."
                                    value={briefing}
                                    onChange={(e) => setBriefing(e.target.value)}
                                    rows={8}
                                    className="resize-none bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] rounded-2xl p-4 text-base"
                                />

                                <div className="flex flex-wrap gap-4">

                                    {/* Refinement Button */}
                                    <Button
                                        variant="outline"
                                        onClick={handleRefineText}
                                        disabled={loading || isRefining || !briefing.trim()}
                                        className="flex-none bg-black/30 border-white/10 hover:bg-white/10 hover:text-white rounded-xl h-12"
                                    >
                                        {isRefining ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Mejorando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2 text-[#13ec5b]" />
                                                Mejorar con IA
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant={isRecording ? "destructive" : "outline"}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={loading || transcribing || isRefining}
                                        className={`flex-none rounded-xl h-12 ${!isRecording && 'bg-black/30 border-white/10 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <span className="animate-pulse mr-2 text-white">●</span>
                                                Detener Grabación
                                            </>
                                        ) : transcribing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                                                Transcribiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-4 h-4 mr-2 text-[#13ec5b]" />
                                                Grabar Audio
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleSubmitBriefing}
                                        disabled={loading || isRefining || !briefing.trim()}
                                        className="flex-1 min-w-[200px] h-12 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(19,236,91,0.2)] hover:scale-[1.02]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Generar Cotización
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-400 text-center mt-2">
                                    💡 Tip: La IA extraerá automáticamente métricas, materiales y ubicación
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Processing */}
                    {step === 'processing' && (
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white">
                            <CardContent className="py-12 text-center">
                                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#13ec5b]" />
                                <h3 className="text-xl font-bold mb-2">Analizando tu Proyecto</h3>
                                <p className="text-slate-300">
                                    Nuestra IA está extrayendo las variables clave...
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Review Variables */}
                    {step === 'review' && variables && (
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white">
                            <CardHeader className="border-b border-white/10 pb-6">
                                <CardTitle className="text-2xl font-bold">Revisa los Detalles del Proyecto</CardTitle>
                                <CardDescription className="text-slate-300">
                                    Verifica que la información extraída sea correcta antes de cotizar
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <label className="text-sm font-medium text-slate-400">Tipo de Proyecto</label>
                                        <p className="text-lg font-bold capitalize text-white">{variables.project_type}</p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <label className="text-sm font-medium text-slate-400">Metros Cuadrados</label>
                                        <p className="text-lg font-bold text-white">{variables.square_meters || 'No especificado'} m²</p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <label className="text-sm font-medium text-slate-400">Ubicación</label>
                                        <p className="text-lg font-bold text-white">{variables.location}</p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <label className="text-sm font-medium text-slate-400">Tiempo de Producción</label>
                                        <p className="text-lg font-bold text-white">{variables.production_time} días</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <label className="text-sm font-medium text-slate-400 mb-2 block">Materiales Detectados</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {variables.materials.map((material, i) => (
                                            <Badge key={i} className="bg-[#13ec5b]/10 text-[#13ec5b] border-[#13ec5b]/30 rounded-lg py-1 px-3">
                                                {material}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={() => setStep('briefing')} className="bg-black/30 border-white/10 hover:bg-white/10 hover:text-white rounded-xl h-12 px-8">
                                        Modificar
                                    </Button>
                                    <Button onClick={handleCalculateAndCreateDraft} disabled={loading} className="flex-1 h-12 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(19,236,91,0.2)] hover:scale-[1.02]">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Calculando y Diseñando...
                                            </>
                                        ) : (
                                            'Confirmar y Calcular Cotización'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Pricing & Render Preview */}
                    {step === 'pricing' && pricing && (
                        <div className="space-y-6">
                            {/* Visual proposal: several versions, pick one, expand it */}
                            <Card className="bg-white/5 backdrop-blur-xl border border-[#13ec5b]/30 shadow-[0_0_30px_rgba(19,236,91,0.1)] rounded-3xl overflow-hidden text-white">
                                <CardContent className="p-0">
                                    {/* On large screens the chosen render fills the left side instead */}
                                    <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden lg:hidden">
                                        {activeRender ? (
                                            <button className="group block w-full h-full" onClick={() => setLightboxIndex(renders.indexOf(activeRender))}>
                                                <img
                                                    key={activeRender}
                                                    src={activeRender}
                                                    alt="Propuesta visual de tu proyecto"
                                                    className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                                                    <Maximize2 className="w-3.5 h-3.5" /> Ampliar
                                                </span>
                                            </button>
                                        ) : generatingImage ? (
                                            <div className="text-center p-8">
                                                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-[#13ec5b]" />
                                                <h3 className="font-bold text-lg animate-pulse">Generando tu propuesta visual…</h3>
                                                <p className="text-[#13ec5b] text-sm mt-1">Diseñando tu {variables?.project_type} con IA</p>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6 text-slate-400">
                                                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Aún no hay imagen</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-[#13ec5b]" />
                                                Propuesta visual
                                            </p>
                                            {renders.length > 0 && (
                                                <span className="text-xs text-slate-400">
                                                    {renders.length} {renders.length === 1 ? 'versión' : 'versiones'} · elige tu favorita
                                                </span>
                                            )}
                                        </div>

                                        {(renders.length > 0 || generatingImage) && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {renders.map((url, i) => (
                                                    <button
                                                        key={url}
                                                        onClick={() => setActiveRender(url)}
                                                        aria-label={`Ver versión ${i + 1}`}
                                                        className={`relative aspect-video rounded-lg overflow-hidden ring-2 transition-all ${url === activeRender ? 'ring-[#13ec5b] shadow-[0_0_12px_rgba(19,236,91,0.35)]' : 'ring-white/10 opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <span className="absolute bottom-0.5 left-1 text-[10px] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">V{i + 1}</span>
                                                    </button>
                                                ))}
                                                {generatingImage && (
                                                    <div className="aspect-video rounded-lg border border-dashed border-[#13ec5b]/50 bg-[#13ec5b]/5 grid place-items-center">
                                                        <Loader2 className="w-4 h-4 animate-spin text-[#13ec5b]" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {imageError && (
                                            <p className="flex items-start gap-2 text-sm text-red-300">
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                {imageError}
                                            </p>
                                        )}

                                        <form
                                            className="flex gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                if (projectId) generateRender(projectId, variantNote)
                                            }}
                                        >
                                            <Input
                                                value={variantNote}
                                                onChange={(e) => setVariantNote(e.target.value)}
                                                placeholder="¿Algún cambio? Ej: más madera, luz cálida…"
                                                disabled={generatingImage}
                                                className="h-11 rounded-xl bg-black/30 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#13ec5b] focus-visible:ring-offset-0"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={generatingImage || !projectId}
                                                className="h-11 flex-none rounded-xl bg-white/10 hover:bg-[#13ec5b] hover:text-[#102216] text-white font-semibold transition-colors"
                                            >
                                                {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
                                                {!generatingImage && (renders.length ? 'Otra versión' : 'Generar')}
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white">
                                <CardHeader className="border-b border-white/10 pb-6">
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <CheckCircle className="w-6 h-6 text-[#13ec5b]" />
                                        Cotización Generada
                                    </CardTitle>
                                    <CardDescription className="text-slate-300">
                                        Este es el estimado para tu proyecto
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-3 bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-slate-300">Costo Base</span>
                                            <span className="font-bold">{formatCurrency(pricing.base_cost)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/10">
                                            <span className="text-slate-300">Materiales</span>
                                            <span className="font-bold">{formatCurrency(pricing.materials_cost)}</span>
                                        </div>
                                        {/* Optional costs */}
                                        {pricing.transport_cost > 0 && (
                                            <div className="flex justify-between py-2 border-b border-white/10">
                                                <span className="text-slate-300">Transporte</span>
                                                <span className="font-bold">{formatCurrency(pricing.transport_cost)}</span>
                                            </div>
                                        )}
                                        {pricing.installation_cost > 0 && (
                                            <div className="flex justify-between py-2 border-b border-white/10">
                                                <span className="text-slate-300">Instalación</span>
                                                <span className="font-bold">{formatCurrency(pricing.installation_cost)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between py-4 mt-2 text-2xl font-black">
                                            <span>Total Estimado</span>
                                            <span className="text-[#13ec5b] drop-shadow-[0_0_10px_rgba(19,236,91,0.5)]">{formatCurrency(pricing.total)}</span>
                                        </div>
                                    </div>

                                    <Button onClick={handleFinalizeProject} disabled={loading} className="w-full text-lg h-14 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-black rounded-xl transition-all shadow-[0_0_20px_rgba(19,236,91,0.2)] hover:scale-[1.02]">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                                Confirmando...
                                            </>
                                        ) : (
                                            'Confirmar y Guardar Proyecto'
                                        )}
                                    </Button>
                                    <p className="text-sm text-center text-slate-400">
                                        Al confirmar, un asesor revisará tu proyecto.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === 'complete' && (
                        <Card className="bg-white/5 backdrop-blur-xl border-[#13ec5b]/30 shadow-[0_0_40px_rgba(19,236,91,0.15)] rounded-3xl overflow-hidden text-white relative">
                            {/* Success background glow */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#13ec5b]/5 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
                            
                            <CardContent className="py-16 text-center relative z-10">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#13ec5b] to-[#0a8c35] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(19,236,91,0.4)]">
                                    <CheckCircle className="w-12 h-12 text-[#102216]" />
                                </div>
                                <h3 className="text-4xl font-black mb-4 tracking-tight">¡Solicitud Exitosa!</h3>
                                <p className="text-xl text-slate-300 mb-10 max-w-md mx-auto">
                                    Tu proyecto ha sido guardado correctamente. Puedes verlo en tu panel principal.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="h-12 px-8 rounded-xl bg-black/30 border-white/10 hover:bg-white/10 hover:text-white">
                                        Mis proyectos
                                    </Button>
                                    <Button onClick={() => router.push(`/projects/${projectId}`)} className="h-12 px-8 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold rounded-xl shadow-[0_0_15px_rgba(19,236,91,0.3)]">
                                        Ver mi propuesta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                </div>
            </div>

            <Lightbox images={renders} index={lightboxIndex} onChange={setLightboxIndex} alt="Propuesta visual de tu proyecto" downloadable />
        </div>
    )
}
