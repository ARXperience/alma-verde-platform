'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { PaymentButton } from '@/components/payments/PaymentButton'
import { Lightbox } from '@/components/ui/lightbox'
import {
    AlertCircle, ArrowLeft, Check, Clock, Download, FileText, Loader2, MapPin, Maximize2, MessageCircle,
    Palette, Printer, Ruler, Sparkles, Star, Wand2,
} from 'lucide-react'
import { PROJECT_STEPS, briefExcerpt, formatCOP, formatDate, projectName, statusClass, statusLabel } from '@/lib/projects/display'
import type { PricingBreakdown, QuotationVariables } from '@/types/quotation'

interface Project {
    id: string
    title: string
    project_number: string | null
    description: string
    project_type: string
    status: string
    briefing: string | null
    extracted_variables: Partial<QuotationVariables> | null
    pricing_breakdown: Partial<PricingBreakdown> | null
    estimated_cost: number
    created_at: string
    metadata: { render_image?: string; render_images?: { url: string; version?: number }[] } | null
    files?: ProjectFile[]
}

interface ProjectFile {
    id: string
    file_name: string
    file_url: string
    file_size: number
}

type Render = { url: string; version: number }

const VARIANT_IDEAS = ['Más madera natural', 'Iluminación cálida', 'Vista desde arriba', 'Más minimalista', 'Ambientado de noche']

