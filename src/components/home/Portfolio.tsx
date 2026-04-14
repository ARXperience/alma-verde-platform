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

// Fallback items for when there are no published portfolio projects yet
const fallbackItems = [
    {
        id: 'fallback-1',
        category: 'Automotriz',
        title: 'Concept Showroom 2024',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjtJIiYYSUaewwtRy5y7Mm4qiHVJDlr2d98iGzlxNx0L8wE7f-uvTGr_6zQGA3mc8Ogvrc8aSuj2vxk5Zett8DAW77BNrzqJwWx-1HgCQvn8O3Yr-cC16sz2m7JFGeMrWcbIHfKG3rv9leP-RgQ4rJ2gcfvS2mCG_OSFfUQ6bWSVLzhok7c5zeVhPyy7j4QfPrmNzu_w29aWwnpuGZp9jsGMhsw46RRrNaob1Y1QMtpIRo6kI7-ArK3q_I6pB_n71OXZIn3cYq98I',
        colSpan: 'md:col-span-8',
    },
    {
        id: 'fallback-2',
        category: 'Retail',
        title: 'Organic Boutique',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP4iAm6G1Ln_WAsCKZagETpxHVPtIV4ccmahdhMWcnYYYzq6oDRFiKdqvtfcky8QtLl_CMTpndWxMjBd-yPe9SaDYMo__1eCoTCiAcsrgttMpXbaI-f09hJg06OO7wCRB4YdrMF-r7XXz34aKAk4v8psjP42NjKfQ7dks2nT0Bd0PSopQSKGLIbigquJrBAmCXoxRokFR0WcWfRXX-EMVUspWrZ4ufkwP-i8hsVh2bDZrSGdMSELRivN2z3EpxF7y_woTBLnwvfi0',
        colSpan: 'md:col-span-4',
    },
    {
        id: 'fallback-3',
        category: 'Evento',
        title: 'Tech Summit Pavillion',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ts8TtOHv1PHCfAayDfZui2QDIHf5nDUU6GGySEcqfO3euylVPjL-jd-5qkFZ__7wNTW6mjb8gOpzcIKq_Lo2Ja4AEmLBHfQdrq0FLapxLxhy69eGSqG7MgLL3QbmNoK1OupWrR4z9XcLND4aVr1lAYXXHqAIcU88aarLXaTcb3V5kSYYjTs4RnhwkUKIOLtEudBzwHe9mF0CN6QuZslICAgtudQeKk-gDYD6TEDnQDem3f30hmm5zvAts2zZUihcTxepxHjZNp4',
        colSpan: 'md:col-span-4',
    },
    {
        id: 'fallback-4',
        category: 'Hospitality',
        title: 'Sky Bar Installation',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEtXHXeqswLmk8Ef80aArXYr-CfRGt5UnqI9kqNO27wDcBw2qsNWo0NDK_DeEwDyT3L5ry8olqaAudvG_fKBA5vsrnjqfjwYUbhMbnBXc8-Rp-pfys3e4DS8_tLVSyt_LXwwr3t2n3e_UM5mfo4zca3g2mTKY8cKxsitcuL0Y389AZhMSEnq96X15ZyRQSJKDwjXvpMjcl2L9PZSIjtOnd4HdsK-yljUJYwuVTO4XkNb2rMH_gx1OXzKrLFSww7xr0ZDXr2oIUG4A',
        colSpan: 'md:col-span-8',
    },
]

// Grid pattern for varying card sizes (alternates 8/4 then 4/8)
const colSpanPattern = ['md:col-span-8', 'md:col-span-4', 'md:col-span-4', 'md:col-span-8']

export function Portfolio() {
    const [dynamicItems, setDynamicItems] = useState<any[] | null>(null)

    useEffect(() => {
        async function fetchPortfolio() {
            try {
                const res = await fetch('/api/portfolio')
                const { data } = await res.json()
                if (data && data.length > 0) {
                    // Take up to 4 featured/recent items
                    const items = data.slice(0, 4).map((item: PortfolioItem, idx: number) => ({
                        id: item.id,
                        category: item.tags?.[0] || 'Proyecto',
                        title: item.title,
                        image: item.featured_image_url || item.gallery_images?.[0] || '',
                        colSpan: colSpanPattern[idx % 4],
                    }))
                    setDynamicItems(items)
                }
            } catch (err) {
                console.error('Error fetching portfolio for homepage:', err)
            }
        }
        fetchPortfolio()
    }, [])

    const items = dynamicItems || fallbackItems
    const useDynamic = !!dynamicItems

    return (
        <section className="py-24 px-6 lg:px-20" id="proyectos">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 max-w-7xl mx-auto">
                <h2 className="text-4xl font-black font-display">Proyectos Destacados</h2>
                <Link
                    href="/portafolio"
                    className="text-[#13ec5b] font-bold flex items-center gap-2 hover:gap-3 transition-all"
                >
                    Ver todo el portafolio <span className="material-symbols-outlined">arrow_right_alt</span>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[700px] max-w-7xl mx-auto">
                {items.map((item, index) => {
                    const inner = (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-8">
                                <span className="text-[#13ec5b] font-bold text-sm uppercase mb-2">{item.category}</span>
                                <h4 className="text-white text-2xl font-bold">{item.title}</h4>
                            </div>
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url('${item.image}')` }}
                            />
                        </>
                    )

                    // If dynamic data, link to the project subpage
                    if (useDynamic) {
                        return (
                            <Link
                                key={item.id}
                                href={`/portafolio/${item.id}`}
                                className={`${item.colSpan} group relative overflow-hidden rounded-2xl min-h-[250px]`}
                            >
                                {inner}
                            </Link>
                        )
                    }

                    // Fallback items are not clickable (no real destination)
                    return (
                        <div
                            key={item.id}
                            className={`${item.colSpan} group relative overflow-hidden rounded-2xl min-h-[250px]`}
                        >
                            {inner}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
