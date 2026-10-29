'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Package, Plus } from 'lucide-react'
import { FilterChip, PageHeader, Pill, SearchBox, Stat } from '@/components/admin/ui'
import { BUSINESS_UNITS, PRODUCT_CATEGORIES, nameOf } from '@/lib/admin/labels'
import { formatCOP } from '@/lib/projects/display'

interface Product {
    id: string
    name: string
    category: string
    price: number
    rental_price: number | null
    business_unit: string
    in_stock: boolean
    stock_quantity: number | null
    is_rental: boolean
    is_available: boolean
    images: string[] | null
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [unit, setUnit] = useState('all')
    const [category, setCategory] = useState('all')

    useEffect(() => {
        supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (error) console.error('Error fetching products:', error)
            setProducts((data || []) as Product[])
            setLoading(false)
        })
    }, [])

    const term = search.trim().toLowerCase()
    const visible = products.filter(p =>
        (!term || p.name.toLowerCase().includes(term)) &&
        (unit === 'all' || p.business_unit === unit) &&
        (category === 'all' || p.category === category)
    )
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow="Tienda"
                title="Productos"
                description="Catálogo de Alma Home y Alma Verde que se vende en la tienda en línea"
                actions={
                    <Link href="/admin/products/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#13ec5b] px-5 text-sm font-bold text-[#102216] shadow-sm transition-transform hover:-translate-y-0.5">
                        <Plus className="h-4 w-4" /> Nuevo producto
                    </Link>
                }
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Productos" value={products.length} />
                <Stat label="Alma Home" value={products.filter(p => p.business_unit === 'alma_home').length} />
                <Stat label="En alquiler" value={products.filter(p => p.is_rental).length} />
                <Stat label="Agotados" value={products.filter(p => !p.in_stock).length} />
            </div>

            <div className="mb-6 flex flex-col gap-4">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar producto…" />
                <div className="flex flex-wrap gap-2">
                    <FilterChip active={unit === 'all'} onClick={() => setUnit('all')} label="Todas las marcas" />
                    {Object.entries(BUSINESS_UNITS).map(([id, label]) => (
                        <FilterChip key={id} active={unit === id} onClick={() => setUnit(id)} label={label} count={products.filter(p => p.business_unit === id).length} />
                    ))}
                    <span className="mx-1 hidden w-px bg-slate-200 sm:block" />
                    <FilterChip active={category === 'all'} onClick={() => setCategory('all')} label="Todas las categorías" />
                    {categories.map(c => (
                        <FilterChip key={c} active={category === c} onClick={() => setCategory(c)} label={nameOf(PRODUCT_CATEGORIES, c)} count={products.filter(p => p.category === c).length} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : visible.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
                    <Package className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                    <p className="font-bold text-[#102216]">{products.length ? 'No hay productos con estos filtros' : 'Aún no hay productos'}</p>
                    {!products.length && <p className="text-sm text-slate-500">Crea el primero con el botón “Nuevo producto”.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map(p => (
                        <Link key={p.id} href={`/admin/products/${p.id}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="relative aspect-square overflow-hidden bg-slate-100">
                                {p.images?.[0] ? (
                                    <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="grid h-full place-items-center"><Package className="h-12 w-12 text-slate-300" /></div>
                                )}
                                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                                    <Pill tone={p.business_unit === 'alma_home' ? 'violet' : 'green'}>{nameOf(BUSINESS_UNITS, p.business_unit)}</Pill>
                                    {p.is_rental && <Pill tone="sky">Alquiler</Pill>}
                                </div>
                                {!p.in_stock && (
                                    <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white">Agotado</span>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{nameOf(PRODUCT_CATEGORIES, p.category)}</p>
                                <p className="mt-1 line-clamp-2 font-bold leading-snug text-[#102216]">{p.name}</p>
                                <div className="mt-3 flex items-end justify-between gap-2">
                                    <div>
                                        <p className="text-lg font-black text-[#0a8c35]">{formatCOP(p.price)}</p>
                                        {p.is_rental && p.rental_price ? <p className="text-xs text-slate-500">Alquiler: {formatCOP(p.rental_price)}/día</p> : null}
                                    </div>
                                    {p.in_stock && (
                                        <span className="text-xs font-semibold text-slate-500">
                                            {p.stock_quantity ? `${p.stock_quantity} disponibles` : 'Disponible'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
