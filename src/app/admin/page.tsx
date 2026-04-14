'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Loader2, DollarSign, Users, FileText, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingQuotes: 0,
        totalRevenue: 0,
        activeClients: 0
    })
    const [recentProjects, setRecentProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        try {
            setLoading(true)

            // Fetch projects
            const { data: projects, error } = await supabase
                .from('projects')
                .select('id, title, status, estimated_cost, created_at')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error

            // Calculate stats
            const totalProjects = projects?.length || 0 // This is just limit 10, need count for real total? 
            // For MVP let's do a separate count query or just use this for now if list is small.
            // Better to do count queries.

            const { count: countProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true })
            const { count: countQuotes } = await supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
            const { count: countClients } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT')

            // Calculate revenue from APPROVED or COMPLETED projects
            const { data: revenueData } = await supabase
                .from('projects')
                .select('estimated_cost')
                .in('status', ['APPROVED', 'COMPLETED', 'IN_PRODUCTION'])

            const totalRevenue = (revenueData as any)?.reduce((sum: number, p: any) => sum + (p.estimated_cost || 0), 0) || 0

            setStats({
                totalProjects: countProjects || 0,
                pendingQuotes: countQuotes || 0,
                totalRevenue,
                activeClients: countClients || 0
            })
            setRecentProjects(projects as any || [])

        } catch (error) {
            console.error('Error fetching admin data:', JSON.stringify(error, null, 2))
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-black text-[#102216] tracking-tight mb-8">Panel Principal</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Ingresos Totales"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={<DollarSign className="w-6 h-6 text-[#0a8c35]" />}
                    color="green"
                />
                <StatCard
                    title="Proyectos Totales"
                    value={stats.totalProjects}
                    icon={<FileText className="w-6 h-6 text-blue-600" />}
                    color="blue"
                />
                <StatCard
                    title="Cotizaciones Pendientes"
                    value={stats.pendingQuotes}
                    icon={<Activity className="w-6 h-6 text-orange-500" />}
                    color="orange"
                />
                <StatCard
                    title="Clientes Activos"
                    value={stats.activeClients}
                    icon={<Users className="w-6 h-6 text-purple-600" />}
                    color="purple"
                />
            </div>

            {/* Recent Projects */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-8">
                    <CardTitle className="text-2xl font-bold text-[#102216]">Proyectos Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left bg-slate-50">
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm">Proyecto</th>
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm">Cliente</th>
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm">Estado</th>
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm">Presupuesto</th>
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm">Fecha</th>
                                    <th className="py-4 px-8 font-bold text-slate-600 text-sm text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map((project) => (
                                    <tr key={project.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-5 px-8 font-bold text-[#102216]">{project.title}</td>
                                        <td className="py-5 px-8 text-slate-500">{project.user?.name || project.user?.email || 'Sin usuario'}</td>
                                        <td className="py-5 px-8">
                                            <Badge status={project.status} />
                                        </td>
                                        <td className="py-5 px-8 font-medium text-slate-700">{project.budget ? formatCurrency(project.budget) : '-'}</td>
                                        <td className="py-5 px-8 text-slate-500 text-sm">{new Date(project.created_at).toLocaleDateString('es-CO')}</td>
                                        <td className="py-5 px-8 text-right">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => router.push(`/admin/projects/${project.id}`)}
                                                className="rounded-xl h-9 border-slate-200 text-slate-600 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] hover:border-[#13ec5b]/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Gestionar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {recentProjects.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500 italic">No hay proyectos recientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    const bgColor = {
        green: 'bg-green-50',
        blue: 'bg-blue-50',
        orange: 'bg-orange-50',
        purple: 'bg-purple-50',
    }[color] || 'bg-slate-50';

    return (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-2">{title}</p>
                        <h3 className="text-3xl font-black text-[#102216]">{value}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl ${bgColor}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function Badge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        APPROVED: 'bg-[#13ec5b]/10 text-[#0a8c35] border-[#13ec5b]/30',
        COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
        CANCELLED: 'bg-red-50 text-red-700 border-red-200',
        IN_PRODUCTION: 'bg-purple-50 text-purple-700 border-purple-200',
    }

    const labels: Record<string, string> = {
        PENDING: 'Pendiente',
        APPROVED: 'Aprobado',
        COMPLETED: 'Completado',
        CANCELLED: 'Cancelado',
        IN_PRODUCTION: 'En Producción',
    }

    return (
        <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm inline-flex items-center ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'APPROVED' ? 'bg-[#13ec5b]' : 'bg-current opacity-60'}`}></span>
            {labels[status] || status}
        </span>
    )
}
