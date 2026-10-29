'use client'

import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'

interface LightboxProps {
    images: string[]
    index: number | null
    onChange: (index: number | null) => void
    alt: string
    // Supabase public URLs accept ?download= to be saved as a file instead of opened
    downloadable?: boolean
}

// Full-screen image viewer: Esc closes, arrow keys navigate
export function Lightbox({ images, index, onChange, alt, downloadable }: LightboxProps) {
    const count = images.length

    useEffect(() => {
        if (index === null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onChange(null)
            if (e.key === 'ArrowRight') onChange((index + 1) % count)
            if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count)
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKey)
        }
    }, [index, count, onChange])

    if (index === null || !images[index]) return null
    const src = images[index]
    const button = 'grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-16"
            onClick={() => onChange(null)}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
        >
            <div className="absolute right-6 top-6 flex gap-3">
                {downloadable && (
                    <a
                        href={`${src}${src.includes('?') ? '&' : '?'}download=`}
                        className={button}
                        aria-label="Descargar imagen"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={20} />
                    </a>
                )}
                <button className={button} onClick={() => onChange(null)} aria-label="Cerrar">
                    <X size={22} />
                </button>
            </div>
            <img
                key={src}
                src={src}
                alt={`${alt}, imagen ${index + 1}`}
                className="max-h-[85vh] max-w-full animate-fade-in rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
                <>
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium tabular-nums text-white">
                        {index + 1} / {count}
                    </span>
                    <button
                        className={`absolute left-4 md:left-8 ${button}`}
                        aria-label="Imagen anterior"
                        onClick={(e) => {
                            e.stopPropagation()
                            onChange((index - 1 + count) % count)
                        }}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        className={`absolute right-4 md:right-8 ${button}`}
                        aria-label="Imagen siguiente"
                        onClick={(e) => {
                            e.stopPropagation()
                            onChange((index + 1) % count)
                        }}
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}
        </div>
    )
}
