'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { ArrowUpRight, Calendar, Images, Loader2, MapPin, Plus, Ruler, Sparkles } from 'lucide-react'
import { briefExcerpt, formatCOP, formatDate, projectName, statusClass, statusLabel } from '@/lib/projects/display'

interface Project {
    id: string
    title: string
    project_type: string
    briefing: string | null
    description: string
    status: string
    estimated_cost: number
    extracted_variables: { square_meters?: number; location?: string; project_type?: string } | null
    created_at: string
    cover: string | null
    renderCount: number
}

const FILTERS = [
    { id: 'all', label: 'Todos', statuses: null },
    { id: 'quote', label: 'Cotizaciones', statuses: ['cotizacion'] },
    { id: 'active', label: 'En curso', statuses: ['aprobado', 'en_diseno', 'en_produccion', 'instalado'] },
    { id: 'done', label: 'Finalizados', statuses: ['finalizado'] },
] as const

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }
        if (user) fetchProjects()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, router])

    async function fetchProjects() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*, project_renders(image_url, is_selected, version)')
                .eq('client_id', user!.id)
                .order('created_at', { ascending: false })
            if (error) throw error

            type Row = Omit<Project, 'cover' | 'renderCount'> & {
                project_renders: { image_url: string; is_selected: boolean; version: number }[] | null
                metadata: { render_image?: string; render_images?: unknown[] } | null
            }
            setProjects(((data || []) as unknown as Row[]).map(p => {
                // Cover: selected render, then the newest one, then what the image route stored in metadata
                const renders = [...(p.project_renders || [])].sort((a, b) => (b.version || 0) - (a.version || 0))
                const cover = renders.find(r => r.is_selected)?.image_url || renders[0]?.image_url || p.metadata?.render_image || null
                const renderCount = Math.max(renders.length, p.metadata?.render_images?.length || 0)
                return { ...p, cover, renderCount }
            }))
        } catch (err) {
            const { name, message } = err as Error
            if (name === 'AbortError' || message?.includes('AbortError')) return
            console.error('Error fetching projects:', err)
            setError(message || 'Error al cargar proyectos')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#0c1a11]">
                <Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" />
            </div>
        )
    }

    const firstName = (user?.full_name || user?.email || '').split(/[\s@]/)[0]
    const featured = projects[0]
    const activeFilter = FILTERS.find(f => f.id === filter)!
    const visible = activeFilter.statuses
        ? projects.filter(p => (activeFilter.statuses as readonly string[]).includes(p.status))
        : projects.slice(1) // the newest one is already the featured card
    const inProgress = projects.filter(p => (FILTERS[2].statuses as readonly string[]).includes(p.status)).length

    return (
        <div className="min-h-screen bg-[#0c1a11] text-white font-display relative overflow-hidden">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#13ec5b]/10 blur-[140px]" />
                <div className="absolute top-[40%] -right-40 h-[480px] w-[480px] rounded-full bg-[#0a8c35]/15 blur-[140px]" />
            </div>

            {/* Top bar */}
            <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
                <Link href="/" className="transition-opacity hover:opacity-80">
                    <Logo className="h-9 w-auto" />
                </Link>
                <Link
                    href="/cotizar"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[#13ec5b] px-5 text-sm font-bold text-[#102216] shadow-[0_4px_24px_rgba(19,236,91,0.25)] transition-transform hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nueva cotización</span>
                </Link>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6">
                {/* Greeting */}
                <section className="mb-10 mt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#13ec5b]">Mi espacio</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                        Hola{firstName ? `, ${firstName}` : ''}.
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg text-white/60">
                        Aquí viven tus propuestas: el render de cada idea, la inversión y el avance hasta que esté instalada.
                    </p>
                </section>

                {error && (
                    <div className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-red-200">{error}</div>
                )}

                {!featured ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Featured: latest project, its render is the hero */}
                        <Link
                            href={`/projects/${featured.id}`}
                            className="group relative block h-[440px] overflow-hidden rounded-[2rem] ring-1 ring-white/10 md:h-[520px]"
                        >
                            {featured.cover ? (
                                <img
                                    src={featured.cover}
                                    alt={projectName(featured)}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                                />
                            ) : (
                                <CoverPlaceholder />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

                            <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2 md:left-10 md:top-10">
                                <span className="rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                                    Último proyecto
                                </span>
                                <StatusPill status={featured.status} />
                            </div>

                            <div className="absolute inset-x-6 bottom-6 flex flex-col gap-6 md:inset-x-10 md:bottom-10 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-2xl">
                                    <h2 className="text-3xl font-black tracking-tight drop-shadow-lg md:text-5xl">{projectName(featured)}</h2>
                                    {featured.briefing && (
                                        <p className="mt-3 line-clamp-2 text-white/75 drop-shadow md:text-lg">{briefExcerpt(featured.briefing, 200)}</p>
                                    )}
                                    <Meta project={featured} className="mt-4 text-white/70" />
                                </div>
                                <div className="flex items-end justify-between gap-6 md:flex-col md:items-end">
                                    <div className="md:text-right">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Inversión estimada</p>
                                        <p className="text-3xl font-black text-[#13ec5b] drop-shadow-[0_0_18px_rgba(19,236,91,0.35)] md:text-4xl">
                                            {formatCOP(featured.estimated_cost)}
                                        </p>
                                    </div>
                                    <span className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#102216] transition-colors group-hover:bg-[#13ec5b]">
                                        Ver propuesta <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Stats */}
                        <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl md:grid-cols-4">
                            {[
                                { label: 'Proyectos', value: projects.length },
                                { label: 'En curso', value: inProgress },
                                { label: 'Finalizados', value: projects.filter(p => p.status === 'finalizado').length },
                                { label: 'Valor cotizado', value: formatCOP(projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)) },
                            ].map((stat, i) => (
                                <div key={stat.label} className={`px-6 py-5 ${i % 2 ? 'border-l border-white/10' : ''} ${i > 1 ? 'border-t border-white/10 md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/45">{stat.label}</p>
                                    <p className="mt-1 truncate text-2xl font-black md:text-3xl">{stat.value}</p>
                                </div>
                            ))}
                        </section>

                        {/* All projects */}
                        {projects.length > 1 && (
                            <section className="mt-16">
                                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">Todos mis proyectos</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {FILTERS.map(f => {
                                            const count = f.statuses ? projects.filter(p => (f.statuses as readonly string[]).includes(p.status)).length : projects.length
                                            return (
                                                <button
                                                    key={f.id}
                                                    onClick={() => setFilter(f.id)}
                                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === f.id ? 'bg-[#13ec5b] text-[#102216]' : 'bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10'}`}
                                                >
                                                    {f.label} <span className="opacity-60">{count}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {visible.length === 0 ? (
                                    <p className="rounded-3xl bg-white/[0.03] px-6 py-12 text-center text-white/50 ring-1 ring-white/10">
                                        No hay proyectos en este estado.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {visible.map(project => <ProjectCard key={project.id} project={project} />)}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.id}`}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] hover:ring-[#13ec5b]/40"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {project.cover ? (
                    <img
                        src={project.cover}
                        alt={projectName(project)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <CoverPlaceholder />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4">
                    <StatusPill status={project.status} />
                </div>
                {project.renderCount > 1 && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                        <Images className="h-3.5 w-3.5" /> {project.renderCount}
                    </span>
                )}
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                    <h3 className="text-xl font-black leading-tight drop-shadow-lg">{projectName(project)}</h3>
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-white/15 backdrop-blur-md transition-colors group-hover:bg-[#13ec5b] group-hover:text-[#102216]">
                        <ArrowUpRight className="h-4 w-4" />
                    </span>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
                {project.briefing && <p className="line-clamp-2 text-sm text-white/60">{briefExcerpt(project.briefing)}</p>}
                <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                    <Meta project={project} className="text-xs text-white/50" />
                    <p className="whitespace-nowrap text-lg font-black text-[#13ec5b]">{formatCOP(project.estimated_cost)}</p>
                </div>
            </div>
        </Link>
    )
}

function Meta({ project, className = '' }: { project: Project; className?: string }) {
    const vars = project.extracted_variables || {}
    return (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${className}`}>
            {vars.square_meters ? <span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />{vars.square_meters} m²</span> : null}
            {vars.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{vars.location}</span>}
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(project.created_at)}</span>
        </div>
    )
}

function StatusPill({ status }: { status: string }) {
    return (
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 backdrop-blur-md ${statusClass(status)}`}>
            {statusLabel(status)}
        </span>
    )
}

function CoverPlaceholder() {
    return (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(19,236,91,0.25),transparent_55%),linear-gradient(135deg,#123020,#0c1a11)]">
            <Sparkles className="h-12 w-12 text-[#13ec5b]/40" />
        </div>
    )
}

function EmptyState() {
    return (
        <section className="relative overflow-hidden rounded-[2rem] px-6 py-20 text-center ring-1 ring-white/10 md:py-28">
            <CoverPlaceholder />
            <div className="relative">
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">Tu primera propuesta está a un audio de distancia</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                    Cuéntale a la IA qué quieres construir y recibe un render y una cotización en minutos.
                </p>
                <Link
                    href="/cotizar"
                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#13ec5b] px-7 font-bold text-[#102216] shadow-[0_4px_24px_rgba(19,236,91,0.3)] transition-transform hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5" /> Crear mi primera cotización
                </Link>
            </div>
        </section>
    )
}
