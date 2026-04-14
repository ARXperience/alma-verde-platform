'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const heroSlides = [
    {
        image: '/hero-slides/slide-1.png',
        headline: 'Diseñamos espacios que hacen destacar tu marca',
        subtitle: 'Stands, exhibiciones y ambientes comerciales con diseño sustentable y vanguardista.',
    },
    {
        image: '/hero-slides/slide-2.png',
        headline: 'Transformamos ideas en experiencias memorables',
        subtitle: 'Espacios comerciales que conectan emocionalmente con tu audiencia.',
    },
    {
        image: '/hero-slides/slide-3.png',
        headline: 'Activaciones de marca que generan impacto',
        subtitle: 'Eventos y experiencias inmersivas diseñadas para dejar huella.',
    },
    {
        image: '/hero-slides/slide-4.png',
        headline: 'Innovación sostenible para tu negocio',
        subtitle: 'Materiales eco-amigables y procesos responsables con el planeta.',
    },
    {
        image: '/hero-slides/slide-5.png',
        headline: 'Tu marca merece un escenario extraordinario',
        subtitle: 'Diseño modular y personalizado para ferias, exposiciones y eventos corporativos.',
    },
    {
        image: '/hero-slides/slide-6.png',
        headline: 'Creamos el espacio perfecto para tu visión',
        subtitle: 'Del concepto a la realidad: diseño, fabricación e instalación integral.',
    },
]

export function Hero() {
    const [current, setCurrent] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const goToSlide = useCallback((index: number) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrent(index)
        setTimeout(() => setIsTransitioning(false), 800)
    }, [isTransitioning])

    const nextSlide = useCallback(() => {
        goToSlide((current + 1) % heroSlides.length)
    }, [current, goToSlide])

    // Auto-advance every 6 seconds
    useEffect(() => {
        const timer = setInterval(nextSlide, 6000)
        return () => clearInterval(timer)
    }, [nextSlide])

    return (
        <section className="relative h-[85vh] w-full overflow-hidden" id="hero">
            {/* Slides */}
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
                    style={{ opacity: index === current ? 1 : 0, zIndex: index === current ? 1 : 0 }}
                >
                    {/* Background image with Ken Burns effect */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-linear"
                        style={{
                            backgroundImage: `url('${slide.image}')`,
                            transform: index === current ? 'scale(1.08)' : 'scale(1)',
                        }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 h-full flex items-center px-6 lg:px-20">
                <div className="max-w-3xl text-white">
                    <h1
                        key={current}
                        className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight font-display animate-[slideUp_0.8s_ease-out]"
                    >
                        {heroSlides[current].headline}
                    </h1>
                    <p
                        key={`sub-${current}`}
                        className="text-lg lg:text-xl font-light text-slate-300 mb-10 max-w-xl animate-[slideUp_0.8s_ease-out_0.15s_both]"
                    >
                        {heroSlides[current].subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4 animate-[slideUp_0.8s_ease-out_0.3s_both]">
                        <a
                            href="#proyectos"
                            className="bg-[#13ec5b] text-[#111813] px-8 py-4 rounded-lg font-bold text-base hover:scale-105 transition-transform"
                        >
                            Ver proyectos
                        </a>
                        <Link
                            href="/cotizar"
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-white/20 transition-all"
                        >
                            Solicitar cotización
                        </Link>
                    </div>
                </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="group relative h-3 transition-all duration-300"
                        style={{ width: index === current ? 40 : 12 }}
                        aria-label={`Ir al slide ${index + 1}`}
                    >
                        <span
                            className={`block h-full rounded-full transition-all duration-300 ${
                                index === current
                                    ? 'bg-[#13ec5b] w-full'
                                    : 'bg-white/50 w-3 group-hover:bg-white/80'
                            }`}
                        />
                        {/* Progress bar for active slide */}
                        {index === current && (
                            <span
                                className="absolute inset-0 rounded-full bg-[#13ec5b]/30 origin-left"
                                style={{
                                    animation: 'progressBar 6s linear',
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Navigation arrows */}
            <button
                onClick={() => goToSlide((current - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-60"
                aria-label="Slide anterior"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => goToSlide((current + 1) % heroSlides.length)}
                className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-60"
                aria-label="Siguiente slide"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Keyframe animations — injected once */}
            <style jsx global>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes progressBar {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </section>
    )
}
