'use client'

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useState, useEffect } from "react"
import Link from "next/link"

interface PortfolioProject {
    id: string
    title: string
    description: string
    featured_image_url: string
    gallery_images: string[]
    tags: string[]
    is_featured: boolean
    published_at: string
    project?: {
        id: string
        title: string
        metadata?: any
    }
}

const ALL_FILTERS = ['Todos', 'Stands', 'Activaciones', 'Mobiliario', 'Producción gráfica']

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
            const res = await fetch('/api/portfolio')
            const { data } = await res.json()
            setProjects(data || [])
        } catch (err) {
            console.error('Error fetching portfolio:', err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = activeFilter === 'Todos'
        ? projects
        : projects.filter(p => p.tags?.includes(activeFilter))

    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-20">
                {/* Hero */}
                <div className="mb-16 max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
                        Todos los <span className="text-[#13ec5b] italic">proyectos</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#61896f] font-light leading-relaxed">
                        Nuestra selección de stands, activaciones de marca y mobiliario comercial diseñados bajo principios de sostenibilidad y vanguardia estética.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-12 border-b border-slate-200 dark:border-slate-800 pb-6">
                    {ALL_FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                activeFilter === filter
                                    ? 'bg-[#13ec5b] text-[#102216] font-bold shadow-lg shadow-[#13ec5b]/20'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#13ec5b]'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-[#61896f]">No hay proyectos en esta categoría aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((project, i) => (
                            <Link
                                key={project.id}
                                href={`/portafolio/${project.id}`}
                                className={`relative group overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 aspect-[4/5] cursor-pointer ${
                                    project.is_featured && i === 0 ? 'lg:col-span-2' : ''
                                }`}
                            >
                                <img
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src={project.featured_image_url || project.gallery_images?.[0] || '/placeholder.jpg'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#102216]/90 via-[#102216]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                    <span className="text-[#13ec5b] text-xs font-bold uppercase tracking-widest mb-2">
                                        {project.tags?.[0] || 'Proyecto'}
                                    </span>
                                    <h3 className="text-white text-2xl font-bold mb-4">{project.title}</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                                        Ver proyecto <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    )
}
