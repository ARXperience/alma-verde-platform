'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, FileText, Calendar, DollarSign, Package } from 'lucide-react'

interface Project {
    id: string
    title: string
    description: string
    status: string
    estimated_cost: number
    extracted_variables: {
        square_meters?: number
        location?: string
        project_type?: string
        [key: string]: any
    }
    created_at: string
    updated_at: string
    metadata: any
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            fetchProjects()
        }
    }, [user, authLoading, router])

    async function fetchProjects() {
        try {
            setLoading(true)

            if (!user?.id) {
                setProjects([])
                return
            }

            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    project_renders(
                        image_url,
                        is_selected,
                        version
                    )
                `)
                .eq('client_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Map the data to include the render image from the joined table if metadata is empty
            const projectsWithImages = (data || []).map((p: any) => {
                // Prioritize: 1. Selected Render, 2. Latest Render (version desc), 3. Metadata
                const renders = p.project_renders || []
                renders.sort((a: any, b: any) => (b.version || 0) - (a.version || 0)) // Sort desc

                const selectedRender = renders.find((r: any) => r.is_selected)
                const latestRender = renders[0]

                const displayImage = selectedRender?.image_url || latestRender?.image_url || p.metadata?.render_image

                if (displayImage) {
                    if (!p.metadata) p.metadata = {}
                    p.metadata.render_image = displayImage
                }
                return p
            })

            setProjects(projectsWithImages)
        } catch (err: any) {
            // Ignore AbortError often caused by navigation
            if (err?.message?.includes('AbortError') || err?.name === 'AbortError') {
                return
            }
            console.error('Error fetching projects:', err)
            console.error('Error details:', JSON.stringify(err, null, 2))
            setError(err.message || 'Error al cargar proyectos')
        } finally {
            setLoading(false)
        }
    }

    function getStatusColor(status: string) {
        const colors: Record<string, string> = {
            cotizacion: 'bg-yellow-500',
            draft: 'bg-gray-500',
            pending: 'bg-yellow-500',
            approved: 'bg-green-500',
            in_progress: 'bg-blue-500',
            completed: 'bg-purple-500',
            cancelled: 'bg-red-500',
        }
        return colors[status] || 'bg-gray-500'
    }

    function getStatusLabel(status: string) {
        const labels: Record<string, string> = {
            cotizacion: 'Cotización',
            draft: 'Borrador',
            pending: 'Pendiente',
            approved: 'Aprobado',
            in_progress: 'En Progreso',
            completed: 'Completado',
            cancelled: 'Cancelado',
        }
        return labels[status] || status
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
        })
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#102216] relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#13ec5b]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#13ec5b]/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Dashboard
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Bienvenido, <span className="text-white font-medium">{user?.full_name || user?.email}</span>
                        </p>
                    </div>
                    <Button onClick={() => router.push('/cotizar')} className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold h-12 px-6 rounded-xl shadow-[0_4px_20px_rgba(19,236,91,0.2)] transition-all hover:-translate-y-1">
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Cotización
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Proyectos</CardTitle>
                            <Package className="h-5 w-5 text-[#13ec5b]" />
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-4xl font-black text-white">{projects.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                            <CardTitle className="text-sm font-medium text-slate-400">En Progreso</CardTitle>
                            <FileText className="h-5 w-5 text-[#13ec5b]" />
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-4xl font-black text-white">
                                {projects.filter(p => p.status === 'in_progress').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                            <CardTitle className="text-sm font-medium text-slate-400">Completados</CardTitle>
                            <Calendar className="h-5 w-5 text-[#13ec5b]" />
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-4xl font-black text-white">
                                {projects.filter(p => p.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                            <CardTitle className="text-sm font-medium text-slate-400">Valor Total</CardTitle>
                            <DollarSign className="h-5 w-5 text-[#13ec5b]" />
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="text-3xl font-black text-white">
                                {formatCurrency(projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects List */}
                {/* Projects List */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-white mb-6">
                        Mis Cotizaciones
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <Package className="h-16 w-16 text-slate-500 mb-6" />
                                <p className="text-slate-400 text-lg text-center mb-8">
                                    No tienes cotizaciones aún
                                </p>
                                <Button onClick={() => router.push('/cotizar')} className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold h-12 px-8 rounded-xl shadow-[0_4px_20px_rgba(19,236,91,0.2)]">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Crear Primera Cotización
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <Card key={project.id} className="bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                                    {/* Project Image */}
                                    <div className="relative h-56 w-full bg-slate-900/50 overflow-hidden">
                                        {(project.metadata as any)?.render_image ? (
                                            <img
                                                src={(project.metadata as any).render_image}
                                                alt={project.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileText className="w-16 h-16 text-white/10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <CardTitle className="text-xl font-bold text-white line-clamp-1">{project.title}</CardTitle>
                                            <Badge className={`${getStatusColor(project.status)} text-white border-0 font-semibold px-3 py-1 shadow-lg`}>
                                                {getStatusLabel(project.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-6">
                                        <CardDescription className="line-clamp-2 text-slate-400 mb-6 text-sm min-h-[40px]">
                                            {project.description || 'Sin descripción'}
                                        </CardDescription>
                                        
                                        <div className="space-y-3 text-sm border-t border-white/10 pt-4 mb-6">
                                            {project.extracted_variables?.square_meters && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Área:</span>
                                                    <span className="font-medium text-white bg-white/5 px-2 py-1 rounded-md">{project.extracted_variables.square_meters} m²</span>
                                                </div>
                                            )}
                                            {project.extracted_variables?.location && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Ubicación:</span>
                                                    <span className="font-medium text-white bg-white/5 px-2 py-1 rounded-md">{project.extracted_variables.location}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-slate-400">Valor Estimado:</span>
                                                <span className="font-bold text-[#13ec5b] text-lg">
                                                    {formatCurrency(project.estimated_cost || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 pt-2">
                                                <span>Creado:</span>
                                                <span>{formatDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-12 bg-white/10 hover:bg-[#13ec5b] hover:text-[#102216] text-white border-none rounded-xl font-bold transition-all duration-300"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/projects/${project.id}`)
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
