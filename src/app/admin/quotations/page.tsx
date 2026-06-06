'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Eye, Plus, FileText } from 'lucide-react'

interface Quotation {
    id: string
    reference: string
    customer_name: string
    customer_email: string
    customer_phone: string | null
    project_type: string | null
    total: number
    status: string
    created_at: string
}

const STATUS_MAP: Record<string, string> = {
    'PENDING': 'Pendiente',
    'SENT': 'Enviada',
    'APPROVED': 'Aprobada',
    'REJECTED': 'Rechazada',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'PENDING': 'secondary',
    'SENT': 'outline',
    'APPROVED': 'default',
    'REJECTED': 'destructive',
}

export default function QuotationsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchQuotations()
    }, [])

    async function fetchQuotations() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('quotations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setQuotations(data || [])
        } catch (error) {
            console.error('Error fetching quotations:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0
        }).format(amount)
    }

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch =
            q.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#102216] tracking-tight">Cotizaciones</h1>
                    <p className="text-slate-500 mt-1">Gestiona las cotizaciones del CRM</p>
                </div>
                <Button
                    className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold rounded-xl"
                    onClick={() => router.push('/admin/quotations/new')}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cotización
                </Button>
            </div>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por referencia, cliente o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 rounded-xl">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                <SelectItem value="SENT">Enviada</SelectItem>
                                <SelectItem value="APPROVED">Aprobada</SelectItem>
                                <SelectItem value="REJECTED">Rechazada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-bold text-slate-600">Referencia</TableHead>
                                <TableHead className="font-bold text-slate-600">Cliente</TableHead>
                                <TableHead className="font-bold text-slate-600">Tipo</TableHead>
                                <TableHead className="font-bold text-slate-600">Fecha</TableHead>
                                <TableHead className="font-bold text-slate-600">Total</TableHead>
                                <TableHead className="font-bold text-slate-600">Estado</TableHead>
                                <TableHead className="font-bold text-slate-600 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuotations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <FileText className="w-12 h-12 opacity-30" />
                                            <p className="text-lg font-medium">No hay cotizaciones</p>
                                            <p className="text-sm">Las cotizaciones generadas aparecerán aquí</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredQuotations.map((q) => (
                                    <TableRow key={q.id} className="hover:bg-slate-50/80 group">
                                        <TableCell className="font-mono font-medium text-[#102216]">{q.reference}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{q.customer_name}</span>
                                                <span className="text-xs text-slate-500">{q.customer_email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{q.project_type || '—'}</TableCell>
                                        <TableCell>{new Date(q.created_at).toLocaleDateString('es-CO')}</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(q.total)}</TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_VARIANT[q.status] || 'secondary'}>
                                                {STATUS_MAP[q.status] || q.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/quotations/${q.id}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
