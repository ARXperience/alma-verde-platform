'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Search, Eye, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const router = useRouter()

    useEffect(() => {
        fetchProjects()
    }, [statusFilter])

    async function fetchProjects() {
        try {
            setLoading(true)
            let query = supabase
                .from('projects')
                .select('*, user:users!projects_client_id_fkey(full_name, email)') // Fetch related user info if relation exists
                // Note: 'user:users(...)' syntax depends on FK name. Usually 'users(name)' works if relation is detected.
                .order('created_at', { ascending: false })

            if (statusFilter !== 'ALL') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error
            setProjects(data as any || [])
        } catch (error: any) {
            // Ignore AbortError often caused by navigation
            if (error?.message?.includes('AbortError') || error?.name === 'AbortError') {
                return
            }
            console.error('Error fetching projects:', JSON.stringify(error, null, 2))
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = projects.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-black text-[#102216] tracking-tight">Gestión de Proyectos</h1>
            </div>

            <Card className="mb-8 border-none shadow-sm rounded-3xl bg-white">
                <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-slate-200 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] bg-slate-50 text-base"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[250px] h-12 rounded-xl border-slate-200 focus:ring-[#13ec5b] bg-slate-50">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="cotizacion">Cotización</SelectItem>
                            <SelectItem value="pending">Pendiente de Aprobación</SelectItem>
                            <SelectItem value="approved">Aprobado</SelectItem>
                            <SelectItem value="in_production">En Producción</SelectItem>
                            <SelectItem value="completed">Finalizado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-16 flex justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-[#13ec5b]" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left bg-slate-50">
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm">Proyecto / ID</th>
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm">Cliente</th>
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm">Estado</th>
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm">Presupuesto</th>
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm">Fecha</th>
                                        <th className="py-4 px-8 font-bold text-slate-600 text-sm text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="font-bold text-[#102216]">{project.title}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{project.id.substring(0, 8)}...</div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{project.user?.full_name || 'Sin Asignar'}</span>
                                                    <span className="text-xs text-slate-500">{project.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <Badge className={`px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm inline-flex items-center ${
                                                    project.status === 'approved' ? 'bg-[#13ec5b]/10 text-[#0a8c35] border-[#13ec5b]/30' :
                                                    project.status === 'in_production' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    project.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    project.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    project.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${project.status === 'approved' ? 'bg-[#13ec5b]' : 'bg-current opacity-60'}`}></span>
                                                    {project.status === 'cotizacion' ? 'Cotización' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-8 font-medium text-slate-700">
                                                {formatCurrency(project.budget || project.estimated_cost || 0)}
                                            </td>
                                            <td className="py-5 px-8 text-sm text-slate-500">
                                                {new Date(project.created_at).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                                                    className="rounded-xl h-9 px-4 border-slate-200 text-slate-600 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] hover:border-[#13ec5b]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-auto"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Detalles
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProjects.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-slate-500 italic">No se encontraron proyectos.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
