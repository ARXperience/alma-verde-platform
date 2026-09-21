'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Loader2, PackageOpen, RotateCcw, Search, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface Product {
    id: string
    name: string
    category: string
    price: number
    rental_price: number | null
    business_unit: string
    in_stock: boolean
    images: string[]
    description: string
    is_rental: boolean
}

const CATEGORIES = [
    { id: 'all', name: 'Todos' },
    { id: 'FURNITURE', name: 'Mobiliario' },
    { id: 'DECORATION', name: 'Decoración' },
    { id: 'STAND', name: 'Stands' },
    { id: 'ACCESSORY', name: 'Accesorios' },
    { id: 'SERVICE', name: 'Servicios' },
]

export default function TiendaPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedType, setSelectedType] = useState('all')

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        const matchesType = selectedType === 'all'
            || (selectedType === 'rental' && product.is_rental)
            || (selectedType === 'sale' && !product.is_rental)
        return matchesSearch && matchesCategory && matchesType
    })

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(amount)

    const chooseType = (type: 'sale' | 'rental') => {
        setSelectedType((current) => current === type ? 'all' : type)
        window.setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    const resetFilters = () => {
        setSearchTerm('')
        setSelectedCategory('all')
        setSelectedType('all')
    }

    return (
        <main className="min-h-screen bg-[#070a08] text-white font-display selection:bg-[#13ec5b]/30">
            <div className="text-[#0b140e]">
                <Header />
            </div>

            <section className="relative isolate flex min-h-[82svh] items-end overflow-hidden" data-assistant-section="services">
                <video autoPlay loop muted playsInline className="absolute inset-0 -z-30 h-full w-full object-cover">
                    <source src="/tienda.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 -z-20 bg-black/38" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(3,7,4,0.16)_0%,rgba(3,7,4,0.38)_52%,#070a08_100%)]" />

                <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-6 pb-20 pt-32 md:px-10 lg:grid-cols-[1fr_420px] lg:px-16 lg:pb-24">
                    <div>
                        <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#59f58e]">
                            <span className="h-px w-10 bg-[#59f58e]" />
                            Catálogo curado · Venta y alquiler
                        </div>
                        <h1 className="max-w-5xl text-[clamp(3.2rem,7.4vw,7.4rem)] font-black leading-[0.88] tracking-[-0.065em]">
                            Objetos para crear espacios memorables.
                        </h1>
                        <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 md:text-xl md:leading-8">
                            Mobiliario, accesorios y soluciones listas para comprar o alquilar en eventos, ferias y espacios comerciales.
                        </p>
                    </div>

                    <div className="flex flex-col justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => chooseType('sale')}
                            aria-pressed={selectedType === 'sale'}
                            className={`group flex items-center justify-between rounded-2xl border p-5 text-left backdrop-blur-xl transition-all ${selectedType === 'sale' ? 'border-[#13ec5b] bg-[#13ec5b]/18' : 'border-white/16 bg-black/20 hover:border-white/35 hover:bg-black/35'}`}
                        >
                            <span className="flex items-center gap-4">
                                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#13ec5b]"><ShoppingBag size={19} /></span>
                                <span><strong className="block text-lg">Comprar</strong><small className="text-white/50">Piezas nuevas y disponibles</small></span>
                            </span>
                            <ArrowUpRight className="text-white/45 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => chooseType('rental')}
                            aria-pressed={selectedType === 'rental'}
                            className={`group flex items-center justify-between rounded-2xl border p-5 text-left backdrop-blur-xl transition-all ${selectedType === 'rental' ? 'border-[#13ec5b] bg-[#13ec5b]/18' : 'border-white/16 bg-black/20 hover:border-white/35 hover:bg-black/35'}`}
                        >
                            <span className="flex items-center gap-4">
                                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[#13ec5b]"><RotateCcw size={19} /></span>
                                <span><strong className="block text-lg">Alquilar</strong><small className="text-white/50">Soluciones flexibles por día</small></span>
                            </span>
                            <ArrowUpRight className="text-white/45 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
                        </button>
                    </div>
                </div>
            </section>

            <section id="catalogo" className="scroll-mt-24 border-t border-white/7 bg-[#070a08] pb-28">
                <div className="border-b border-white/8 bg-[#070a08]">
                    <div className="mx-auto grid max-w-[1500px] gap-4 px-6 py-5 md:px-10 lg:px-16 xl:grid-cols-[minmax(280px,420px)_minmax(0,1fr)_auto] xl:items-center">
                        <label className="relative block w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
                            <input
                                type="search"
                                placeholder="Buscar en el catálogo"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="h-12 w-full rounded-full border border-white/12 bg-white/[0.055] pl-11 pr-5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#13ec5b]/60 focus:bg-white/[0.08]"
                            />
                        </label>

                        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] xl:pb-0">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${selectedCategory === category.id ? 'bg-[#13ec5b] text-[#07110a]' : 'border border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <span className="hidden shrink-0 text-right text-xs font-semibold text-white/35 xl:block">
                            {filteredProducts.length} resultados
                        </span>
                    </div>
                </div>

                <div className="mx-auto max-w-[1500px] px-6 pt-12 md:px-10 lg:px-16 lg:pt-16">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#13ec5b]">Selección Alma Verde</span>
                            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] md:text-5xl">Catálogo disponible</h2>
                        </div>
                        {selectedType !== 'all' && (
                            <button type="button" onClick={() => setSelectedType('all')} className="text-xs font-bold text-white/45 underline decoration-white/20 underline-offset-4 hover:text-white">
                                Ver venta y alquiler
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-28 text-white/40">
                            <Loader2 className="mb-4 animate-spin text-[#13ec5b]" size={38} />
                            <p className="text-sm font-semibold">Preparando el catálogo…</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.035] px-6 py-24 text-center">
                            <PackageOpen className="mx-auto mb-6 text-white/20" size={48} strokeWidth={1.4} />
                            <h3 className="text-2xl font-bold">No encontramos coincidencias</h3>
                            <p className="mt-2 text-sm text-white/45">Prueba otra búsqueda o restablece los filtros.</p>
                            <button type="button" onClick={resetFilters} className="mt-6 rounded-full bg-[#13ec5b] px-5 py-2.5 text-xs font-black text-[#07110a]">Limpiar filtros</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <Link href={`/tienda/${product.id}`} key={product.id} className="group overflow-hidden rounded-[24px] border border-white/9 bg-[#101511] transition duration-500 hover:-translate-y-1 hover:border-[#13ec5b]/38 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-[#171d18]">
                                        {product.images?.length ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 grid place-items-center text-white/15"><ShoppingBag size={42} strokeWidth={1.3} /></div>
                                        )}
                                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                                            <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] backdrop-blur-md ${product.is_rental ? 'bg-white/88 text-[#17201a]' : 'bg-[#13ec5b] text-[#07110a]'}`}>
                                                {product.is_rental ? 'Alquiler' : 'Venta'}
                                            </span>
                                            {!product.in_stock && <span className="rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em]">Agotado</span>}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-white/35">
                                            {CATEGORIES.find((category) => category.id === product.category)?.name || product.category}
                                        </p>
                                        <h3 className="mt-2 min-h-12 text-lg font-bold leading-6 text-white transition-colors group-hover:text-[#63f692]">{product.name}</h3>
                                        <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4">
                                            <div>
                                                {product.is_rental && product.rental_price ? (
                                                    <><strong className="text-lg text-white">{formatCurrency(product.rental_price)}</strong><span className="text-xs text-white/38"> /día</span></>
                                                ) : (
                                                    <strong className="text-lg text-white">{formatCurrency(product.price)}</strong>
                                                )}
                                            </div>
                                            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/55 transition group-hover:border-[#13ec5b] group-hover:bg-[#13ec5b] group-hover:text-[#07110a]">
                                                <ArrowUpRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    )
}
