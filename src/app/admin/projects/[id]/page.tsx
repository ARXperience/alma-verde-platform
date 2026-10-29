'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Save, Download, MessageSquare, Paperclip, Image as ImageIcon, Trash2, Upload, Send, FileText, Globe, Star, X, Plus, Sparkles, DollarSign, Mail, Phone, ExternalLink, Maximize2, Wand2, StickyNote } from 'lucide-react'
import { Lightbox } from '@/components/ui/lightbox'
import { StatusBadge } from '@/components/admin/ui'
import { PROJECT_STEPS, projectName, timeAgo } from '@/lib/projects/display'

// Interfaces
interface ProjectFile {
    id: string
    file_name: string
    file_url: string
    file_type: string
    file_size: number
    created_at: string
}

interface Note {
    id: string
    message: string
    created_at: string
    author: { full_name: string | null; email: string } | null
}

// Portfolio interfaces
interface PortfolioItem {
    id?: string
    project_id?: string
    title: string
    description: string
    featured_image_url: string
    gallery_images: string[]
    tags: string[]
    is_featured: boolean
    display_order: number
    published_at: string | null
}

const PORTFOLIO_CATEGORIES = ['Stands', 'Activaciones', 'Mobiliario', 'Producción gráfica']

export default function AdminProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const [project, setProject] = useState<any>(null)
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [messages, setMessages] = useState<Note[]>([])
    const [renderNote, setRenderNote] = useState('')
    const [generating, setGenerating] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    // Loading states
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [sending, setSending] = useState(false)

    // Form states
    const [status, setStatus] = useState('')
    const [newMessage, setNewMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Portfolio states
    const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null)
    const [portfolioTitle, setPortfolioTitle] = useState('')
    const [portfolioDescription, setPortfolioDescription] = useState('')
    const [portfolioCategory, setPortfolioCategory] = useState('Stands')
    const [portfolioImages, setPortfolioImages] = useState<string[]>([])
    const [portfolioFeaturedImage, setPortfolioFeaturedImage] = useState('')
    const [portfolioPublished, setPortfolioPublished] = useState(false)
    const [portfolioFeatured, setPortfolioFeatured] = useState(false)
    const [portfolioSaving, setPortfolioSaving] = useState(false)
    const [portfolioUploading, setPortfolioUploading] = useState(false)
    const portfolioFileRef = useRef<HTMLInputElement>(null)

    const router = useRouter()
    const { id } = use(params)

    useEffect(() => {
        fetchProjectDetails()
        fetchPortfolioData()
        fetch(`/api/projects/${id}/notes`).then(res => res.ok ? res.json() : { notes: [] }).then(data => setMessages(data.notes || []))
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    async function fetchPortfolioData() {
        try {
            const res = await fetch(`/api/portfolio/by-project/${id}`)
            const { data } = await res.json()
            if (data) {
                setPortfolioItem(data)
                setPortfolioTitle(data.title || '')
                setPortfolioDescription(data.description || '')
                setPortfolioCategory(data.tags?.[0] || 'Stands')
                setPortfolioImages(data.gallery_images || [])
                setPortfolioFeaturedImage(data.featured_image_url || '')
                setPortfolioPublished(!!data.published_at)
                setPortfolioFeatured(data.is_featured || false)
            }
        } catch (err) {
            console.error('Error fetching portfolio data:', err)
        }
    }

    async function handlePortfolioSave() {
        try {
            setPortfolioSaving(true)

            const payload = {
                project_id: id,
                title: portfolioTitle || project?.title || 'Sin título',
                description: portfolioDescription,
                featured_image_url: portfolioFeaturedImage || portfolioImages[0] || '',
                gallery_images: portfolioImages,
                tags: [portfolioCategory],
                is_featured: portfolioFeatured,
                display_order: 0,
                published_at: portfolioPublished ? new Date().toISOString() : null
            }

            let res: Response
            if (portfolioItem?.id) {
                // Update existing
                res = await fetch(`/api/portfolio/${portfolioItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                // Create new
                res = await fetch('/api/portfolio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Error guardando portafolio')
            }

            const { data } = await res.json()
            setPortfolioItem(data)
            alert('Portafolio guardado exitosamente')
        } catch (err: any) {
            console.error('Error saving portfolio:', err)
            alert(err.message || 'Error al guardar portafolio')
        } finally {
            setPortfolioSaving(false)
        }
    }

    async function handlePortfolioImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = event.target.files
        if (!selectedFiles || selectedFiles.length === 0) return

        setPortfolioUploading(true)

        try {
            const newImages: string[] = []
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('bucket', 'project-files')
                formData.append('folder', `portfolio/${id}`)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json()
                    throw new Error(errorData.error || 'Error subiendo imagen')
                }

                const { url } = await uploadRes.json()
                newImages.push(url)
            }

            setPortfolioImages(prev => [...prev, ...newImages])
            if (!portfolioFeaturedImage && newImages.length > 0) {
                setPortfolioFeaturedImage(newImages[0])
            }
        } catch (err: any) {
            console.error('Error uploading portfolio images:', err)
            alert(err.message || 'Error al subir imágenes')
        } finally {
            setPortfolioUploading(false)
            if (portfolioFileRef.current) portfolioFileRef.current.value = ''
        }
    }

    function handleRemovePortfolioImage(url: string) {
        setPortfolioImages(prev => prev.filter(img => img !== url))
        if (portfolioFeaturedImage === url) {
            const remaining = portfolioImages.filter(img => img !== url)
            setPortfolioFeaturedImage(remaining[0] || '')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    async function fetchProjectDetails() {
        try {
            setLoading(true)
            console.log('Fetching project with ID:', id)

            const { data: rawData, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    user:users!projects_client_id_fkey(*),
                    files:project_files(*),
                    renders:project_renders(*)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            const data = rawData as any
            data.renders?.sort((a: any, b: any) => (a.version || 0) - (b.version || 0))

            setProject(data)
            setStatus(data.status)
            setFiles(data.files || [])
        } catch (error: any) {
            if (error?.message?.includes('AbortError') || error?.name === 'AbortError') return
            console.error('Error fetching project:', JSON.stringify(error, null, 2))
            if (error) console.error('Full Error Object:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusUpdate() {
        try {
            setUpdating(true)
            const { error } = await (supabase
                .from('projects') as any)
                .update({ status })
                .eq('id', id)

            if (error) throw error

            // Log this action as a message? Optional
            fetchProjectDetails()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar estado')
        } finally {
            setUpdating(false)
        }
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = event.target.files?.[0]
            if (!file) return

            setUploading(true)

            // 1. Upload to Supabase Storage
            // 1. Upload to Supabase Storage via API (RLS Bypass)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'project-files')
            formData.append('path', `${id}/${Date.now()}-${file.name}`)

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json()
                throw new Error(errorData.error || 'Error uploading file')
            }

            const { path: filePath } = await uploadRes.json()

            // 2. Get Public URL (if public) or Signed URL
            // Assuming bucket is private as per setup guide, we might need signed URL for view
            // BUT for simplicity in generic file listing, we'll store the path or a signed url.
            // If the bucket is 'project-files' and SetUp says 'Public: No', we need `createSignedUrl`.
            // However, to store a permanent link in DB, we typically use the path and generate signed urls on demand, 
            // OR we make the bucket public for read access.
            // For now, let's assume we can get a signed URL valid for a long time or just store the path and generate it on render?
            // To keep it simple, let's store the path and we'll generate the download link on click? 
            // Or better, change bucket to public for easier access? 
            // Let's assume we just want to download it. 

            // Insert into DB via API (RLS Bypass)
            const dbRes = await fetch('/api/projects/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: id,
                    file_name: file.name, // Changed key to file_name
                    url: filePath,
                    type: file.type,
                    size: file.size
                })
            })

            if (!dbRes.ok) {
                const errorData = await dbRes.json()
                throw new Error(errorData.error || 'Error saving file info')
            }

            const { data: fileData } = await dbRes.json()

            setFiles([...files, fileData])
            if (fileInputRef.current) fileInputRef.current.value = ''

        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error al subir archivo')
        } finally {
            setUploading(false)
        }
    }

    async function handleDownloadFile(file: ProjectFile) {
        try {
            const { data, error } = await supabase.storage
                .from('project-files')
                .createSignedUrl(file.file_url, 60 * 60) // 1 hour

            if (error) throw error
            window.open(data.signedUrl, '_blank')
        } catch (error) {
            console.error('Error downloading file:', error)
            alert('Error al descargar archivo')
        }
    }

    async function handleDeleteFile(fileId: string, filePath: string) {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return

        try {
            // Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('project-files')
                .remove([filePath])

            if (storageError) console.error('Storage delete error', storageError) // Continue to delete from DB anyway

            // Delete from DB
            const { error: dbError } = await supabase
                .from('project_files')
                .delete()
                .eq('id', fileId)

            if (dbError) throw dbError

            setFiles(files.filter(f => f.id !== fileId))
        } catch (error) {
            console.error('Error deleting file:', error)
            alert('Error al eliminar archivo')
        }
    }

    async function handleSetMainRender(imageUrl: string) {
        try {
            setUpdating(true)
            // Same route as the client area: updates is_selected and the cover in metadata
            const res = await fetch(`/api/projects/${id}/renders`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            })
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error)
            await fetchProjectDetails()
        } catch (error) {
            console.error('Error updating main render:', error)
            alert('Error al actualizar render principal')
        } finally {
            setUpdating(false)
        }
    }

    async function handleDeleteRender(renderId: string) {
        if (!confirm('¿Eliminar este render Permanentemente?')) return

        try {
            setUpdating(true)
            const { error } = await supabase
                .from('project_renders')
                .delete()
                .eq('id', renderId)

            if (error) throw error

            fetchProjectDetails()
        } catch (error) {
            console.error('Error deleting render:', error)
            alert('Error al eliminar render')
        } finally {
            setUpdating(false)
        }
    }

    async function handleRegenerate() {
        try {
            setGenerating(true)
            const response = await fetch('/api/quotation/generate-image-multi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: id,
                    projectDetails: { project_type: project.project_type, ...project.extracted_variables, description: project.briefing || project.description },
                    instructions: renderNote,
                }),
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.details || errorData.error || 'Error al generar la imagen')
            }
            await fetchProjectDetails()
            setRenderNote('')
        } catch (error: any) {
            console.error('Error regenerating image:', error)
            alert(error.message || 'Error al generar la imagen')
        } finally {
            setGenerating(false)
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim()) return
        try {
            setSending(true)
            const res = await fetch(`/api/projects/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setMessages(notes => [...notes, data.note])
            setNewMessage('')
        } catch (error: any) {
            console.error('Error saving note:', error)
            alert(error.message || 'No se pudo guardar la nota')
        } finally {
            setSending(false)
        }
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) return <div className="p-8 text-slate-500">Proyecto no encontrado</div>

    const renderUrls: string[] = (project.renders || []).map((r: any) => r.image_url)
    const cover: string | undefined = project.metadata?.render_image || project.renders?.find((r: any) => r.is_selected)?.image_url || renderUrls[renderUrls.length - 1]
    const stepIndex = PROJECT_STEPS.findIndex(s => s.id === project.status)
    const phone = String(project.user?.phone || '').replace(/\D/g, '')

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <button onClick={() => router.push('/admin/projects')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#0a8c35]">
                <ArrowLeft className="h-4 w-4" /> Proyectos
            </button>

            {/* Hero: the main render is the proposal's face */}
            <section className="relative overflow-hidden rounded-3xl bg-[#102216] text-white shadow-sm">
                {cover && (
                    <button onClick={() => setLightboxIndex(Math.max(renderUrls.indexOf(cover), 0))} className="absolute inset-0 cursor-zoom-in" aria-label="Ver render en grande">
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                    </button>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/60 to-[#102216]/5" />
                <div className="pointer-events-none relative flex min-h-[320px] flex-col justify-end gap-6 p-6 md:min-h-[380px] md:flex-row md:items-end md:justify-between md:p-8">
                    <div className="pointer-events-auto max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={project.status} />
                            {project.project_number && <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs backdrop-blur">{project.project_number}</span>}
                            {project.metadata?.ai_generated && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#13ec5b]/20 px-2.5 py-1 text-xs font-bold text-[#13ec5b] backdrop-blur">
                                    <Sparkles className="h-3 w-3" /> Cotizador IA
                                </span>
                            )}
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight drop-shadow md:text-5xl">{projectName(project)}</h1>
                        <p className="mt-2 text-white/70">
                            {project.user?.full_name || project.user?.email || 'Sin cliente'} · creado {timeAgo(project.created_at)}
                        </p>
                    </div>
                    <div className="pointer-events-auto flex flex-col gap-3 md:items-end">
                        <p className="text-3xl font-black text-[#13ec5b] drop-shadow md:text-4xl">{formatCurrency(project.estimated_cost || 0)}</p>
                        <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-10 w-[190px] rounded-xl border-0 bg-white text-[#102216] focus:ring-[#13ec5b]">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {[...PROJECT_STEPS, { id: 'cancelado', label: 'Cancelado' }].map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleStatusUpdate} disabled={updating || status === project.status} className="h-10 rounded-xl bg-[#13ec5b] px-4 font-bold text-[#102216] hover:bg-[#13ec5b]/90" title="Guardar estado">
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {project.status !== 'cancelado' && (
                <ol className="mt-4 grid grid-cols-3 gap-1 rounded-3xl bg-white p-2 shadow-sm md:grid-cols-6">
                    {PROJECT_STEPS.map((s, i) => (
                        <li key={s.id} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold md:text-sm ${i === stepIndex ? 'bg-[#102216] text-white' : i < stepIndex ? 'text-[#0a8c35]' : 'text-slate-400'}`}>
                            <span className={`h-2 w-2 flex-none rounded-full ${i <= stepIndex ? s.dot : 'bg-slate-200'}`} /> {s.label}
                        </li>
                    ))}
                </ol>
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Briefing del Cliente */}
                    {project.briefing && (
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="pb-4 pt-6 px-8 border-b border-slate-100">
                                <CardTitle className="text-xl font-bold text-[#102216] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#13ec5b]" />
                                    Requerimientos del Cliente
                                </CardTitle>
                                <CardDescription className="text-slate-500">Texto original enviado por el usuario al cotizador IA</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{project.briefing}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Variables Extraídas por IA */}
                    {project.extracted_variables && Object.keys(project.extracted_variables).length > 0 && (
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="pb-4 pt-6 px-8 border-b border-slate-100">
                                <CardTitle className="text-xl font-bold text-[#102216] flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#13ec5b]" />
                                    Configuración del Proyecto
                                </CardTitle>
                                <CardDescription className="text-slate-500">Variables detectadas y confirmadas por el usuario durante la cotización</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(() => {
                                        const vars = project.extracted_variables;
                                        const labelMap: Record<string, string> = {
                                            project_type: 'Tipo de Proyecto',
                                            square_meters: 'Área (m²)',
                                            location: 'Ubicación',
                                            materials: 'Materiales',
                                            production_time: 'Tiempo de Producción (días)',
                                            requires_transport: 'Requiere Transporte',
                                            requires_installation: 'Requiere Instalación',
                                            requires_disassembly: 'Requiere Desmontaje',
                                            estimated_budget: 'Presupuesto Estimado',
                                            client_type: 'Tipo de Cliente',
                                            special_requirements: 'Requerimientos Especiales',
                                            style_preferences: 'Preferencias de Estilo',
                                        };

                                        return Object.entries(vars).map(([key, value]) => {
                                            if (value === null || value === undefined || value === '') return null;
                                            
                                            let displayValue: string;
                                            if (typeof value === 'boolean') {
                                                displayValue = value ? '✅ Sí' : '❌ No';
                                            } else if (Array.isArray(value)) {
                                                displayValue = value.length > 0 ? value.join(', ') : '-';
                                            } else if (typeof value === 'number') {
                                                if (key === 'estimated_budget' || key === 'square_meters') {
                                                    displayValue = key === 'estimated_budget' 
                                                        ? formatCurrency(value)
                                                        : `${value} m²`;
                                                } else {
                                                    displayValue = value.toString();
                                                }
                                            } else {
                                                displayValue = String(value);
                                            }

                                            return (
                                                <div key={key} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                        {labelMap[key] || key.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-[#102216] font-semibold text-sm">{displayValue}</p>
                                                </div>
                                            );
                                        }).filter(Boolean);
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Desglose de Presupuesto */}
                    {project.pricing_breakdown && Object.keys(project.pricing_breakdown).length > 0 && (
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="pb-4 pt-6 px-8 border-b border-slate-100">
                                <CardTitle className="text-xl font-bold text-[#102216] flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-[#13ec5b]" />
                                    Desglose de Presupuesto IA
                                </CardTitle>
                                <CardDescription className="text-slate-500">Cálculo detallado generado por la inteligencia artificial</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    {/* Line Items Table */}
                                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="text-left py-3 px-5 text-xs font-bold text-slate-600 uppercase tracking-wider">Concepto</th>
                                                    <th className="text-right py-3 px-5 text-xs font-bold text-slate-600 uppercase tracking-wider">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {project.pricing_breakdown.base_cost > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Costo Base</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.base_cost)}</td>
                                                    </tr>
                                                )}
                                                {project.pricing_breakdown.materials_cost > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Materiales</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.materials_cost)}</td>
                                                    </tr>
                                                )}
                                                {project.pricing_breakdown.breakdown?.design > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Diseño</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.breakdown.design)}</td>
                                                    </tr>
                                                )}
                                                {project.pricing_breakdown.breakdown?.production > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Producción</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.breakdown.production)}</td>
                                                    </tr>
                                                )}
                                                {/* Material Items Breakdown */}
                                                {project.pricing_breakdown.breakdown?.materials?.map((mat: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700 pl-8">↳ {mat.item}</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(mat.cost)}</td>
                                                    </tr>
                                                ))}
                                                {project.pricing_breakdown.transport_cost > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Transporte</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.transport_cost)}</td>
                                                    </tr>
                                                )}
                                                {project.pricing_breakdown.installation_cost > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Instalación</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.installation_cost)}</td>
                                                    </tr>
                                                )}
                                                {project.pricing_breakdown.disassembly_cost > 0 && (
                                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-5 text-sm text-slate-700">Desmontaje</td>
                                                        <td className="py-3 px-5 text-sm font-medium text-slate-900 text-right">{formatCurrency(project.pricing_breakdown.disassembly_cost)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals Summary */}
                                    <div className="bg-[#102216] rounded-2xl p-6 space-y-3">
                                        {project.pricing_breakdown.subtotal > 0 && (
                                            <div className="flex justify-between text-white/70 text-sm">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(project.pricing_breakdown.subtotal)}</span>
                                            </div>
                                        )}
                                        {project.pricing_breakdown.tax > 0 && (
                                            <div className="flex justify-between text-white/70 text-sm">
                                                <span>IVA</span>
                                                <span>{formatCurrency(project.pricing_breakdown.tax)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t border-white/20">
                                            <span className="text-white font-bold text-lg">Total Estimado</span>
                                            <span className="text-[#13ec5b] font-black text-2xl">{formatCurrency(project.pricing_breakdown.total || project.estimated_cost || 0)}</span>
                                        </div>
                                    </div>

                                    {/* Notes from AI */}
                                    {project.pricing_breakdown.notes && project.pricing_breakdown.notes.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">📝 Notas de la IA</p>
                                            <ul className="space-y-1">
                                                {project.pricing_breakdown.notes.map((note: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                                                        <span className="text-amber-400 mt-0.5">•</span>
                                                        {note}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabs */}
                    <Tabs defaultValue="renders" className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-sm md:grid-cols-4">
                            <TabsTrigger value="renders" className="flex gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#102216] data-[state=active]:text-white"><ImageIcon className="w-4 h-4" /> Renders ({renderUrls.length})</TabsTrigger>
                            <TabsTrigger value="files" className="flex gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#102216] data-[state=active]:text-white"><Paperclip className="w-4 h-4" /> Archivos ({files.length})</TabsTrigger>
                            <TabsTrigger value="messages" className="flex gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#102216] data-[state=active]:text-white"><StickyNote className="w-4 h-4" /> Notas ({messages.length})</TabsTrigger>
                            <TabsTrigger value="portfolio" className="flex gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#102216] data-[state=active]:text-white"><Globe className="w-4 h-4" /> Portafolio</TabsTrigger>
                        </TabsList>

                        <TabsContent value="renders" className="mt-4 space-y-4">
                            <form
                                className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleRegenerate()
                                }}
                            >
                                <Input
                                    value={renderNote}
                                    onChange={(e) => setRenderNote(e.target.value)}
                                    disabled={generating}
                                    placeholder="Instrucciones para la nueva versión (opcional): más madera, logo del cliente…"
                                    className="h-11 flex-1 rounded-xl border-slate-200 focus-visible:ring-[#13ec5b]"
                                />
                                <Button type="submit" disabled={generating} className="h-11 rounded-xl bg-[#102216] px-5 font-bold text-white hover:bg-[#1a3a2a]">
                                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 text-[#13ec5b]" />}
                                    {generating ? 'Generando…' : 'Nueva versión'}
                                </Button>
                            </form>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {project.renders?.map((render: any, i: number) => {
                                    const isMain = render.image_url === cover
                                    return (
                                        <figure key={render.id} className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-2 ${isMain ? 'ring-[#13ec5b]' : 'ring-transparent'}`}>
                                            <div className="relative aspect-video">
                                                <button className="h-full w-full cursor-zoom-in" onClick={() => setLightboxIndex(i)} aria-label={`Ver versión ${render.version} en grande`}>
                                                    <img src={render.image_url} alt={`Versión ${render.version}`} className="h-full w-full object-cover" />
                                                </button>
                                                {isMain && (
                                                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#13ec5b] px-2.5 py-1 text-xs font-bold text-[#102216]">
                                                        <Star className="h-3 w-3 fill-current" /> Principal
                                                    </span>
                                                )}
                                                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button onClick={() => setLightboxIndex(i)} className="rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80" aria-label="Ampliar"><Maximize2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDeleteRender(render.id)} className="rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-red-600" aria-label="Eliminar render"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </div>
                                            <figcaption className="flex items-center justify-between gap-3 p-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-[#102216]">Versión {render.version}</p>
                                                    <p className="truncate text-xs text-slate-500" title={render.prompt}>
                                                        {render.metadata?.provider ? `${render.metadata.provider} · ` : ''}{timeAgo(render.created_at)}
                                                    </p>
                                                </div>
                                                {!isMain && (
                                                    <Button size="sm" variant="outline" onClick={() => handleSetMainRender(render.image_url)} disabled={updating} className="flex-none rounded-xl border-slate-200 text-xs hover:border-[#13ec5b]/40 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35]">
                                                        Usar como principal
                                                    </Button>
                                                )}
                                            </figcaption>
                                        </figure>
                                    )
                                })}
                                {generating && (
                                    <div className="grid aspect-video place-items-center rounded-2xl border-2 border-dashed border-[#13ec5b]/40 bg-[#13ec5b]/5 text-center">
                                        <div>
                                            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[#13ec5b]" />
                                            <p className="text-sm font-semibold text-[#102216]">Generando nueva versión…</p>
                                        </div>
                                    </div>
                                )}
                                {!renderUrls.length && !generating && (
                                    <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-500">
                                        Este proyecto aún no tiene renders. Genera el primero arriba.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="files" className="mt-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Archivos del Proyecto</CardTitle>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                            Subir Archivo
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {files.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No hay archivos adjuntos
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {files.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleDownloadFile(file)}>
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteFile(file.id, file.file_url)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="messages" className="mt-4">
                            <Card className="flex h-[500px] flex-col rounded-3xl border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#102216]"><StickyNote className="h-5 w-5 text-[#13ec5b]" /> Notas internas</CardTitle>
                                    <CardDescription>Solo las ve el equipo. El cliente no tiene acceso.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col p-0">
                                    <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-4">
                                        {messages.length === 0 ? (
                                            <p className="py-12 text-center text-sm text-slate-500">Sin notas. Deja aquí acuerdos, llamadas o pendientes del proyecto.</p>
                                        ) : messages.map(note => (
                                            <div key={note.id} className="rounded-2xl bg-slate-50 p-4">
                                                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                                                    <span className="font-bold text-[#102216]">{note.author?.full_name || note.author?.email || 'Equipo'}</span>
                                                    <span className="text-slate-400">{timeAgo(note.created_at)}</span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm text-slate-700">{note.message}</p>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="border-t border-slate-100 p-4">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Escribe una nota para el equipo…"
                                                className="flex-1 rounded-xl border-slate-200 focus-visible:ring-[#13ec5b]"
                                                disabled={sending}
                                            />
                                            <Button type="submit" disabled={sending || !newMessage.trim()} className="rounded-xl bg-[#102216] hover:bg-[#1a3a2a]">
                                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="portfolio" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        Publicar en Portafolio
                                    </CardTitle>
                                    <CardDescription>
                                        Configura cómo aparecerá este proyecto en el portafolio público del sitio web.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Publish Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                        <div>
                                            <h4 className="font-medium">Publicar en Portafolio</h4>
                                            <p className="text-sm text-muted-foreground">Activar para que el proyecto sea visible en la web pública</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPortfolioPublished(!portfolioPublished)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                portfolioPublished ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                portfolioPublished ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Featured Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <div>
                                                <h4 className="font-medium">Proyecto Destacado</h4>
                                                <p className="text-sm text-muted-foreground">Mostrar con prioridad en el portafolio</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPortfolioFeatured(!portfolioFeatured)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                portfolioFeatured ? 'bg-yellow-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                                portfolioFeatured ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Título Público</label>
                                        <Input
                                            value={portfolioTitle}
                                            onChange={(e) => setPortfolioTitle(e.target.value)}
                                            placeholder={project?.title || 'Título del proyecto'}
                                        />
                                        <p className="text-xs text-muted-foreground">Este título se mostrará en el portafolio público. Déjalo vacío para usar el título del proyecto.</p>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Categoría</label>
                                        <Select value={portfolioCategory} onValueChange={setPortfolioCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PORTFOLIO_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descripción Pública</label>
                                        <Textarea
                                            value={portfolioDescription}
                                            onChange={(e) => setPortfolioDescription(e.target.value)}
                                            placeholder="Describe el proyecto para los visitantes del sitio web..."
                                            rows={4}
                                        />
                                    </div>

                                    {/* Image Gallery Upload */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Galería de Imágenes</label>
                                            <div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={portfolioFileRef}
                                                    onChange={handlePortfolioImageUpload}
                                                    accept="image/*"
                                                    multiple
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => portfolioFileRef.current?.click()}
                                                    disabled={portfolioUploading}
                                                >
                                                    {portfolioUploading ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 mr-2" />
                                                    )}
                                                    Subir Imágenes
                                                </Button>
                                            </div>
                                        </div>

                                        {portfolioImages.length === 0 ? (
                                            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No hay imágenes en la galería</p>
                                                <p className="text-xs mt-1">Sube imágenes para mostrar en el portafolio público</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {portfolioImages.map((imgUrl, idx) => (
                                                    <div key={idx} className="relative group aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Galería ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => setPortfolioFeaturedImage(imgUrl)}
                                                                disabled={portfolioFeaturedImage === imgUrl}
                                                            >
                                                                {portfolioFeaturedImage === imgUrl ? '★ Principal' : 'Hacer Principal'}
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={() => handleRemovePortfolioImage(imgUrl)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        {portfolioFeaturedImage === imgUrl && (
                                                            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-semibold">
                                                                ★ Principal
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end pt-4 border-t">
                                        <Button
                                            onClick={handlePortfolioSave}
                                            disabled={portfolioSaving}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {portfolioSaving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {portfolioItem?.id ? 'Actualizar Portafolio' : 'Publicar en Portafolio'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-lg font-bold text-[#102216]">Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 pb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Presupuesto Estimado</span>
                                <span className="text-xl font-black text-[#102216]">{formatCurrency(project.estimated_cost || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Anticipo (50%)</span>
                                <span className="font-medium text-slate-700">{formatCurrency((project.estimated_cost || 0) * 0.5)}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                {/* The client's proposal page has the "Descargar PDF" button */}
                                <a
                                    href={`/projects/${id}`}
                                    target="_blank"
                                    className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:border-[#13ec5b]/30 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35]"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ver propuesta del cliente
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="text-lg font-bold text-[#102216]">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#13ec5b]/10 flex items-center justify-center text-[#0a8c35] font-bold">
                                    {project.user?.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-[#102216]">{project.user?.full_name || project.user?.email || 'Nombre no registrado'}</p>
                                    <p className="text-sm text-slate-500">{project.user?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Teléfono:</span>
                                    <span className="font-medium text-slate-700">{project.user?.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Empresa:</span>
                                    <span className="font-medium text-slate-700">{project.user?.company || '-'}</span>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {phone && (
                                    <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#13ec5b] text-sm font-bold text-[#102216] hover:bg-[#13ec5b]/90">
                                        <MessageSquare className="h-4 w-4" /> WhatsApp
                                    </a>
                                )}
                                {phone && (
                                    <a href={`tel:+${phone}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                        <Phone className="h-4 w-4" /> Llamar
                                    </a>
                                )}
                                {project.user?.email && (
                                    <a href={`mailto:${project.user.email}?subject=${encodeURIComponent(`Tu propuesta ${project.project_number || ''} · Alma Verde`)}`} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 col-span-2`}>
                                        <Mail className="h-4 w-4" /> Escribir correo
                                    </a>
                                )}
                            </div>

                            {/* Metadata extras */}
                            {project.metadata && (
                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                                    {project.metadata.area > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Área:</span>
                                            <span className="font-medium text-slate-700">{project.metadata.area} m²</span>
                                        </div>
                                    )}
                                    {project.metadata.location && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ubicación:</span>
                                            <span className="font-medium text-slate-700">{project.metadata.location}</span>
                                        </div>
                                    )}
                                    {project.metadata.ai_generated && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#13ec5b]/10 text-[#0a8c35] text-xs font-bold px-3 py-1.5 rounded-lg">
                                            <Sparkles className="w-3 h-3" />
                                            Generado con IA
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Lightbox images={renderUrls} index={lightboxIndex} onChange={setLightboxIndex} alt={projectName(project)} downloadable />
        </div>
    )
}
