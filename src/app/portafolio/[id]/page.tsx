'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface PortfolioProject {
    id: string
    title: string
    description: string
    featured_image_url: string
    gallery_images: string[]
    tags: string[]
    is_featured: boolean
    published_at: string
}

function Eyebrow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#13ec5b] ${className}`}>
            <span className="h-px w-10 bg-[#13ec5b]" />
            {children}
        </div>
    )
}

export default function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [project, setProject] = useState<PortfolioProject | null>(null)
    const [related, setRelated] = useState<PortfolioProject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    useEffect(() => {
        fetchProject()
    }, [id])

    async function fetchProject() {
        try {
            setLoading(true)
            const response = await fetch(`/api/portfolio/${id}`)
            if (!response.ok) {
                setError(true)
                return
            }
            const { data } = await response.json()
            if (!data) {
                setError(true)
                return
            }
            setProject(data)
            fetchRelated(data)
        } catch (err) {
            console.error('Error fetching portfolio project:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    // Same category first, then the rest, so there are always 3 suggestions
    async function fetchRelated(current: PortfolioProject) {
        try {
            const response = await fetch('/api/portfolio')
            const { data } = await response.json()
            const others: PortfolioProject[] = (data || []).filter((p: PortfolioProject) => p.id !== current.id)
            const sameCategory = others.filter((p) => p.tags?.[0] === current.tags?.[0])
            setRelated([...sameCategory, ...others.filter((p) => !sameCategory.includes(p))].slice(0, 3))
        } catch (err) {
            console.error('Error fetching related projects:', err)
        }
    }

    const allImages = project ? [
        ...(project.featured_image_url ? [project.featured_image_url] : []),
        ...(project.gallery_images || []).filter((img) => img !== project.featured_image_url)
    ] : []

    // Lightbox keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null)
            if (e.key === 'ArrowRight') setLightboxIndex((i) => i === null ? i : (i + 1) % allImages.length)
            if (e.key === 'ArrowLeft') setLightboxIndex((i) => i === null ? i : (i - 1 + allImages.length) % allImages.length)
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKey)
        }
    }, [lightboxIndex, allImages.length])

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f1f4ef] text-[#0b130e] font-display">
                <Header />
                <section className="bg-[#09110c]">
                    <div className="mx-auto grid max-w-[1500px] animate-pulse items-center gap-12 px-6 py-20 md:px-10 lg:grid-cols-12 lg:px-16 lg:py-28">
                        <div className="space-y-6 lg:col-span-5">
                            <div className="h-3 w-40 rounded bg-white/10" />
                            <div className="h-16 w-full rounded bg-white/10" />
                            <div className="h-16 w-2/3 rounded bg-white/10" />
                        </div>
                        <div className="aspect-[4/3] rounded-[28px] bg-white/10 lg:col-span-7" />
                    </div>
                </section>
                <Footer />
            </main>
        )
    }

    if (error || !project) {
        return (
            <main className="min-h-screen bg-[#f1f4ef] text-[#0b130e] font-display">
                <Header />
                <div className="mx-auto max-w-[1500px] px-6 py-28 text-center md:px-10 lg:px-16">
                    <h1 className="mb-6 text-4xl font-black tracking-[-0.04em]">Proyecto no encontrado</h1>
                    <p className="mb-8 text-lg text-[#0b130e]/60">El proyecto que buscas no existe o no está publicado.</p>
                    <Link
                        href="/portafolio"
                        className="inline-flex items-center gap-3 rounded-full bg-[#13ec5b] px-6 py-3.5 text-sm font-black text-[#07110a] transition-transform hover:-translate-y-1"
                    >
                        <ArrowLeft size={18} /> Volver al portafolio
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    const cover = allImages[0] || '/placeholder.jpg'
    const category = project.tags?.[0] || 'Proyecto'
    const areas = (project.tags || []).slice(1)
    const monthYear = project.published_at
        ? new Date(project.published_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
        : ''
    const date = monthYear ? monthYear[0].toUpperCase() + monthYear.slice(1) : null

    // Description format: "## Heading" lines become section titles, short "Clave: valor" lines go to the project sheet
    const rawLines = project.description ? project.description.split('\n') : []
    const customDetails: { key: string, value: string }[] = []
    const narrativeParagraphs: string[] = []

    rawLines.forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed) return

        const match = trimmed.match(/^([^:]{2,30}):\s*(.+)$/)
        // Only treat as a detail field if the key string looks like a short title (no periods, decent length)
        if (match && !match[1].includes('.') && match[2].length < 150) {
            customDetails.push({ key: match[1].trim(), value: match[2].trim() })
        } else {
            narrativeParagraphs.push(trimmed)
        }
    })

    const client = customDetails.find((d) => d.key.toLowerCase() === 'cliente')?.value

    return (
        <main className="min-h-screen bg-[#f1f4ef] text-[#0b130e] font-display">
            <Header />

            {/* Hero: blurred backdrop + uncropped cover, so small or portrait images still look sharp */}
            <section className="relative isolate overflow-hidden bg-[#09110c] text-white" data-assistant-section="case-study">
                <img
                    src={cover}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-30 blur-3xl"
                />
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(19,236,91,0.18),transparent_27%),linear-gradient(90deg,#09110c_30%,rgba(9,17,12,0.75))]" />

                <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16 lg:py-24">
                    <div className="order-2 lg:order-1 lg:col-span-5">
                        <Link href="/portafolio" className="mb-10 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-[#13ec5b]">
                            <ArrowLeft size={16} /> Portafolio
                        </Link>
                        <Eyebrow className="mb-6">{category}</Eyebrow>
                        <h1 className="text-[clamp(2.6rem,5vw,4.75rem)] font-black leading-[0.92] tracking-[-0.055em]">
                            {project.title}
                        </h1>
                        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/12 pt-7 sm:grid-cols-3">
                            {client && (
                                <div>
                                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/45">Cliente</dt>
                                    <dd className="mt-1.5 font-bold">{client}</dd>
                                </div>
                            )}
                            {date && (
                                <div>
                                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/45">Fecha</dt>
                                    <dd className="mt-1.5 font-bold">{date}</dd>
                                </div>
                            )}
                            {allImages.length > 1 && (
                                <div>
                                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/45">Galería</dt>
                                    <dd className="mt-1.5 font-bold">{allImages.length} fotos</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="order-1 flex justify-center lg:order-2 lg:col-span-7 lg:justify-end">
                        <button
                            onClick={() => allImages.length && setLightboxIndex(0)}
                            aria-label="Ampliar imagen principal"
                            className="group relative cursor-zoom-in overflow-hidden rounded-[28px] shadow-2xl shadow-black/50 ring-1 ring-white/10"
                        >
                            <img
                                src={cover}
                                alt={project.title}
                                className="block h-auto max-h-[72vh] w-auto max-w-full object-contain transition duration-700 ease-out group-hover:scale-[1.02]"
                            />
                            <span className="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-[#13ec5b] text-[#07110a] opacity-0 transition-opacity group-hover:opacity-100">
                                <ZoomIn size={20} />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Story + project sheet */}
            <section className="mx-auto max-w-[1500px] px-6 py-20 md:px-10 lg:px-16 lg:py-28" data-assistant-section="process">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
                    <div className="lg:col-span-7">
                        <Eyebrow className="mb-8 !text-[#0a8c35] [&>span]:!bg-[#0a8c35]">Sobre el proyecto</Eyebrow>
                        {narrativeParagraphs.length > 0 ? (
                            <div className="space-y-6 text-lg leading-8 text-[#0b130e]/70 md:text-xl md:leading-9">
                                {narrativeParagraphs.map((paragraph, i) => paragraph.startsWith('## ') ? (
                                    <h2 key={i} className="!mt-14 text-3xl font-black tracking-[-0.04em] text-[#0b130e] first:!mt-0 md:text-4xl">
                                        {paragraph.slice(3)}
                                    </h2>
                                ) : (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-lg italic text-[#0b130e]/50">Sin descripción detallada.</p>
                        )}
                    </div>

                    <aside className="lg:col-span-5">
                        <div className="rounded-[28px] bg-[#0b130e] p-8 text-white lg:sticky lg:top-[150px] xl:top-[110px] md:p-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#13ec5b]">Ficha del proyecto</span>
                            <dl className="mt-6 divide-y divide-white/10">
                                {customDetails.map((detail, idx) => (
                                    <div key={idx} className="flex justify-between gap-6 py-4">
                                        <dt className="shrink-0 text-sm text-white/45">{detail.key}</dt>
                                        <dd className="text-right font-bold">{detail.value}</dd>
                                    </div>
                                ))}
                                <div className="flex justify-between gap-6 py-4">
                                    <dt className="text-sm text-white/45">Categoría</dt>
                                    <dd className="text-right font-bold">{category}</dd>
                                </div>
                                {date && (
                                    <div className="flex justify-between gap-6 py-4">
                                        <dt className="text-sm text-white/45">Fecha</dt>
                                        <dd className="text-right font-bold">{date}</dd>
                                    </div>
                                )}
                            </dl>

                            {areas.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                                    {areas.map((tag) => (
                                        <span key={tag} className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#61f694]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <Link
                                href="/cotizar"
                                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#13ec5b] px-6 py-3.5 text-sm font-black text-[#07110a] transition-transform hover:-translate-y-1"
                            >
                                Cotizar algo similar <ArrowUpRight size={18} />
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Gallery: masonry columns keep every photo uncropped */}
            {allImages.length > 1 && (
                <section className="mx-auto max-w-[1500px] px-6 pb-20 md:px-10 lg:px-16 lg:pb-28" data-assistant-section="portfolio">
                    <div className="mb-10 flex items-end justify-between gap-6 border-t border-[#132219]/10 pt-10">
                        <h2 className="text-4xl font-black tracking-[-0.045em] md:text-5xl">Galería</h2>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0b130e]/45">{allImages.length} fotos</span>
                    </div>
                    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setLightboxIndex(idx)}
                                aria-label={`Ampliar imagen ${idx + 1}`}
                                className="group relative mb-5 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-[22px] bg-[#102216]"
                            >
                                <img
                                    src={img}
                                    alt={`${project.title}, imagen ${idx + 1}`}
                                    loading="lazy"
                                    className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.045]"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25" />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Related projects, same card language as /portafolio */}
            {related.length > 0 && (
                <section className="mx-auto max-w-[1500px] px-6 pb-20 md:px-10 lg:px-16 lg:pb-28">
                    <div className="mb-10 flex items-end justify-between gap-6 border-t border-[#132219]/10 pt-10">
                        <h2 className="text-4xl font-black tracking-[-0.045em] md:text-5xl">Más proyectos</h2>
                        <Link href="/portafolio" className="inline-flex items-center gap-2 text-sm font-black text-[#0a8c35] transition-transform hover:-translate-y-0.5">
                            Ver todos <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                        {related.map((p) => (
                            <Link key={p.id} href={`/portafolio/${p.id}`} className="group relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#102216]">
                                <img
                                    src={p.featured_image_url || p.gallery_images?.[0] || '/placeholder.jpg'}
                                    alt={p.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/12 to-black/5" />
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                    <div>
                                        <span className="mb-3 inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#61f694] backdrop-blur-md">
                                            {p.tags?.[0] || 'Proyecto'}
                                        </span>
                                        <h3 className="text-xl font-bold leading-tight tracking-[-0.035em] text-white">{p.title}</h3>
                                    </div>
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#13ec5b] text-[#07110a] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                        <ArrowUpRight size={18} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="mx-auto max-w-[1500px] px-6 pb-20 md:px-10 lg:px-16 lg:pb-28" data-assistant-section="cta">
                <div className="grid gap-8 overflow-hidden rounded-[32px] bg-[#0b130e] px-7 py-10 text-white md:grid-cols-[1fr_auto] md:items-end md:px-12 md:py-12">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#13ec5b]">¿Te gustaría un proyecto similar?</span>
                        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">Creamos una propuesta a la medida de tu marca.</h2>
                    </div>
                    <Link href="/cotizar" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#13ec5b] px-6 py-3.5 text-sm font-black text-[#07110a] transition-transform hover:-translate-y-1">
                        Cotizar proyecto <ArrowUpRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-16"
                    onClick={() => setLightboxIndex(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={project.title}
                >
                    <button
                        className="absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        onClick={() => setLightboxIndex(null)}
                        aria-label="Cerrar"
                    >
                        <X size={22} />
                    </button>
                    <img
                        src={allImages[lightboxIndex]}
                        alt={`${project.title}, imagen ${lightboxIndex + 1}`}
                        className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {allImages.length > 1 && (
                        <>
                            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tabular-nums text-white">
                                {lightboxIndex + 1} / {allImages.length}
                            </span>
                            <button
                                className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8"
                                aria-label="Imagen anterior"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
                                }}
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8"
                                aria-label="Imagen siguiente"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setLightboxIndex((lightboxIndex + 1) % allImages.length)
                                }}
                            >
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}
                </div>
            )}

            <Footer />
        </main>
    )
}
