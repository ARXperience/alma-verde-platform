'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowUpRight, Loader2, MessageSquare, ShoppingCart, Sparkles } from 'lucide-react'
import { PageHeader, ProjectThumb, StatusBadge } from '@/components/admin/ui'
import { ACTIVE_STATUSES, PROJECT_STEPS, formatCOP, projectName, timeAgo } from '@/lib/projects/display'
import { ORDER_STATUS, statusOf } from '@/lib/admin/labels'

interface Project {
    id: string
    title: string
    project_type: string
    status: string
    estimated_cost: number
    created_at: string
    extracted_variables: { project_type?: string; square_meters?: number } | null
    metadata: { render_image?: string } | null
    client: { full_name: string | null; email: string } | null
}

interface Order { id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string }
interface Lead { id: string; phone: string; name: string | null; last_message: string | null; intent: string | null; updated_at: string }

export default function AdminDashboard() {
    const { user } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [leads, setLeads] = useState<Lead[]>([])
    const [clients, setClients] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // ponytail: loads every project and order to aggregate in the browser; move to SQL views when they reach the thousands
        Promise.all([
            supabase.from('projects')
                .select('id, title, project_type, status, estimated_cost, created_at, extracted_variables, metadata, client:users!projects_client_id_fkey(full_name, email)')
                .order('created_at', { ascending: false }),
            supabase.from('orders').select('id, order_number, customer_name, total, status, created_at').order('created_at', { ascending: false }),
            // The WhatsApp bot also stores status broadcasts as leads; those are not conversations
            supabase.from('whatsapp_leads').select('id, phone, name, last_message, intent, updated_at')
                .not('phone', 'like', '%@broadcast').order('updated_at', { ascending: false }).limit(5),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'cliente'),
        ]).then(([p, o, l, c]) => {
            setProjects((p.data || []) as unknown as Project[])
            setOrders((o.data || []) as Order[])
            setLeads((l.data || []) as Lead[])
            setClients(c.count || 0)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" />
            </div>
        )
    }

    const sum = (list: { estimated_cost?: number; total?: number }[]) => list.reduce((s, x) => s + Number(x.estimated_cost ?? x.total ?? 0), 0)
    const quotes = projects.filter(p => p.status === 'cotizacion')
    const active = projects.filter(p => ACTIVE_STATUSES.includes(p.status))
    const done = projects.filter(p => p.status === 'finalizado')
    const paidOrders = orders.filter(o => o.status !== 'CANCELLED')
    const stages = PROJECT_STEPS.map(step => {
        const list = projects.filter(p => p.status === step.id)
        return { ...step, count: list.length, value: sum(list) }
    })
    const pipelineValue = stages.reduce((s, x) => s + x.value, 0)
    const firstName = (user?.full_name || '').split(' ')[0]
    const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow={today}
                title={firstName ? `Hola, ${firstName}` : 'Panel principal'}
                description={`${clients} ${clients === 1 ? 'cliente registrado' : 'clientes registrados'} · ${projects.length} proyectos en total`}
                actions={
                    <Link href="/cotizar" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#13ec5b] px-5 text-sm font-bold text-[#102216] shadow-sm transition-transform hover:-translate-y-0.5">
                        <Sparkles className="h-4 w-4" /> Cotizador IA
                    </Link>
                }
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Kpi label="Por revisar" value={quotes.length} hint={`${formatCOP(sum(quotes))} cotizados`} href="/admin/projects?status=cotizacion" accent="bg-amber-400" />
                <Kpi label="En curso" value={active.length} hint={`${formatCOP(sum(active))} en ejecución`} href="/admin/projects" accent="bg-sky-400" />
                <Kpi label="Finalizados" value={done.length} hint={`${formatCOP(sum(done))} facturables`} href="/admin/projects?status=finalizado" accent="bg-violet-400" />
                <Kpi label="Ventas tienda" value={formatCOP(sum(paidOrders))} hint={`${paidOrders.length} órdenes`} href="/admin/orders" accent="bg-[#13ec5b]" />
            </div>

            {/* Pipeline */}
            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col justify-between gap-1 md:flex-row md:items-end">
                    <div>
                        <h2 className="text-xl font-black text-[#102216]">Embudo de proyectos</h2>
                        <p className="text-sm text-slate-500">Valor por etapa, de la cotización a la entrega</p>
                    </div>
                    <p className="text-2xl font-black text-[#102216]">{formatCOP(pipelineValue)}</p>
                </div>
                <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-slate-100">
                    {stages.filter(s => s.value > 0).map(s => (
                        <div key={s.id} className={`${s.dot} transition-all`} style={{ width: `${(s.value / pipelineValue) * 100}%` }} title={`${s.label}: ${formatCOP(s.value)}`} />
                    ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {stages.map(s => (
                        <Link key={s.id} href={`/admin/projects?status=${s.id}`} className="rounded-2xl p-3 transition-colors hover:bg-slate-50">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
                            </span>
                            <p className="mt-1 text-2xl font-black text-[#102216]">{s.count}</p>
                            <p className="text-xs text-slate-500">{formatCOP(s.value)}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Latest quotes */}
            <section className="mt-10">
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-black text-[#102216]">Cotizaciones recientes</h2>
                        <p className="text-sm text-slate-500">Lo que los clientes pidieron con el cotizador IA</p>
                    </div>
                    <Link href="/admin/projects" className="text-sm font-bold text-[#0a8c35] hover:underline">Ver todos</Link>
                </div>
                {projects.length === 0 ? (
                    <p className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Aún no hay proyectos.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {projects.slice(0, 4).map(p => (
                            <Link key={p.id} href={`/admin/projects/${p.id}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <ProjectThumb src={p.metadata?.render_image} alt={projectName(p)} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute left-3 top-3"><StatusBadge status={p.status} /></div>
                                </div>
                                <div className="p-4">
                                    <p className="truncate font-bold text-[#102216]">{projectName(p)}</p>
                                    <p className="truncate text-sm text-slate-500">{p.client?.full_name || p.client?.email || 'Sin cliente'}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="font-black text-[#0a8c35]">{formatCOP(p.estimated_cost)}</span>
                                        <span className="text-xs text-slate-400">{timeAgo(p.created_at)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Orders + WhatsApp */}
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Panel title="Órdenes de la tienda" icon={ShoppingCart} href="/admin/orders" empty="Aún no hay órdenes.">
                    {orders.slice(0, 5).map(o => (
                        <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 rounded-2xl p-3 transition-colors hover:bg-slate-50">
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-[#102216]">{o.customer_name}</p>
                                <p className="text-xs text-slate-500">{o.order_number} · {timeAgo(o.created_at)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[#102216]">{formatCOP(Number(o.total))}</p>
                                <p className="text-xs text-slate-500">{statusOf(ORDER_STATUS, o.status).label}</p>
                            </div>
                        </Link>
                    ))}
                </Panel>
                <Panel title="WhatsApp" icon={MessageSquare} href="/admin/whatsapp" empty="Sin conversaciones recientes.">
                    {leads.map(l => (
                        <Link key={l.id} href="/admin/whatsapp" className="flex items-start justify-between gap-4 rounded-2xl p-3 transition-colors hover:bg-slate-50">
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-[#102216]">{l.name || l.phone.replace(/@.*/, '')}</p>
                                <p className="truncate text-sm text-slate-500">{l.last_message || 'Sin mensajes'}</p>
                            </div>
                            <div className="flex-none text-right">
                                {l.intent && <p className="text-xs font-bold capitalize text-[#0a8c35]">{l.intent}</p>}
                                <p className="text-xs text-slate-400">{timeAgo(l.updated_at)}</p>
                            </div>
                        </Link>
                    ))}
                </Panel>
            </div>
        </div>
    )
}

function Kpi({ label, value, hint, href, accent }: { label: string; value: string | number; hint: string; href: string; accent: string }) {
    return (
        <Link href={href} className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-6">
            <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 truncate text-2xl font-black text-[#102216] md:text-3xl">{value}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-slate-300 transition-colors group-hover:text-[#0a8c35]" />
        </Link>
    )
}

function Panel({ title, icon: Icon, href, empty, children }: { title: string; icon: typeof ShoppingCart; href: string; empty: string; children: React.ReactNode[] }) {
    return (
        <section className="rounded-3xl bg-white p-4 shadow-sm md:p-6">
            <div className="mb-2 flex items-center justify-between px-3">
                <h2 className="flex items-center gap-2 text-lg font-black text-[#102216]"><Icon className="h-5 w-5 text-[#13ec5b]" /> {title}</h2>
                <Link href={href} className="text-sm font-bold text-[#0a8c35] hover:underline">Ver todo</Link>
            </div>
            {children.length ? children : <p className="px-3 py-8 text-center text-sm text-slate-500">{empty}</p>}
        </section>
    )
}
