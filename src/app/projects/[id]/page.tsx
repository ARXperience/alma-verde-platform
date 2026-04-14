'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentButton } from '@/components/payments/PaymentButton'
import { Loader2, ArrowLeft, Download, RefreshCw, Image as ImageIcon, DollarSign, MapPin, Calendar, Package, CreditCard, MessageSquare, Paperclip, FileText, Send, User, Bot, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Project {
    id: string
    title: string
    description: string
    project_type: string
    status: string
    briefing: string
    extracted_variables: any
    pricing_breakdown: any
    estimated_cost: number
    created_at: string
    metadata: any
    user_id: string
}

interface ProjectRender {
    id: string
    image_url: string
    prompt: string
    version: number
    is_selected: boolean
    created_at: string
}

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

export default function ProjectDetailsPage() {
    const { user } = useAuth()
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [renders, setRenders] = useState<ProjectRender[]>([])
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [messages, setMessages] = useState<Message[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')

    // Regeneration state
    const [regenerateOpen, setRegenerateOpen] = useState(false)
    const [regenerateInstructions, setRegenerateInstructions] = useState('')
    const [provider, setProvider] = useState<'dalle' | 'imagen' | 'both'>('dalle')
    const [regenerating, setRegenerating] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails()
        }
    }, [projectId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    async function fetchProjectDetails() {
        try {
            setLoading(true)

            // Fetch project with related data
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select(`
                    *,
                    files:project_files(*)
                `)
                .eq('id', projectId)
                .single()

            if (projectError) throw projectError

            // Sort messages
            // if (projectData.project_messages) {
            //     projectData.project_messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            // }

            setProject(projectData)
            setFiles(projectData.files || [])
            setMessages(/* projectData.project_messages || */[])

            // Fetch renders from DB separately or check metadata fallback
            const { data: rendersData, error: rendersError } = await supabase
                .from('project_renders')
                .select('*')
                .eq('project_id', projectId)
                .order('version', { ascending: false })

            if (!rendersError && rendersData && rendersData.length > 0) {
                setRenders(rendersData)
            } else {
                // FALLBACK: Check metadata for images
                const metadataImages = projectData.metadata?.render_images || [];
                if (Array.isArray(metadataImages) && metadataImages.length > 0) {
                    const mappedRenders: ProjectRender[] = metadataImages.map((img: any, index: number) => ({
                        id: `meta-${index}-${Date.now()}`,
                        image_url: img.url,
                        prompt: img.prompt || 'Generado por IA',
                        version: metadataImages.length - index,
                        is_selected: index === 0,
                        created_at: img.created_at || new Date().toISOString()
                    }));
                    setRenders(mappedRenders);
                } else if (projectData.metadata?.render_image) {
                    setRenders([{
                        id: 'meta-single',
                        image_url: projectData.metadata.render_image,
                        prompt: 'Visualización Principal',
                        version: 1,
                        is_selected: true,
                        created_at: new Date().toISOString()
                    }]);
                }
            }
        } catch (err: any) {
            console.error('Error fetching project:', err)
            // Log full error object for debugging
            console.error('Error details:', JSON.stringify(err, null, 2))

            if (err.code === 'PGRST116') {
                setError('Proyecto no encontrado o no tienes permiso para verlo.')
            } else {
                setError(err.message || 'Error al cargar el proyecto')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !user) return

        try {
            setSending(true)
            const { data: msg, error } = await supabase
                .from('project_messages')
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    content: newMessage,
                    is_internal: false
                })
                .select('*, user:users(id, full_name)')
                .single()

            if (error) throw error

            setMessages([...messages, msg])
            setNewMessage('')
        } catch (error) {
            console.error('Error sending message:', error)
            // alert('Error al enviar mensaje')
        } finally {
            setSending(false)
        }
    }

    async function handleDownloadFile(file: ProjectFile) {
        if (file.file_url) {
            window.open(file.file_url, '_blank')
        }
    }

    async function handleSetMainRender(renderId: string, imageUrl: string) {
        try {
            setLoading(true)

            // 1. Unset others
            await supabase
                .from('project_renders')
                .update({ is_selected: false })
                .eq('project_id', projectId)

            // 2. Set new main
            const { error } = await supabase
                .from('project_renders')
                .update({ is_selected: true })
                .eq('id', renderId)

            if (error) throw error

            // 3. Update project metadata for dashboard preview
            const currentMetadata = project?.metadata || {}
            await supabase
                .from('projects')
                .update({
                    metadata: {
                        ...currentMetadata,
                        render_image: imageUrl
                    }
                })
                .eq('id', projectId)

            // Refresh local state without full reload if possible, or just re-fetch
            const updatedRenders = renders.map(r => ({
                ...r,
                is_selected: r.id === renderId
            }))
            setRenders(updatedRenders)

            // alert('Render principal actualizado')
        } catch (error) {
            console.error('Error updating main render:', error)
            alert('Error al actualizar render principal')
        } finally {
            setLoading(false)
        }
    }

    async function handleRegenerate() {
        if (!project) return

        try {
            setRegenerating(true)

            const res = await fetch('/api/quotation/generate-image-multi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    projectDetails: {
                        project_type: project.project_type,
                        ...project.extracted_variables,
                        description: project.briefing
                    },
                    instructions: regenerateInstructions,
                    provider: provider
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Error al regenerar la imagen')
            }

            // Refresh project details to get new renders
            await fetchProjectDetails()

            setRegenerateOpen(false)
            setRegenerateInstructions('')
            alert('Imagen regenerada con éxito')

        } catch (error: any) {
            console.error('Error regenerating image:', error)
            alert(error.message || 'Error al regenerar imagen')
        } finally {
            setRegenerating(false)
        }
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.files || event.target.files.length === 0) return

        const file = event.target.files[0]
        if (!file) return

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'project-files')
            formData.append('path', `${projectId}/${Date.now()}-${file.name}`)

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json()
                throw new Error(errorData.error || 'Error uploading file')
            }

            const { path: filePath } = await uploadRes.json()

            // Insert into DB via API (RLS Bypass)
            const dbRes = await fetch('/api/projects/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
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
        } catch (error: any) {
            if (error?.message?.includes('AbortError') || error?.name === 'AbortError') return
            console.error('Error fetching project:', error)
            setError('Error al cargar los detalles del proyecto')
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

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    function getStatusColor(status: string) {
        const colors: Record<string, string> = {
            cotizacion: 'bg-yellow-500',
            draft: 'bg-gray-500',
            pending: 'bg-yellow-500',
            aprobado: 'bg-green-500',
            en_produccion: 'bg-blue-500',
            finalizado: 'bg-purple-500',
            cancelado: 'bg-red-500',
        }
        return colors[status] || 'bg-gray-500'
    }

    function getStatusLabel(status: string) {
        const labels: Record<string, string> = {
            cotizacion: 'Cotización',
            draft: 'Borrador',
            pending: 'Pendiente',
            aprobado: 'Aprobado',
            en_produccion: 'En Producción',
            finalizado: 'Finalizado',
            cancelado: 'Cancelado',
        }
        return labels[status] || status
    }

    function formatBytes(bytes: number): string {
        if (!bytes || bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-red-600 mb-4">{error || 'Proyecto no encontrado'}</p>
                        <Button onClick={() => router.push('/dashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const variables = project.extracted_variables || {}
    const pricing = project.pricing_breakdown || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard')} className="print:hidden">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {project.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Creado el {formatDate(project.created_at)}
                            </p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="w-full grid grid-cols-4 mb-4">
                                <TabsTrigger value="info">Información</TabsTrigger>
                                <TabsTrigger value="renders">Renders</TabsTrigger>
                                <TabsTrigger value="files">Archivos ({files.length})</TabsTrigger>
                                <TabsTrigger value="messages">Mensajes ({messages.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="info">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información del Proyecto</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Descripción</label>
                                            <p className="text-gray-900 dark:text-white mt-1">{project.description}</p>
                                        </div>

                                        {project.briefing && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Briefing Original</label>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                                                    {project.briefing}
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Tipo de Proyecto</label>
                                                <p className="text-gray-900 dark:text-white mt-1 capitalize">
                                                    {project.project_type}
                                                </p>
                                            </div>
                                            {variables.square_meters && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Área</label>
                                                    <p className="text-gray-900 dark:text-white mt-1">
                                                        {variables.square_meters} m²
                                                    </p>
                                                </div>
                                            )}
                                            {variables.location && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Ubicación</label>
                                                    <p className="text-gray-900 dark:text-white mt-1">{variables.location}</p>
                                                </div>
                                            )}
                                            {variables.production_time && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Tiempo de Producción</label>
                                                    <p className="text-gray-900 dark:text-white mt-1">
                                                        {variables.production_time} días
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {variables.materials && variables.materials.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Materiales</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {variables.materials.map((material: string, i: number) => (
                                                        <Badge key={i} variant="secondary">{material}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="renders">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <ImageIcon className="h-5 w-5" />
                                                Visualizaciones Generadas
                                            </CardTitle>
                                            <Button variant="outline" size="sm" onClick={() => setRegenerateOpen(true)} className="print:hidden">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Regenerar
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {renders.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renders.map((render) => (
                                                    <div key={render.id} className="relative group">
                                                        <img
                                                            src={render.image_url}
                                                            alt={`Render versión ${render.version}`}
                                                            className="w-full h-auto rounded-lg border border-gray-200"
                                                        />
                                                        <div className="absolute top-2 right-2">
                                                            <Badge variant="secondary">v{render.version}</Badge>
                                                        </div>
                                                        {render.is_selected && (
                                                            <div className="absolute top-2 left-2">
                                                                <Badge className="bg-green-500">Seleccionado</Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No hay visualizaciones disponibles
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="files">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Paperclip className="h-5 w-5" />
                                            Archivos del Proyecto
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {files.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No hay archivos compartidos por el equipo aún.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {files.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{file.file_name}</p>
                                                                <p className="text-xs text-muted-foreground">{formatBytes(file.file_size)}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDownloadFile(file)}>
                                                            <Download className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="messages">
                                <Card className="h-[500px] flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            Chat con Alma Verde
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col p-0">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {messages.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    Envía un mensaje para comenzar a chatear con nuestro equipo.
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                                            ${msg.is_ai ? 'bg-purple-100 text-purple-600' :
                                                                msg.user_id === user?.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                                                        `}>
                                                            {msg.is_ai ? <Bot size={16} /> : <User size={16} />}
                                                        </div>
                                                        <div className={`
                                                            max-w-[70%] p-3 rounded-lg text-sm
                                                            ${msg.user_id === user?.id
                                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'}
                                                        `}>
                                                            <div className="flex justify-between items-baseline gap-2 mb-1 opacity-80 text-xs">
                                                                <span className="font-semibold">{msg.user_id === user?.id ? 'Tú' : (msg.is_ai ? 'Alma Verde AI' : 'Equipo Alma Verde')}</span>
                                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p>{msg.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                        <div className="p-4 border-t bg-white dark:bg-gray-800">
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
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing */}
                        {pricing && pricing.total && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Cotización
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pricing.base_cost && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Costo Base</span>
                                            <span className="font-medium">{formatCurrency(pricing.base_cost)}</span>
                                        </div>
                                    )}
                                    {pricing.materials_cost && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Materiales</span>
                                            <span className="font-medium">{formatCurrency(pricing.materials_cost)}</span>
                                        </div>
                                    )}
                                    {pricing.transport_cost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Transporte</span>
                                            <span className="font-medium">{formatCurrency(pricing.transport_cost)}</span>
                                        </div>
                                    )}
                                    {pricing.installation_cost > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Instalación</span>
                                            <span className="font-medium">{formatCurrency(pricing.installation_cost)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span className="text-green-600">{formatCurrency(pricing.total)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payments - NEW SECTION */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Pagos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                                    Para iniciar la producción, se requiere un anticipo del 50%.
                                </div>
                                <div className="flex justify-between items-center font-medium">
                                    <span>Anticipo (50%)</span>
                                    <span>{formatCurrency((pricing.total || 0) * 0.5)}</span>
                                </div>
                                <PaymentButton
                                    projectId={project.id}
                                    amount={(pricing.total || 0) * 0.5}
                                    label="Pagar Anticipo con Bold"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                />
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card className="print:hidden">
                            <CardHeader>
                                <CardTitle>Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" variant="outline" onClick={() => window.print()}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar PDF
                                </Button>
                                <Button className="w-full" variant="outline" onClick={() => setRegenerateOpen(true)}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerar Imagen
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Regeneration Dialog */}
            <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regenerar Visualización 3D</DialogTitle>
                        <DialogDescription>
                            Genera una nueva versión de la visualización. Puedes agregar instrucciones específicas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Instrucciones Adicionales</Label>
                            <Textarea
                                placeholder="Ej: Hazlo más futurista, cambia el color a azul, agrega más iluminación..."
                                value={regenerateInstructions}
                                onChange={(e) => setRegenerateInstructions(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Modelo de IA</Label>
                            <Select
                                value={provider}
                                onValueChange={(val: any) => setProvider(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un modelo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dalle">DALL-E 3 (OpenAI)</SelectItem>
                                    <SelectItem value="imagen">Gemini Imagen 3</SelectItem>
                                    <SelectItem value="both">Ambos (Comparar)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRegenerate} disabled={regenerating}>
                            {regenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Generar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Regenerate Dialog */}
            <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regenerar Visualización</DialogTitle>
                        <DialogDescription>
                            Describe los cambios que deseas ver en la nueva imagen o deja en blanco para usar el briefing original con variaciones.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Instrucciones Adicionales (Opcional)</Label>
                            <Textarea
                                placeholder="Ej: Cambiar el color de las paredes a blanco, hacer la iluminación más cálida..."
                                value={regenerateInstructions}
                                onChange={(e) => setRegenerateInstructions(e.target.value)}
                            />
                        </div>
                        {/* 
                        <div className="space-y-2">
                            <Label>Modelo AI</Label>
                            <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dalle">DALL-E 3 (Calidad Alta)</SelectItem>
                                    <SelectItem value="imagen">Imagen 2 (Rápido)</SelectItem> 
                                </SelectContent>
                            </Select>
                        </div> 
                        */}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRegenerateOpen(false)} disabled={regenerating}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRegenerate} disabled={regenerating}>
                            {regenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
