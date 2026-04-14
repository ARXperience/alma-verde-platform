'use client'

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useState, useEffect, use } from "react"
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
        project_type?: string
        metadata?: any
    }
}

export default function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [project, setProject] = useState<PortfolioProject | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    useEffect(() => {
        fetchProject()
    }, [id])

    async function fetchProject() {
        try {
            setLoading(true)
            const res = await fetch(`/api/portfolio/${id}`)
            if (!res.ok) {
                setError(true)
                return
            }
            const { data } = await res.json()
            if (!data) {
                setError(true)
                return
            }
            setProject(data)
        } catch (err) {
            console.error('Error fetching portfolio project:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
                <Header />
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="h-12 w-96 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    if (error || !project) {
        return (
            <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
                <Header />
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 text-center">
                    <h1 className="text-4xl font-black mb-6">Proyecto no encontrado</h1>
                    <p className="text-[#61896f] text-lg mb-8">El proyecto que buscas no existe o no está publicado.</p>
                    <Link
                        href="/portafolio"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#13ec5b] text-[#102216] rounded-full font-bold hover:bg-[#10d450] transition-all shadow-lg shadow-[#13ec5b]/20"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver al Portafolio
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    const allImages = [
        ...(project.featured_image_url ? [project.featured_image_url] : []),
        ...(project.gallery_images || []).filter(img => img !== project.featured_image_url)
    ]
    const category = project.tags?.[0] || 'Proyecto'

    // Parse description for Key: Value pairs like "Cliente: Nike"
    const rawLines = project.description ? project.description.split('\n') : [];
    const customDetails: { key: string, value: string }[] = [];
    const narrativeParagraphs: string[] = [];

    rawLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const match = trimmed.match(/^([^:]{2,30}):\s*(.+)$/);
        // Only treat as a detail field if the key string looks like a short title (no periods, decent length)
        if (match && !match[1].includes('.') && match[2].length < 150) {
            customDetails.push({ key: match[1].trim(), value: match[2].trim() });
        } else {
            narrativeParagraphs.push(trimmed);
        }
    });

    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />

            {/* Hero Section */}
            <section className="relative w-full aspect-[21/9] max-h-[600px] overflow-hidden">
                <img
                    src={project.featured_image_url || allImages[0] || '/placeholder.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
                    <span className="inline-block px-4 py-1.5 bg-[#13ec5b] text-[#102216] text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                        {category}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight tracking-tighter">
                        {project.title}
                    </h1>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-20">
                {/* Back link */}
                <Link
                    href="/portafolio"
                    className="inline-flex items-center gap-2 text-[#61896f] hover:text-[#13ec5b] transition-colors mb-12 group"
                >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-sm font-medium">Volver al Portafolio</span>
                </Link>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                    {/* Left Column: Description */}
                    <div className="lg:col-span-8">
                        {narrativeParagraphs.length > 0 ? (
                            <>
                                <h2 className="text-3xl font-black mb-8 font-display">Sobre el proyecto</h2>
                                <div className="space-y-6 text-lg text-[#61896f] leading-relaxed">
                                    {narrativeParagraphs.map((paragraph, i) => (
                                        <p 
                                            key={i} 
                                            className={i === 0 ? "first-letter:text-6xl first-letter:font-black first-letter:text-[#13ec5b] first-letter:mr-2 first-letter:float-left first-letter:leading-none" : ""}
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-lg text-[#61896f] italic">Sin descripción detallada.</p>
                        )}
                    </div>
                    
                    {/* Right Column: Project Details Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-[#102216]/80 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-xl lg:sticky lg:top-32 relative overflow-hidden">
                            {/* Decorative blur */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#13ec5b] rounded-full blur-[60px] opacity-20" />
                            
                            <h3 className="text-xl font-bold mb-8 font-display flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#13ec5b]">info</span>
                                Detalles
                            </h3>
                            
                            <div className="space-y-6 relative z-10">
                                {customDetails.map((detail, idx) => (
                                    <div key={idx} className="group">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            {detail.key}
                                        </p>
                                        <p className="font-medium text-lg text-slate-800 dark:text-slate-200 group-hover:text-[#13ec5b] transition-colors leading-snug">
                                            {detail.value}
                                        </p>
                                    </div>
                                ))}

                                <div className="group">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">category</span>
                                        Categoría
                                    </p>
                                    <p className="font-medium text-lg text-slate-800 dark:text-slate-200 group-hover:text-[#13ec5b] transition-colors">
                                        {category}
                                    </p>
                                </div>
                                
                                {project.tags && project.tags.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">label</span>
                                            Etiquetas
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-4 py-1.5 bg-[#f6f8f6] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium rounded-full hover:border-[#13ec5b] transition-colors cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {project.published_at && (
                                    <div className="group">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            Fecha
                                        </p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                            {new Date(project.published_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                {allImages.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#13ec5b]">photo_library</span>
                            Galería del Proyecto
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxImage(img)}
                                    className={`relative group overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#13ec5b]/10 ${
                                        idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-[16/10]' : 'aspect-[4/3]'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${project.title} — imagen ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                                            zoom_in
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102216] to-[#1a3a28] p-12 md:p-16 text-center">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#13ec5b] rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#13ec5b] rounded-full blur-[160px]" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            ¿Te gustaría un proyecto similar?
                        </h2>
                        <p className="text-[#61896f] text-lg mb-8 max-w-xl mx-auto">
                            Nuestro equipo de diseño puede crear una propuesta personalizada para tu marca con materiales sostenibles.
                        </p>
                        <Link
                            href="/cotizar"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#13ec5b] text-[#102216] rounded-full font-bold text-lg hover:bg-[#10d450] transition-all shadow-lg shadow-[#13ec5b]/30 hover:shadow-[#13ec5b]/50 hover:-translate-y-0.5"
                        >
                            Cotizar un proyecto similar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer backdrop-blur-sm"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                        onClick={() => setLightboxImage(null)}
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <img
                        src={lightboxImage}
                        alt={project.title}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {/* Navigation arrows */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const currentIdx = allImages.indexOf(lightboxImage)
                                    const prevIdx = (currentIdx - 1 + allImages.length) % allImages.length
                                    setLightboxImage(allImages[prevIdx])
                                }}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const currentIdx = allImages.indexOf(lightboxImage)
                                    const nextIdx = (currentIdx + 1) % allImages.length
                                    setLightboxImage(allImages[nextIdx])
                                }}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </>
                    )}
                </div>
            )}

            <Footer />
        </main>
    )
}
