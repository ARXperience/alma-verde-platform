'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Check, CreditCard, Loader2, Mail, MapPin, MessageSquare, Package, Phone, User } from 'lucide-react'
import { Pill } from '@/components/admin/ui'
import { ORDER_STATUS, PAYMENT_METHODS, nameOf, statusOf } from '@/lib/admin/labels'
import { formatCOP } from '@/lib/projects/display'

interface OrderItem {
    id: string
    name: string
    quantity: number
    unit_price: number
    total: number
    is_rental: boolean
    product: { images: string[] | null } | null
}

interface Order {
    id: string
    order_number: string
    status: string
    subtotal: number
    tax: number
    total: number
    created_at: string
    customer_name: string
    customer_email: string
    customer_phone: string | null
    shipping_address: string | null
    payment_method: string | null
    notes: string | null
    items: OrderItem[]
}

// Normal flow of an order; "Cancelada" is a separate action
const FLOW = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        supabase.from('orders').select('*, items:order_items(*, product:products(images))').eq('id', orderId).single()
            .then(({ data, error }) => {
                if (error || !data) {
                    console.error('Error fetching order:', error)
                    router.push('/admin/orders')
                    return
                }
                setOrder(data as unknown as Order)
                setLoading(false)
            })
    }, [orderId, router])

    async function changeStatus(status: string) {
        if (!order || status === order.status) return
        if (status === 'CANCELLED' && !confirm('¿Cancelar esta orden?')) return
        setUpdating(true)
        const { error } = await (supabase.from('orders') as any).update({ status }).eq('id', orderId)
        if (error) alert('No se pudo actualizar el estado: ' + error.message)
        else setOrder({ ...order, status })
        setUpdating(false)
    }

    if (loading || !order) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
    }

    const s = statusOf(ORDER_STATUS, order.status)
    const step = FLOW.indexOf(order.status)
    const phone = String(order.customer_phone || '').replace(/\D/g, '')
    const created = new Date(order.created_at)

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#0a8c35]">
                <ArrowLeft className="h-4 w-4" /> Órdenes
            </Link>

            {/* Header */}
            <section className="rounded-3xl bg-[#102216] p-6 text-white shadow-sm md:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone={s.tone}>{s.label}</Pill>
                            <span className="font-mono text-sm text-white/60">{order.order_number}</span>
                        </div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{order.customer_name || 'Cliente sin nombre'}</h1>
                        <p className="mt-1 text-white/60">
                            {created.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {created.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <p className="text-4xl font-black text-[#13ec5b]">{formatCOP(Number(order.total))}</p>
                </div>

                {/* Stages: click to move the order forward or back */}
                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {FLOW.map((code, i) => {
                        const done = step >= 0 && i < step
                        const current = code === order.status
                        return (
                            <button
                                key={code}
                                disabled={updating}
                                onClick={() => changeStatus(code)}
                                className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition-colors ${current ? 'bg-[#13ec5b] text-[#102216]' : done ? 'bg-white/10 text-[#13ec5b] hover:bg-white/15' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span className={`grid h-5 w-5 flex-none place-items-center rounded-full text-[10px] ${current ? 'bg-[#102216] text-[#13ec5b]' : done ? 'bg-[#13ec5b] text-[#102216]' : 'bg-white/10'}`}>
                                    {done ? <Check className="h-3 w-3" /> : i + 1}
                                </span>
                                {ORDER_STATUS[code].label}
                            </button>
                        )
                    })}
                    <button
                        disabled={updating || order.status === 'CANCELLED'}
                        onClick={() => changeStatus('CANCELLED')}
                        className={`rounded-2xl px-3 py-2.5 text-sm font-bold transition-colors ${order.status === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-white/5 text-red-300 hover:bg-red-500/20'}`}
                    >
                        {order.status === 'CANCELLED' ? 'Cancelada' : 'Cancelar orden'}
                    </button>
                </div>
                {updating && <p className="mt-3 flex items-center gap-2 text-sm text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</p>}
            </section>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Items */}
                <div className="space-y-6 lg:col-span-2">
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-black text-[#102216]">Productos del pedido</h2>
                        <div className="divide-y divide-slate-100">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0">
                                    {item.product?.images?.[0] ? (
                                        <img src={item.product.images[0]} alt={item.name} className="h-16 w-16 flex-none rounded-2xl object-cover" />
                                    ) : (
                                        <div className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-slate-100"><Package className="h-6 w-6 text-slate-300" /></div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#102216]">{item.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {item.quantity} × {formatCOP(item.unit_price)}{item.is_rental ? ' · alquiler' : ''}
                                        </p>
                                    </div>
                                    <p className="font-black text-[#102216]">{formatCOP(item.total)}</p>
                                </div>
                            ))}
                        </div>
                        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd>{formatCOP(Number(order.subtotal))}</dd></div>
                            {Number(order.tax) > 0 && <div className="flex justify-between text-slate-500"><dt>IVA</dt><dd>{formatCOP(Number(order.tax))}</dd></div>}
                            <div className="flex justify-between pt-2 text-lg font-black text-[#102216]"><dt>Total</dt><dd>{formatCOP(Number(order.total))}</dd></div>
                        </dl>
                    </section>

                    {order.notes && (
                        <section className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200">
                            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-amber-700">Notas del cliente</h2>
                            <p className="whitespace-pre-wrap text-amber-900">{order.notes}</p>
                        </section>
                    )}
                </div>

                {/* Customer, shipping, payment */}
                <aside className="space-y-6">
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#102216]"><User className="h-5 w-5 text-[#13ec5b]" /> Cliente</h2>
                        <p className="font-bold text-[#102216]">{order.customer_name || 'Sin nombre'}</p>
                        <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                            {order.customer_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {order.customer_email}</p>}
                            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {order.customer_phone || 'Sin teléfono'}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {phone && (
                                <a href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${order.customer_name || ''}, te escribimos de Alma Verde sobre tu orden ${order.order_number}.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#13ec5b] text-sm font-bold text-[#102216] hover:bg-[#13ec5b]/90">
                                    <MessageSquare className="h-4 w-4" /> WhatsApp
                                </a>
                            )}
                            {order.customer_email && (
                                <a href={`mailto:${order.customer_email}?subject=${encodeURIComponent(`Tu orden ${order.order_number} · Alma Verde`)}`} className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 ${phone ? '' : 'col-span-2'}`}>
                                    <Mail className="h-4 w-4" /> Correo
                                </a>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-[#102216]"><MapPin className="h-5 w-5 text-[#13ec5b]" /> Envío</h2>
                        <p className="text-slate-600">{order.shipping_address || 'Sin dirección'}</p>
                        {order.shipping_address && (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shipping_address)}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-[#0a8c35] hover:underline">
                                Ver en el mapa
                            </a>
                        )}
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-[#102216]"><CreditCard className="h-5 w-5 text-[#13ec5b]" /> Pago</h2>
                        <p className="text-slate-600">{nameOf(PAYMENT_METHODS, order.payment_method)}</p>
                    </section>
                </aside>
            </div>
        </div>
    )
}
