'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Layers3 } from 'lucide-react'
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

const ALL_FILTERS = ['Todos', 'Stands', 'Activaciones', 'Mobiliario', 'Producción gráfica']

function projectLayout(index: number, featured: boolean) {
    if (featured && index === 0) return 'md:col-span-2 lg:col-span-2 aspect-[16/10]'
    if (index % 7 === 3) return 'lg:row-span-2 min-h-[520px] lg:min-h-[680px]'
    if (index % 7 === 5) return 'md:col-span-2 lg:col-span-2 aspect-[16/9]'
    return 'aspect-[4/5]'
}

export default function PortafolioPage() {
    const [activeFilter, setActiveFilter] = useState('Todos')
    const [projects, setProjects] = useState<PortfolioProject[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPortfolio()
    }, [])

    async function fetchPortfolio() {
        try {
            setLoading(true)
            const response = await fetch('/api/portfolio')
            const { data } = await response.json()
            setProjects(data || [])
        } catch (error) {
            console.error('Error fetching portfolio:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = activeFilter === 'Todos'
        ? projects
        : projects.filter((project) => project.tags?.includes(activeFilter))

    return (
        <main className="min-h-screen bg-[#f1f4ef] text-[#0b130e] font-display">
            <Header />

            <section className="relative isolate overflow-hidden bg-[#09110c] text-white" data-assistant-section="portfolio">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(19,236,91,0.18),transparent_27%),radial-gradient(circle_at_12%_90%,rgba(111,145,119,0.16),transparent_32%)]" />
                <div className="mx-auto grid max-w-[1500px] gap-14 px-6 py-20 md:px-10 lg:grid-cols-[1fr_360px] lg:px-16 lg:py-28">
                    <div className="max-w-5xl">
                        <div className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#13ec5b]">
                            <span className="h-px w-10 bg-[#13ec5b]" />
                            Portafolio seleccionado
                        </div>
                        <h1 className="max-w-5xl text-[clamp(3.4rem,8vw,8rem)] font-black leading-[0.86] tracking-[-0.065em]">
                            Espacios que hacen sentir una marca.
                        </h1>
                        <p className="mt-9 max-w-2xl text-base leading-7 text-white/62 md:text-xl md:leading-8">
                            Diseño, producción y montaje de experiencias físicas creadas para atraer, orientar y permanecer en la memoria.
                        </p>
                    </div>

                    <div className="flex flex-col justify-end border-l border-white/12 pl-8">
                        <Layers3 className="mb-8 text-[#13ec5b]" size={30} strokeWidth={1.5} />
                        <p className="text-sm leading-6 text-white/50">De la primera conversación al último detalle instalado.</p>
                        <div className="mt-8 grid grid-cols-2 gap-5 border-t border-white/12 pt-7">
                            <div>
                                <strong className="block text-3xl font-black">{String(projects.length).padStart(2, '0')}</strong>
                                <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-white/45">Proyectos publicados</span>
                            </div>
                            <div>
                                <strong className="block text-3xl font-black">360°</strong>
                                <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-white/45">Servicio integral</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sticky top-[73px] z-30 border-b border-[#132219]/10 bg-[#f1f4ef]/92 backdrop-blur-xl lg:top-[114px] xl:top-[73px]">
                <div className="mx-auto flex max-w-[1500px] items-center gap-3 overflow-x-auto px-6 py-5 md:px-10 lg:px-16 [scrollbar-width:none]">
                    {ALL_FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                                activeFilter === filter
                                    ? 'bg-[#0b130e] text-white shadow-[0_10px_30px_rgba(8,20,12,0.15)]'
                                    : 'border border-[#132219]/12 bg-white/55 text-[#52645a] hover:border-[#13a94a]/40 hover:text-[#0b130e]'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                    <span className="ml-auto hidden shrink-0 text-xs font-semibold text-[#718078] md:block">
                        {filteredProjects.length} proyectos
                    </span>
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-6 py-12 md:px-10 lg:px-16 lg:py-20" data-assistant-section="portfolio">
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="aspect-[4/5] animate-pulse rounded-[28px] bg-[#dce3dc]" />
                        ))}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="rounded-[32px] border border-[#132219]/10 bg-white px-6 py-24 text-center">
                        <p className="text-xl font-bold">Todavía no hay proyectos en esta categoría.</p>
                        <p className="mt-2 text-sm text-[#68776e]">Explora otra categoría o vuelve pronto.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project, index) => (
                            <Link
                                key={project.id}
                                href={`/portafolio/${project.id}`}
                                className={`group relative min-h-[420px] overflow-hidden rounded-[28px] bg-[#102216] ${projectLayout(index, project.is_featured)}`}
                            >
                                <Image
                                    src={project.featured_image_url || project.gallery_images?.[0] || '/placeholder.jpg'}
                                    alt={project.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/12 to-black/5 transition-colors duration-500 group-hover:from-black/94" />
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 md:p-8">
                                    <div className="max-w-xl">
                                        <span className="mb-3 inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#61f694] backdrop-blur-md">
                                            {project.tags?.[0] || 'Proyecto'}
                                        </span>
                                        <h2 className="text-2xl font-bold leading-tight tracking-[-0.035em] text-white md:text-3xl">{project.title}</h2>
                                        {project.description && (
                                            <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/62">{project.description}</p>
                                        )}
                                    </div>
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#13ec5b] text-[#07110a] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                        <ArrowUpRight size={20} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-[1500px] px-6 pb-20 md:px-10 lg:px-16 lg:pb-28">
                <div className="grid gap-8 overflow-hidden rounded-[32px] bg-[#0b130e] px-7 py-10 text-white md:grid-cols-[1fr_auto] md:items-end md:px-12 md:py-12">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#13ec5b]">Tu proyecto puede ser el siguiente</span>
                        <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">Una idea clara merece un espacio imposible de ignorar.</h2>
                    </div>
                    <Link href="/contacto" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#13ec5b] px-6 py-3.5 text-sm font-black text-[#07110a] transition-transform hover:-translate-y-1">
                        Hablemos <ArrowUpRight size={18} />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    )
}