export default function ProjectDetailsPage() {
    const params = useParams()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [renders, setRenders] = useState<Render[]>([])
    const [mainUrl, setMainUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [variantNote, setVariantNote] = useState('')
    const [generating, setGenerating] = useState(false)
    const [renderError, setRenderError] = useState('')

    useEffect(() => {
        if (projectId) fetchProject()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    async function fetchProject() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*, files:project_files(*)')
                .eq('id', projectId)
                .single()
            if (error) throw error
            const loaded = data as unknown as Project
            setProject(loaded)

            // Renders live in project_renders; older projects only have them in metadata
            const { data: rowsData } = await supabase
                .from('project_renders')
                .select('image_url, version, is_selected')
                .eq('project_id', projectId)
                .order('version', { ascending: true })
            const rows = (rowsData || []) as { image_url: string; version: number; is_selected: boolean }[]
            const metadata = loaded.metadata || {}
            const list: Render[] = rows.length
                ? rows.map(r => ({ url: r.image_url, version: r.version }))
                : (metadata.render_images || []).map((img, i) => ({ url: img.url, version: img.version || i + 1 }))
            if (!list.length && metadata.render_image) list.push({ url: metadata.render_image, version: 1 })
            setRenders(list)
            setMainUrl(metadata.render_image || rows.find(r => r.is_selected)?.image_url || list[list.length - 1]?.url || null)
        } catch (err) {
            console.error('Error fetching project:', err)
            const { code, message } = err as { code?: string; message?: string }
            setError(code === 'PGRST116' ? 'Proyecto no encontrado o no tienes permiso para verlo.' : message || 'Error al cargar el proyecto')
        } finally {
            setLoading(false)
        }
    }

    async function generateVersion() {
        if (!project) return
        setGenerating(true)
        setRenderError('')
        try {
            const res = await fetch('/api/quotation/generate-image-multi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    projectDetails: { project_type: project.project_type, ...project.extracted_variables, description: project.briefing },
                    instructions: variantNote,
                }),
            })
            const data = await res.json().catch(() => ({}))
            const url = data.images?.[0]?.url
            if (!res.ok || !url) throw new Error(res.status < 500 && data.error ? data.error : 'No pudimos generar la imagen en este momento. Intenta de nuevo.')
            // The image route makes the newest render the main one
            setRenders(prev => [...prev, { url, version: (prev[prev.length - 1]?.version || 0) + 1 }])
            setMainUrl(url)
            setVariantNote('')
        } catch (err) {
            setRenderError((err as Error).message)
        } finally {
            setGenerating(false)
        }
    }

    async function makeMain(url: string) {
        const previous = mainUrl
        setMainUrl(url)
        const res = await fetch(`/api/projects/${projectId}/renders`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: url }),
        })
        if (!res.ok) {
            setMainUrl(previous)
            setRenderError('No se pudo cambiar la imagen principal. Intenta de nuevo.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#0c1a11]">
                <Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#0c1a11] px-4 text-white">
                <div className="max-w-md rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10">
                    <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-300" />
                    <p className="mb-6 text-white/80">{error || 'Proyecto no encontrado'}</p>
                    <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#13ec5b] px-6 font-bold text-[#102216]">
                        <ArrowLeft className="h-4 w-4" /> Mis proyectos
                    </Link>
                </div>
            </div>
        )
    }

    const vars = project.extracted_variables || {}
    const pricing = project.pricing_breakdown || {}
    const total = pricing.total || project.estimated_cost || 0
    const name = projectName(project)
    const urls = renders.map(r => r.url)
    const mainIndex = mainUrl ? urls.indexOf(mainUrl) : -1
    const stepIndex = PROJECT_STEPS.findIndex(s => s.id === project.status)
    const files = project.files || []

    const costLines: [string, number][] = ([
        ['Diseño y base', pricing.base_cost],
        ['Materiales', pricing.materials_cost],
        ['Transporte', pricing.transport_cost],
        ['Instalación', pricing.installation_cost],
        ['Desmontaje', pricing.disassembly_cost],
    ] as [string, number][]).filter(([, value]) => value > 0)

    const specs = [
        { icon: Ruler, label: 'Área', value: vars.square_meters ? `${vars.square_meters} m²` : null },
        { icon: MapPin, label: 'Ubicación', value: vars.location },
        { icon: Clock, label: 'Producción', value: vars.production_time ? `${vars.production_time} días` : null },
        { icon: Palette, label: 'Estilo', value: vars.style_preferences },
    ].filter(s => s.value)

    const services = [
        vars.requires_transport && 'Transporte',
        vars.requires_installation && 'Instalación',
        vars.requires_disassembly && 'Desmontaje',
    ].filter(Boolean) as string[]

    return (
        <div className="min-h-screen bg-[#0c1a11] font-display text-white print:bg-white print:[&_*]:!text-black">
            {/* Top bar over the hero */}
            <header className="absolute inset-x-0 top-0 z-20 print:static">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
                    <Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-full bg-black/40 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-black/60 print:hidden">
                        <ArrowLeft className="h-4 w-4" /> Mis proyectos
                    </Link>
                    <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full bg-black/40 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-black/60 print:hidden">
                        <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Descargar PDF</span>
                    </button>
                </div>
            </header>

            {/* Hero: the chosen render is the proposal's cover */}
            <section className="relative h-[78vh] min-h-[520px] overflow-hidden print:h-auto print:min-h-0">
                {mainUrl ? (
                    <button className="absolute inset-0 h-full w-full cursor-zoom-in print:static" onClick={() => setLightboxIndex(mainIndex)} aria-label="Ver imagen en grande">
                        <img key={mainUrl} src={mainUrl} alt={name} className="h-full w-full animate-fade-in object-cover" />
                    </button>
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(19,236,91,0.25),transparent_55%),linear-gradient(135deg,#123020,#0c1a11)]" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1a11] via-[#0c1a11]/30 to-black/40" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 print:static">
                    <div className="pointer-events-auto mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-10 sm:px-6 md:flex-row md:items-end md:justify-between md:pb-14">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#13ec5b] backdrop-blur-md">
                                    Propuesta {project.project_number || ''}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 backdrop-blur-md ${statusClass(project.status)}`}>
                                    {statusLabel(project.status)}
                                </span>
                            </div>
                            <h1 className="mt-4 text-4xl font-black tracking-tight drop-shadow-lg md:text-6xl">{name}</h1>
                            {project.briefing && <p className="mt-4 max-w-2xl text-lg text-white/75 drop-shadow">{briefExcerpt(project.briefing, 220)}</p>}
                            <div className="mt-5 flex flex-wrap gap-2">
                                {specs.map(s => (
                                    <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-md">
                                        <s.icon className="h-3.5 w-3.5 text-[#13ec5b]" /> {s.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 md:items-end">
                            <div className="md:text-right">
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Inversión estimada</p>
                                <p className="text-4xl font-black text-[#13ec5b] drop-shadow-[0_0_18px_rgba(19,236,91,0.35)] md:text-5xl">{formatCOP(total)}</p>
                            </div>
                            {mainUrl ? (
                                <button onClick={() => setLightboxIndex(mainIndex)} className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-white px-6 text-sm font-bold text-[#102216] transition-colors hover:bg-[#13ec5b] md:self-end print:hidden">
                                    <Maximize2 className="h-4 w-4" /> Ver en grande
                                </button>
                            ) : (
                                <a href="#propuesta-visual" className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-[#13ec5b] px-6 text-sm font-bold text-[#102216] md:self-end print:hidden">
                                    <Wand2 className="h-4 w-4" /> Generar visualización
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
                {/* Progress */}
                <section className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Estado del proyecto</p>
                    {project.status === 'cancelado' ? (
                        <p className="mt-4 text-red-200">Este proyecto fue cancelado. Escríbenos si quieres retomarlo.</p>
                    ) : (
                        <ol className="mt-6 grid grid-cols-3 gap-y-6 md:grid-cols-6">
                            {PROJECT_STEPS.map((step, i) => {
                                const done = i < stepIndex
                                const current = i === stepIndex
                                return (
                                    <li key={step.id} className="relative flex flex-col items-center text-center">
                                        {i > 0 && <span className={`absolute right-1/2 top-4 hidden h-0.5 w-full md:block ${i <= stepIndex ? 'bg-[#13ec5b]' : 'bg-white/10'}`} />}
                                        <span className={`relative grid h-8 w-8 place-items-center rounded-full text-xs font-black ${current ? 'bg-[#13ec5b] text-[#102216] shadow-[0_0_0_6px_rgba(19,236,91,0.15)]' : done ? 'bg-[#0a8c35] text-white' : 'bg-white/10 text-white/40'}`}>
                                            {done ? <Check className="h-4 w-4" /> : i + 1}
                                        </span>
                                        <span className={`mt-2 text-xs font-semibold md:text-sm ${current ? 'text-white' : done ? 'text-white/70' : 'text-white/35'}`}>{step.label}</span>
                                    </li>
                                )
                            })}
                        </ol>
                    )}
                </section>

                {/* Visual proposal */}
                <section id="propuesta-visual" className="mt-20 scroll-mt-8">
                    <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#13ec5b]">Propuesta visual</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Así podría verse tu proyecto</h2>
                        </div>
                        {renders.length > 0 && (
                            <p className="text-white/50">{renders.length} {renders.length === 1 ? 'versión' : 'versiones'} · toca una para verla en grande</p>
                        )}
                    </div>

                    {(renders.length > 0 || generating) && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {renders.map((render, i) => {
                                const isMain = render.url === mainUrl
                                return (
                                    <figure key={render.url} className={`group relative aspect-video overflow-hidden rounded-2xl ring-2 transition-all ${isMain ? 'ring-[#13ec5b]' : 'ring-white/10 hover:ring-white/30'}`}>
                                        <button className="h-full w-full cursor-zoom-in" onClick={() => setLightboxIndex(i)} aria-label={`Ver versión ${render.version} en grande`}>
                                            <img src={render.url} alt={`${name}, versión ${render.version}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        </button>
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                                            <span className="text-sm font-black drop-shadow">Versión {render.version}</span>
                                            {isMain ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#13ec5b] px-2.5 py-1 text-xs font-bold text-[#102216]">
                                                    <Star className="h-3 w-3 fill-current" /> Principal
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => makeMain(render.url)}
                                                    className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-[#13ec5b] hover:text-[#102216] md:opacity-0 md:group-hover:opacity-100 print:hidden"
                                                >
                                                    Usar como principal
                                                </button>
                                            )}
                                        </figcaption>
                                    </figure>
                                )
                            })}
                            {generating && (
                                <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-[#13ec5b]/50 bg-[#13ec5b]/5 text-center">
                                    <div>
                                        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#13ec5b]" />
                                        <p className="font-semibold">Diseñando una nueva versión…</p>
                                        <p className="text-sm text-white/50">Tarda entre 20 y 40 segundos</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* New version */}
                    <div className="mt-6 rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 md:p-6 print:hidden">
                        <form
                            className="flex flex-col gap-3 md:flex-row"
                            onSubmit={(e) => {
                                e.preventDefault()
                                generateVersion()
                            }}
                        >
                            <input
                                value={variantNote}
                                onChange={(e) => setVariantNote(e.target.value)}
                                disabled={generating}
                                placeholder={renders.length ? '¿Qué cambiarías? Ej: más plantas, colores de mi marca…' : 'Describe algún detalle que quieras ver (opcional)'}
                                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-white placeholder:text-white/35 focus:border-[#13ec5b] focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={generating}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#13ec5b] px-6 font-bold text-[#102216] transition-opacity disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                {renders.length ? 'Generar nueva versión' : 'Generar visualización'}
                            </button>
                        </form>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {VARIANT_IDEAS.map(idea => (
                                <button
                                    key={idea}
                                    type="button"
                                    disabled={generating}
                                    onClick={() => setVariantNote(note => (note ? `${note}, ${idea.toLowerCase()}` : idea))}
                                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    + {idea}
                                </button>
                            ))}
                        </div>
                        {renderError && (
                            <p className="mt-3 flex items-start gap-2 text-sm text-red-300">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" /> {renderError}
                            </p>
                        )}
                    </div>
                </section>

                {/* Concept + investment */}
                <section className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="space-y-10 lg:col-span-7">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#13ec5b]">El concepto</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Lo que nos pediste</h2>
                            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/75">{project.briefing || project.description}</p>
                        </div>

                        {!!vars.materials?.length && (
                            <div>
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">Materiales</h3>
                                <div className="flex flex-wrap gap-2">
                                    {vars.materials.map((m: string) => (
                                        <span key={m} className="rounded-full bg-[#13ec5b]/10 px-4 py-2 text-sm font-medium capitalize text-[#13ec5b] ring-1 ring-[#13ec5b]/25">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(specs.length > 0 || services.length > 0) && (
                            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-3">
                                {[
                                    { label: 'Tipo', value: project.project_type?.replace(/_/g, ' ') },
                                    ...specs,
                                    { label: 'Incluye', value: services.join(', ') || null },
                                    { label: 'Creado', value: formatDate(project.created_at) },
                                ].filter(item => item.value).map(item => (
                                    <div key={item.label} className="bg-[#0f2116] p-5">
                                        <dt className="text-xs font-semibold uppercase tracking-widest text-white/45">{item.label}</dt>
                                        <dd className="mt-1 font-bold capitalize">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {!!vars.special_requirements?.length && (
                            <div>
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">Requerimientos especiales</h3>
                                <ul className="space-y-2">
                                    {vars.special_requirements.map((r: string) => (
                                        <li key={r} className="flex gap-3 text-white/75"><Check className="mt-1 h-4 w-4 flex-none text-[#13ec5b]" /> {r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">Archivos del equipo</h3>
                                <div className="space-y-2">
                                    {files.map(file => (
                                        <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]">
                                            <span className="flex min-w-0 items-center gap-3">
                                                <FileText className="h-5 w-5 flex-none text-[#13ec5b]" />
                                                <span className="truncate font-medium">{file.file_name}</span>
                                            </span>
                                            <Download className="h-4 w-4 flex-none text-white/50" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Investment */}
                    <aside className="lg:col-span-5">
                        <div className="space-y-4 lg:sticky lg:top-8">
                            <div className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 md:p-8">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#13ec5b]">Inversión</p>
                                <div className="mt-6 space-y-3">
                                    {costLines.map(([label, value]) => (
                                        <div key={label} className="flex justify-between gap-4 text-white/70">
                                            <span>{label}</span><span className="font-semibold text-white">{formatCOP(value)}</span>
                                        </div>
                                    ))}
                                    {!!pricing.subtotal && (
                                        <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-white/70">
                                            <span>Subtotal</span><span className="font-semibold text-white">{formatCOP(pricing.subtotal)}</span>
                                        </div>
                                    )}
                                    {!!pricing.tax && (
                                        <div className="flex justify-between gap-4 text-white/70">
                                            <span>IVA</span><span className="font-semibold text-white">{formatCOP(pricing.tax)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-6">
                                    <span className="font-bold">Total</span>
                                    <span className="text-3xl font-black text-[#13ec5b]">{formatCOP(total)}</span>
                                </div>
                                {!!pricing.notes?.length && (
                                    <details className="group mt-6 rounded-2xl bg-black/20 p-4">
                                        <summary className="cursor-pointer list-none text-sm font-semibold text-white/70">
                                            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#13ec5b]" /> Cómo se calculó</span>
                                        </summary>
                                        <ul className="mt-3 space-y-2 text-sm text-white/60">
                                            {pricing.notes.map((note: string) => <li key={note}>· {note}</li>)}
                                        </ul>
                                    </details>
                                )}
                            </div>

                            {total > 0 && project.status !== 'cancelado' && (
                                <div className="rounded-3xl bg-gradient-to-br from-[#13ec5b]/15 to-[#0a8c35]/5 p-6 ring-1 ring-[#13ec5b]/25 md:p-8 print:hidden">
                                    <p className="font-bold">¿Listo para empezar?</p>
                                    <p className="mt-1 text-sm text-white/60">Con un anticipo del 50% iniciamos el diseño y la producción.</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-white/70">Anticipo</span>
                                        <span className="text-xl font-black">{formatCOP(total * 0.5)}</span>
                                    </div>
                                    <PaymentButton
                                        projectId={project.id}
                                        amount={total * 0.5}
                                        label="Pagar anticipo con Bold"
                                        className="mt-4 h-12 w-full rounded-xl bg-[#13ec5b] font-bold text-[#102216] hover:bg-[#13ec5b]/90"
                                    />
                                </div>
                            )}

                            <p className="flex items-center justify-center gap-2 text-sm text-white/50 print:hidden">
                                <MessageCircle className="h-4 w-4" />
                                ¿Quieres ajustar algo? <Link href="/contacto" className="font-semibold text-[#13ec5b] hover:underline">Habla con un asesor</Link>
                            </p>
                        </div>
                    </aside>
                </section>
            </main>

            <div className="print:hidden">
                <Lightbox images={urls} index={lightboxIndex} onChange={setLightboxIndex} alt={name} downloadable />
            </div>
        </div>
    )
}
