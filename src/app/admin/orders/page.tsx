'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, Loader2, ShoppingCart } from 'lucide-react'
import { FilterChip, PageHeader, Pill, SearchBox, Stat } from '@/components/admin/ui'
import { ORDER_STATUS, PAYMENT_METHODS, nameOf, statusOf } from '@/lib/admin/labels'
import { formatCOP, formatDate, timeAgo } from '@/lib/projects/display'

interface Order {
    id: string
    order_number: string
    total: number
    status: string
    payment_method: string | null
    created_at: string
    customer_name: string
    customer_email: string
    items: { quantity: number }[] | null
}

// Orders someone on the team still has to act on
const OPEN = ['PENDING', 'PAID', 'PROCESSING']

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')

    useEffect(() => {
        supabase.from('orders').select('*, items:order_items(quantity)').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (error) console.error('Error fetching orders:', error)
            setOrders((data || []) as unknown as Order[])
            setLoading(false)
        })
    }, [])

    const term = search.trim().toLowerCase()
    const matches = orders.filter(o =>
        !term || [o.order_number, o.customer_name, o.customer_email].some(v => v?.toLowerCase().includes(term))
    )
    const visible = status === 'all' ? matches : matches.filter(o => o.status === status)
    const sold = orders.filter(o => o.status !== 'CANCELLED')
    const soldTotal = sold.reduce((sum, o) => sum + Number(o.total || 0), 0)

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader eyebrow="Tienda" title="Órdenes" description="Compras hechas en la tienda en línea" />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Ventas" value={formatCOP(soldTotal)} hint={`${sold.length} órdenes sin cancelar`} />
                <Stat label="Por atender" value={orders.filter(o => OPEN.includes(o.status)).length} hint="Pendientes, pagadas o en preparación" />
                <Stat label="Entregadas" value={orders.filter(o => o.status === 'DELIVERED').length} />
                <Stat label="Ticket promedio" value={formatCOP(sold.length ? soldTotal / sold.length : 0)} />
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar por número, cliente o correo…" />
                <div className="flex flex-wrap gap-2">
                    <FilterChip active={status === 'all'} onClick={() => setStatus('all')} label="Todas" count={matches.length} />
                    {Object.entries(ORDER_STATUS).map(([code, s]) => (
                        <FilterChip key={code} active={status === code} onClick={() => setStatus(code)} label={s.label} count={matches.filter(o => o.status === code).length} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : (
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    {visible.length === 0 && (
                        <div className="p-16 text-center">
                            <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                            <p className="font-bold text-[#102216]">{orders.length ? 'No hay órdenes con estos filtros' : 'Aún no hay órdenes'}</p>
                        </div>
                    )}
                    {visible.map(o => {
                        const s = statusOf(ORDER_STATUS, o.status)
                        const units = (o.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0)
                        return (
                            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-4 border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50 md:px-6">
                                <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#13ec5b]/10 text-[#0a8c35]">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold text-[#102216]">{o.customer_name || 'Cliente sin nombre'}</p>
                                    <p className="truncate text-sm text-slate-500">
                                        {o.order_number} · {units} {units === 1 ? 'producto' : 'productos'} · {nameOf(PAYMENT_METHODS, o.payment_method)}
                                    </p>
                                </div>
                                <div className="hidden w-32 md:block"><Pill tone={s.tone}>{s.label}</Pill></div>
                                <div className="text-right">
                                    <p className="font-black text-[#102216]">{formatCOP(Number(o.total))}</p>
                                    <p className="text-xs text-slate-400" title={formatDate(o.created_at)}>{timeAgo(o.created_at)}</p>
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
