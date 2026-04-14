'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Save, Download, MessageSquare, Paperclip, Image as ImageIcon, Trash2, Upload, Send, User, Bot, FileText, RefreshCw, Globe, Star, X, Plus, Sparkles, DollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Interfaces
interface ProjectFile {
    id: string
    file_name: string
    file_url: string
    file_type: string
    file_size: number
    created_at: string
}

interface Message {
    id: string
    content: string
    is_ai: boolean
    is_internal: boolean
    user_id: string
    created_at: string
    user?: {
        email: string
        name: string
    }
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
    const { user } = useAuth()
    const [project, setProject] = useState<any>(null)
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [messages, setMessages] = useState<Message[]>([])

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

            // Sort messages by date
            if (data.messages) {
                data.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            }

            setProject(data)
            setStatus(data.status)
            setFiles(data.files || [])
            setMessages(data.messages || [])
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

    async function handleSetMainRender(renderId: string, imageUrl: string) {
        try {
            setUpdating(true)

            // 1. Unset others
            await (supabase
                .from('project_renders') as any)
                .update({ is_selected: false })
                .eq('project_id', id)

            // 2. Set new main
            const { error } = await (supabase
                .from('project_renders') as any)
                .update({ is_selected: true })
                .eq('id', renderId)

            if (error) throw error

            // 3. Update project metadata for dashboard preview
            const currentMetadata = project.metadata || {}
            await (supabase
                .from('projects') as any)
                .update({
                    metadata: {
                        ...currentMetadata,
                        render_image: imageUrl
                    }
                })
                .eq('id', id)

            // Refresh
            fetchProjectDetails()
            alert('Render principal actualizado')
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
            setUpdating(true)

            const response = await fetch('/api/quotation/generate-image-multi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: id,
                    prompt: newMessage || project.briefing, // Use message input as instruction or fallback
                    provider: 'dalle'
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Error al regenerar imagen')
            }

            // Refresh
            await fetchProjectDetails()
            setNewMessage('') // Clear input if used
            alert('Imagen regenerada con éxito')

        } catch (error: any) {
            console.error('Error regenerating image:', error)
            alert(error.message || 'Error al regenerar imagen')
        } finally {
            setUpdating(false)
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !user) return

        alert('El sistema de mensajes está temporalmente deshabilitado.')
        return

        /* 
        try {
            setSending(true)
            const { data: msg, error } = await supabase
                .from('messages')
                .insert({
                    project_id: id,
                    user_id: user.id,
                    content: newMessage,
                    is_internal: false
                })
                .select('*, user:users(email, name)')
                .single()

            if (error) throw error

            setMessages([...messages, msg])
            setNewMessage('')
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Error al enviar mensaje')
        } finally {
            setSending(false)
        }
        */
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

    if (!project) return <div>Proyecto no encontrado</div>

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 rounded-xl text-slate-600 hover:text-[#0a8c35] hover:bg-[#13ec5b]/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#102216] tracking-tight mb-2">{project.title}</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{project.id.substring(0, 12)}...</span>
                        <span>•</span>
                        <span>{project.user?.full_name || project.user?.email}</span>
                        <span>•</span>
                        <span>{new Date(project.created_at).toLocaleDateString('es-CO')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border-none">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Actual</span>
                        <div className="flex items-center gap-2">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[200px] rounded-xl border-slate-200 focus:ring-[#13ec5b]">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                    <SelectItem value="cotizacion">Cotización</SelectItem>
                                    <SelectItem value="aprobado">Aprobado</SelectItem>
                                    <SelectItem value="en_diseno">En Diseño</SelectItem>
                                    <SelectItem value="en_produccion">En Producción</SelectItem>
                                    <SelectItem value="instalado">Instalado</SelectItem>
                                    <SelectItem value="finalizado">Finalizado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleStatusUpdate} disabled={updating || status === project.status} className="rounded-xl bg-[#102216] hover:bg-[#1a3a2a] text-white h-10 w-10 p-0">
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <Tabs defaultValue="files" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="renders" className="flex gap-2"><ImageIcon className="w-4 h-4" /> Renders AI</TabsTrigger>
                            <TabsTrigger value="files" className="flex gap-2"><Paperclip className="w-4 h-4" /> Archivos ({files.length})</TabsTrigger>
                            <TabsTrigger value="messages" className="flex gap-2"><MessageSquare className="w-4 h-4" /> Mensajes ({messages.length})</TabsTrigger>
                            <TabsTrigger value="portfolio" className="flex gap-2"><Globe className="w-4 h-4" /> Portafolio</TabsTrigger>
                        </TabsList>

                        <TabsContent value="renders" className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Galería de Visualizaciones</h3>
                                <Button size="sm" variant="outline" onClick={handleRegenerate} disabled={updating}>
                                    {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                    Regenerar Nueva Versión
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.renders && project.renders.length > 0 ? (
                                    project.renders.map((render: any) => (
                                        <Card key={render.id} className={`overflow-hidden ${render.is_selected ? 'ring-2 ring-primary' : ''}`}>
                                            <div className="aspect-video relative bg-muted group">
                                                <img src={render.image_url} alt="Render" className="object-cover w-full h-full" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => handleSetMainRender(render.id, render.image_url)} disabled={render.is_selected}>
                                                        {render.is_selected ? 'Principal' : 'Usar como Portada'}
                                                    </Button>
                                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteRender(render.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {render.is_selected && (
                                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                                        Principal
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-3">
                                                <p className="text-xs text-muted-foreground">Versión {render.version} • {new Date(render.created_at).toLocaleDateString()}</p>
                                                <p className="text-xs truncate" title={render.prompt}>{render.prompt}</p>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No hay renders generados aún
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
                            <Card className="h-[500px] flex flex-col">
                                <CardHeader>
                                    <CardTitle>Comunicación con Cliente</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col p-0">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        <div className="text-center py-12 text-muted-foreground">
                                            El sistema de mensajes está temporalmente deshabilitado (Tabla faltante).
                                        </div>
                                    </div>
                                    <div className="p-4 border-t bg-card">
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
                                                placeholder="Escribe un mensaje..."
                                                className="flex-1"
                                                disabled={sending}
                                            />
                                            <Button type="submit" disabled={sending || !newMessage.trim()}>
                                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                                <Button className="w-full mb-2 rounded-xl border-slate-200 text-slate-600 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] hover:border-[#13ec5b]/30" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar Cotización
                                </Button>
                                <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl text-sm text-center font-medium">
                                    Pago Pendiente
                                </div>
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
        </div>
    )
}
