'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, FileText, Loader2 } from 'lucide-react'
import { FilterChip, PageHeader, Pill, SearchBox, Stat } from '@/components/admin/ui'
import { QUOTATION_STATUS, statusOf } from '@/lib/admin/labels'
import { formatCOP, timeAgo } from '@/lib/projects/display'

interface Quotation {
    id: string
    reference: string
    customer_name: string
    customer_email: string
    project_type: string | null
    total: number
    status: string
    created_at: string
}

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')

    useEffect(() => {
        supabase.from('quotations').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (error) console.error('Error fetching quotations:', error)
            setQuotations((data || []) as Quotation[])
            setLoading(false)
        })
    }, [])

    const term = search.trim().toLowerCase()
    const matches = quotations.filter(q =>
        !term || [q.reference, q.customer_name, q.customer_email].some(v => v?.toLowerCase().includes(term))
    )
    const visible = status === 'all' ? matches : matches.filter(q => q.status === status)
    const approved = quotations.filter(q => q.status === 'APPROVED')

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow="Ventas"
                title="Cotizaciones"
                description={<>Cotizaciones creadas por WhatsApp y el equipo. Las del cotizador IA están en <Link href="/admin/projects" className="font-semibold text-[#0a8c35] hover:underline">Proyectos</Link>.</>}
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Cotizaciones" value={quotations.length} />
                <Stat label="Pendientes" value={quotations.filter(q => q.status === 'PENDING').length} />
                <Stat label="Aprobadas" value={approved.length} />
                <Stat label="Valor aprobado" value={formatCOP(approved.reduce((sum, q) => sum + Number(q.total || 0), 0))} />
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar por referencia, cliente o correo…" />
                <div className="flex flex-wrap gap-2">
                    <FilterChip active={status === 'all'} onClick={() => setStatus('all')} label="Todas" count={matches.length} />
                    {Object.entries(QUOTATION_STATUS).map(([code, s]) => (
                        <FilterChip key={code} active={status === code} onClick={() => setStatus(code)} label={s.label} count={matches.filter(q => q.status === code).length} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : (
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    {visible.length === 0 && (
                        <div className="p-16 text-center">
                            <FileText className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                            <p className="font-bold text-[#102216]">{quotations.length ? 'No hay cotizaciones con estos filtros' : 'Aún no hay cotizaciones'}</p>
                            {!quotations.length && <p className="text-sm text-slate-500">Las que genere el asistente de WhatsApp aparecerán aquí.</p>}
                        </div>
                    )}
                    {visible.map(q => {
                        const s = statusOf(QUOTATION_STATUS, q.status)
                        return (
                            <Link key={q.id} href={`/admin/quotations/${q.id}`} className="flex items-center gap-4 border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50 md:px-6">
                                <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#13ec5b]/10 text-[#0a8c35]"><FileText className="h-5 w-5" /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold text-[#102216]">{q.customer_name || 'Cliente sin nombre'}</p>
                                    <p className="truncate text-sm text-slate-500">
                                        <span className="font-mono">{q.reference}</span>{q.project_type ? ` · ${q.project_type}` : ''}
                                    </p>
                                </div>
                                <div className="hidden w-28 md:block"><Pill tone={s.tone}>{s.label}</Pill></div>
                                <div className="text-right">
                                    <p className="font-black text-[#102216]">{formatCOP(Number(q.total))}</p>
                                    <p className="text-xs text-slate-400">{timeAgo(q.created_at)}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 flex-none text-slate-300" />
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
