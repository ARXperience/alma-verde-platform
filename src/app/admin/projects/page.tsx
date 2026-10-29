'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, Columns3, List, Loader2, Sparkles } from 'lucide-react'
import { FilterChip, PageHeader, ProjectThumb, SearchBox, StatusBadge } from '@/components/admin/ui'
import { PROJECT_STEPS, formatCOP, formatDate, projectName, statusLabel, timeAgo } from '@/lib/projects/display'

interface Project {
    id: string
    title: string
    project_number: string | null
    project_type: string
    status: string
    estimated_cost: number
    created_at: string
    extracted_variables: { project_type?: string; square_meters?: number; location?: string } | null
    metadata: { render_image?: string } | null
    client: { full_name: string | null; email: string } | null
}

const ALL_STATUSES = [...PROJECT_STEPS.map(s => s.id), 'cancelado'] as string[]

// useSearchParams needs a Suspense boundary in a statically rendered page
export default function AdminProjectsPage() {
    return (
        <Suspense>
            <ProjectsView />
        </Suspense>
    )
}

function ProjectsView() {
    // Deep links from the dashboard: /admin/projects?status=cotizacion opens that stage as a list
    const linkedStatus = useSearchParams().get('status')
    const initialStatus = linkedStatus && ALL_STATUSES.includes(linkedStatus) ? linkedStatus : 'all'
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState(initialStatus)
    const [view, setView] = useState<'board' | 'list'>(initialStatus === 'all' ? 'board' : 'list')
    const [moving, setMoving] = useState<string | null>(null)

    useEffect(() => {
        supabase.from('projects')
            .select('id, title, project_number, project_type, status, estimated_cost, created_at, extracted_variables, metadata, client:users!projects_client_id_fkey(full_name, email)')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) console.error('Error fetching projects:', error)
                setProjects((data || []) as unknown as Project[])
                setLoading(false)
            })
    }, [])

    async function moveTo(project: Project, status: string) {
        setMoving(project.id)
        const { error } = await (supabase.from('projects') as any).update({ status }).eq('id', project.id)
        if (error) alert('No se pudo cambiar el estado: ' + error.message)
        else setProjects(list => list.map(p => (p.id === project.id ? { ...p, status } : p)))
        setMoving(null)
    }

    const term = search.trim().toLowerCase()
    const matches = projects.filter(p =>
        !term ||
        [projectName(p), p.project_number, p.client?.full_name, p.client?.email, p.extracted_variables?.location]
            .some(v => v?.toLowerCase().includes(term))
    )
    const visible = statusFilter === 'all' ? matches : matches.filter(p => p.status === statusFilter)
    const count = (status: string) => matches.filter(p => p.status === status).length

    return (
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow="Ventas"
                title="Proyectos"
                description="Cotizaciones del cotizador IA y proyectos en marcha"
                actions={
                    <div className="flex rounded-xl bg-white p-1 shadow-sm">
                        {([['board', Columns3, 'Tablero'], ['list', List, 'Lista']] as const).map(([id, Icon, label]) => (
                            <button
                                key={id}
                                onClick={() => setView(id)}
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${view === id ? 'bg-[#102216] text-white' : 'text-slate-500 hover:text-[#102216]'}`}
                            >
                                <Icon className="h-4 w-4" /> {label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar proyecto, cliente o ciudad…" />
                <div className="flex flex-wrap gap-2">
                    <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="Todos" count={matches.length} />
                    {ALL_STATUSES.map(status => (
                        <FilterChip key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)} label={statusLabel(status)} count={count(status)} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : projects.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
                    <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#13ec5b]" />
                    <p className="font-bold text-[#102216]">Aún no hay proyectos</p>
                    <p className="text-sm text-slate-500">Las cotizaciones del cotizador IA aparecerán aquí.</p>
                </div>
            ) : view === 'board' ? (
                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    {(statusFilter === 'all' ? PROJECT_STEPS.map(s => s.id) : [statusFilter]).map(status => {
                        const column = visible.filter(p => p.status === status)
                        const step = PROJECT_STEPS.find(s => s.id === status)
                        return (
                            <section key={status} className="flex w-72 flex-none flex-col rounded-3xl bg-slate-100/80 p-3">
                                <header className="mb-3 flex items-center justify-between px-2 pt-1">
                                    <span className="flex items-center gap-2 text-sm font-bold text-[#102216]">
                                        <span className={`h-2.5 w-2.5 rounded-full ${step?.dot || 'bg-red-400'}`} />
                                        {statusLabel(status)}
                                        <span className="font-semibold text-slate-400">{column.length}</span>
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">{formatCOP(column.reduce((s, p) => s + (p.estimated_cost || 0), 0))}</span>
                                </header>
                                <div className="space-y-3">
                                    {column.map(p => <BoardCard key={p.id} project={p} moving={moving === p.id} onMove={moveTo} />)}
                                    {column.length === 0 && <p className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Sin proyectos</p>}
                                </div>
                            </section>
                        )
                    })}
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    {visible.length === 0 && <p className="p-12 text-center text-slate-500">No se encontraron proyectos.</p>}
                    {visible.map(p => (
                        <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50">
                            <ProjectThumb src={p.metadata?.render_image} alt={projectName(p)} className="h-14 w-20 flex-none rounded-xl" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-[#102216]">{projectName(p)}</p>
                                <p className="truncate text-sm text-slate-500">
                                    {p.client?.full_name || p.client?.email || 'Sin cliente'}
                                    {p.extracted_variables?.location ? ` · ${p.extracted_variables.location}` : ''}
                                </p>
                            </div>
                            <div className="hidden w-32 md:block"><StatusBadge status={p.status} /></div>
                            <p className="hidden w-36 text-right font-black text-[#102216] sm:block">{formatCOP(p.estimated_cost)}</p>
                            <div className="hidden w-32 text-right text-sm text-slate-500 lg:block">
                                <p>{formatDate(p.created_at)}</p>
                                {p.project_number && <p className="font-mono text-xs text-slate-400">{p.project_number}</p>}
                            </div>
                            <ChevronRight className="h-5 w-5 flex-none text-slate-300" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function BoardCard({ project, moving, onMove }: { project: Project; moving: boolean; onMove: (p: Project, status: string) => void }) {
    return (
        <article className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
            <Link href={`/admin/projects/${project.id}`} className="block">
                <div className="relative aspect-video overflow-hidden">
                    <ProjectThumb src={project.metadata?.render_image} alt={projectName(project)} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">{timeAgo(project.created_at)}</span>
                </div>
                <div className="p-3 pb-2">
                    <p className="truncate font-bold text-[#102216]">{projectName(project)}</p>
                    <p className="truncate text-xs text-slate-500">{project.client?.full_name || project.client?.email || 'Sin cliente'}</p>
                    <p className="mt-2 font-black text-[#0a8c35]">{formatCOP(project.estimated_cost)}</p>
                </div>
            </Link>
            <div className="flex items-center gap-2 px-3 pb-3">
                <select
                    value={project.status}
                    disabled={moving}
                    onChange={(e) => onMove(project, e.target.value)}
                    aria-label="Mover a otra etapa"
                    className="h-8 flex-1 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-600 focus:border-[#13ec5b] focus:outline-none"
                >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s === project.status ? statusLabel(s) : `Mover a: ${statusLabel(s)}`}</option>)}
                </select>
                {moving && <Loader2 className="h-4 w-4 animate-spin text-[#13ec5b]" />}
            </div>
        </article>
    )
}

