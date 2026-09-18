'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PortfolioItem {
    id: string
    title: string
    description: string
    featured_image_url: string
    gallery_images: string[]
    tags: string[]
    is_featured: boolean
}

interface PortfolioCardItem {
    id: string
    category: string
    title: string
    image: string
    isFeatured: boolean
}

const fallbackItems: PortfolioCardItem[] = [
    {
        id: 'fallback-1',
        category: 'Automotriz',
        title: 'Concept Showroom 2024',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjtJIiYYSUaewwtRy5y7Mm4qiHVJDlr2d98iGzlxNx0L8wE7f-uvTGr_6zQGA3mc8Ogvrc8aSuj2vxk5Zett8DAW77BNrzqJwWx-1HgCQvn8O3Yr-cC16sz2m7JFGeMrWcbIHfKG3rv9leP-RgQ4rJ2gcfvS2mCG_OSFfUQ6bWSVLzhok7c5zeVhPyy7j4QfPrmNzu_w29aWwnpuGZp9jsGMhsw46RRrNaob1Y1QMtpIRo6kI7-ArK3q_I6pB_n71OXZIn3cYq98I',
        isFeatured: false,
    },
    {
        id: 'fallback-2',
        category: 'Retail',
        title: 'Organic Boutique',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP4iAm6G1Ln_WAsCKZagETpxHVPtIV4ccmahdhMWcnYYYzq6oDRFiKdqvtfcky8QtLl_CMTpndWxMjBd-yPe9SaDYMo__1eCoTCiAcsrgttMpXbaI-f09hJg06OO7wCRB4YdrMF-r7XXz34aKAk4v8psjP42NjKfQ7dks2nT0Bd0PSopQSKGLIbigquJrBAmCXoxRokFR0WcWfRXX-EMVUspWrZ4ufkwP-i8hsVh2bDZrSGdMSELRivN2z3EpxF7y_woTBLnwvfi0',
        isFeatured: false,
    },
    {
        id: 'fallback-3',
        category: 'Evento',
        title: 'Tech Summit Pavilion',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ts8TtOHv1PHCfAayDfZui2QDIHf5nDUU6GGySEcqfO3euylVPjL-jd-5qkFZ__7wNTW6mjb8gOpzcIKq_Lo2Ja4AEmLBHfQdrq0FLapxLxhy69eGSqG7MgLL3QbmNoK1OupWrR4z9XcLND4aVr1lAYXXHqAIcU88aarLXaTcb3V5kSYYjTs4RnhwkUKIOLtEudBzwHe9mF0CN6QuZslICAgtudQeKk-gDYD6TEDnQDem3f30hmm5zvAts2zZUihcTxepxHjZNp4',
        isFeatured: false,
    },
    {
        id: 'fallback-4',
        category: 'Hospitality',
        title: 'Sky Bar Installation',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEtXHXeqswLmk8Ef80aArXYr-CfRGt5UnqI9kqNO27wDcBw2qsNWo0NDK_DeEwDyT3L5ry8olqaAudvG_fKBA5vsrnjqfjwYUbhMbnBXc8-Rp-pfys3e4DS8_tLVSyt_LXwwr3t2n3e_UM5mfo4zca3g2mTKY8cKxsitcuL0Y389AZhMSEnq96X15ZyRQSJKDwjXvpMjcl2L9PZSIjtOnd4HdsK-yljUJYwuVTO4XkNb2rMH_gx1OXzKrLFSww7xr0ZDXr2oIUG4A',
        isFeatured: false,
    },
]

function getLayoutClass(total: number, index: number) {
    if (total === 1) return 'md:col-span-12 md:row-span-2'

    if (total === 2) {
        return index === 0
            ? 'md:col-span-8 md:row-span-2'
            : 'md:col-span-4 md:row-span-2'
    }

    if (total === 3) {
        return index === 0
            ? 'md:col-span-8 md:row-span-2'
            : 'md:col-span-4 md:row-span-1'
    }

    return ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7'][index] || 'md:col-span-6'
}

export function Portfolio() {
    const [dynamicItems, setDynamicItems] = useState<PortfolioCardItem[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchPortfolio() {
            try {
                const response = await fetch('/api/portfolio')
                if (!response.ok) throw new Error('No fue posible cargar el portafolio')

                const { data } = await response.json()
                const items = Array.isArray(data)
                    ? data.slice(0, 4).map((item: PortfolioItem) => ({
                        id: item.id,
                        category: item.tags?.[0] || 'Proyecto',
                        title: item.title,
                        image: item.featured_image_url || item.gallery_images?.[0] || '',
                        isFeatured: item.is_featured,
                    }))
                    : []

                setDynamicItems(items)
            } catch (error) {
                console.error('Error fetching portfolio for homepage:', error)
                setDynamicItems([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchPortfolio()
    }, [])

    const hasDynamicItems = Boolean(dynamicItems?.length)
    const items = hasDynamicItems ? dynamicItems! : fallbackItems

    return (
        <section className="bg-[#f3f5f2] px-5 py-24 text-[#0c120d] sm:px-8 lg:px-12 lg:py-36" id="proyectos">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">
                            Selección de proyectos
                        </p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Espacios que hablan por la marca.
                        </h2>
                    </div>
                    <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:items-end">
                        <p className="max-w-md text-base leading-7 text-[#657067] lg:text-right">
                            Una mirada a los proyectos donde estrategia, arquitectura y producción se encuentran.
                        </p>
                        <Link
                            href="/portafolio"
                            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#bdc9bf] px-6 py-3 text-sm font-semibold transition hover:border-[#172219] hover:bg-[#172219] hover:text-white"
                        >
                            Ver todo el portafolio
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-5 md:grid-cols-12 md:auto-rows-[320px] lg:auto-rows-[360px] lg:gap-6" aria-label="Cargando proyectos">
                        <div className="animate-pulse rounded-[1.75rem] bg-[#dfe5df] md:col-span-8 md:row-span-2" />
                        <div className="animate-pulse rounded-[1.75rem] bg-[#dfe5df] md:col-span-4" />
                        <div className="animate-pulse rounded-[1.75rem] bg-[#dfe5df] md:col-span-4" />
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-12 md:auto-rows-[320px] lg:auto-rows-[360px] lg:gap-6">
                        {items.map((item, index) => {
                            const cardClassName = `group relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-[#182019] sm:min-h-[480px] md:min-h-0 ${getLayoutClass(items.length, index)}`
                            const content = (
                                <>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition duration-700 ease-out group-hover:scale-[1.045]"
                                        style={{ backgroundImage: item.image ? `url('${item.image}')` : undefined }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10 transition duration-500 group-hover:from-black/80" />

                                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md sm:text-xs">
                                                {item.category}
                                            </span>
                                            {item.isFeatured && (
                                                <span className="rounded-full bg-[#5cff8d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#071108] sm:text-xs">
                                                    Destacado
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium tabular-nums text-white/60">{String(index + 1).padStart(2, '0')}</span>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
                                        <h3 className="max-w-2xl text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                                            {item.title}
                                        </h3>
                                        {hasDynamicItems && (
                                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg text-white backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black" aria-hidden="true">
                                                ↗
                                            </span>
                                        )}
                                    </div>
                                </>
                            )

                            return hasDynamicItems ? (
                                <Link
                                    key={item.id}
                                    href={`/portafolio/${item.id}`}
                                    className={cardClassName}
                                    aria-label={`Ver proyecto ${item.title}`}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <article key={item.id} className={cardClassName}>
                                    {content}
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
