'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Maximize2,
    MessageCircle,
    RotateCcw,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Truck,
    X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
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
    stock_quantity: number | null
    images: string[]
    description: string
    is_rental: boolean
    slug?: string
}

const categoryLabels: Record<string, string> = {
    FURNITURE: 'Mobiliario',
    DECORATION: 'Decoración',
    STAND: 'Stands',
    ACCESSORY: 'Accesorios',
    SERVICE: 'Servicios',
}

const benefits = [
    { Icon: ShieldCheck, label: 'Calidad verificada' },
    { Icon: Truck, label: 'Entrega coordinada' },
    { Icon: MessageCircle, label: 'Asesoría directa' },
]

export default function TiendaProductPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.id as string
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const { addItem, setIsOpen } = useCart()

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single()

                if (error) throw error
                setProduct(data as Product)
            } catch (error) {
                console.error('Error fetching product:', error)
                router.push('/tienda')
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [productId, router])

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(amount)

    const nextImage = () => {
        if (product?.images?.length) {
            setActiveImage((current) => (current + 1) % product.images.length)
        }
    }

    const previousImage = () => {
        if (product?.images?.length) {
            setActiveImage((current) => (current - 1 + product.images.length) % product.images.length)
        }
    }

    const handleAddToCart = () => {
        if (!product) return
        addItem({
            productId: product.id,
            name: product.name,
            price: product.is_rental ? product.rental_price || 0 : product.price,
            quantity: 1,
            image: product.images?.[0] || '',
            businessUnit: product.business_unit,
            slug: product.slug || '',
        })
        setIsOpen(true)
    }

    const handleQuote = () => {
        const action = product?.is_rental ? 'alquilar' : 'comprar'
        const price = product?.is_rental && product.rental_price
            ? `Renta: ${formatCurrency(product.rental_price)}/día`
            : formatCurrency(product?.price || 0)
        const message = `¡Hola! Estoy interesado en ${action} el producto: ${product?.name} (${price}).`
        window.open(`https://wa.me/573000000000?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    if (loading) {
        return (
            <main className="flex min-h-screen flex-col bg-[#070a08] font-display text-white">
                <div className="text-[#0b140e]"><Header /></div>
                <div className="flex flex-1 flex-col items-center justify-center">
                    <Loader2 className="mb-4 animate-spin text-[#13ec5b]" size={40} />
                    <p className="text-sm font-semibold text-white/40">Preparando la pieza…</p>
                </div>
                <Footer />
            </main>
        )
    }

    if (!product) return null

    const mainImage = product.images?.[activeImage]
    const category = categoryLabels[product.category] || product.category
    const brand = product.business_unit?.toLowerCase() === 'alma_home' ? 'Alma Home' : 'Alma Verde'

    return (
        <main className="min-h-screen bg-[#070a08] font-display text-white selection:bg-[#13ec5b]/30">
            <div className="text-[#0b140e]"><Header /></div>

            <div className="mx-auto max-w-[1500px] px-6 pb-24 pt-8 md:px-10 lg:px-16 lg:pb-32 lg:pt-12">
                <button
                    type="button"
                    onClick={() => router.push('/tienda')}
                    className="group mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/42 transition hover:text-white"
                >
                    <ArrowLeft className="transition-transform group-hover:-translate-x-1" size={17} />
                    Volver al catálogo
                </button>

                <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] xl:gap-16">
                    <section className="min-w-0">
                        <div className="relative aspect-[4/4.15] overflow-hidden rounded-[30px] border border-white/8 bg-[#111612] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
                            {mainImage ? (
                                <button type="button" onClick={() => setIsViewerOpen(true)} className="absolute inset-0 cursor-zoom-in">
                                    <Image
                                        src={mainImage}
                                        alt={product.name}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 58vw"
                                        className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                                    />
                                </button>
                            ) : (
                                <div className="absolute inset-0 grid place-items-center text-white/12"><ShoppingBag size={72} strokeWidth={1.1} /></div>
                            )}

                            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-7">
                                <span className={`rounded-full px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.18em] ${product.is_rental ? 'bg-white/90 text-[#111813]' : 'bg-[#13ec5b] text-[#07110a]'}`}>
                                    {product.is_rental ? 'Disponible para alquiler' : 'Disponible para compra'}
                                </span>
                                {mainImage && (
                                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/18 bg-black/30 text-white/70 backdrop-blur-md"><Maximize2 size={16} /></span>
                                )}
                            </div>

                            {product.images?.length > 1 && (
                                <>
                                    <button type="button" onClick={previousImage} aria-label="Imagen anterior" className="absolute left-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-[#13ec5b] hover:text-[#07110a]">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button type="button" onClick={nextImage} aria-label="Imagen siguiente" className="absolute right-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-[#13ec5b] hover:text-[#07110a]">
                                        <ChevronRight size={20} />
                                    </button>
                                    <span className="absolute bottom-5 right-5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white/70 backdrop-blur-md">
                                        {String(activeImage + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                                    </span>
                                </>
                            )}
                        </div>

                        {product.images?.length > 1 && (
                            <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
                                {product.images.map((image, index) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`Ver imagen ${index + 1}`}
                                        className={`relative aspect-square overflow-hidden rounded-xl border transition ${activeImage === index ? 'border-[#13ec5b] opacity-100' : 'border-white/8 opacity-48 hover:opacity-100'}`}
                                    >
                                        <Image src={image} alt="" fill sizes="120px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col lg:py-4" data-assistant-section="materials">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#13ec5b]">
                            <span>{category}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span className="text-white/40">{brand}</span>
                        </div>

                        <h1 className="mt-5 text-[clamp(2.7rem,5vw,5.6rem)] font-black leading-[0.91] tracking-[-0.06em]">{product.name}</h1>

                        <div className="mt-8 border-y border-white/10 py-6">
                            {product.is_rental && product.rental_price ? (
                                <div>
                                    <div className="flex items-end gap-2">
                                        <strong className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{formatCurrency(product.rental_price)}</strong>
                                        <span className="pb-1 text-sm text-white/40">/día</span>
                                    </div>
                                    {product.price > 0 && <p className="mt-2 text-sm text-white/42">También disponible para compra por {formatCurrency(product.price)}</p>}
                                </div>
                            ) : (
                                <strong className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{formatCurrency(product.price)}</strong>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${product.in_stock ? 'border-[#13ec5b]/30 bg-[#13ec5b]/8 text-[#65f594]' : 'border-red-400/25 bg-red-400/8 text-red-300'}`}>
                                {product.in_stock ? <Check size={14} /> : <X size={14} />}
                                {product.in_stock ? 'Disponible' : 'No disponible'}
                            </span>
                            {product.is_rental && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs font-bold text-white/60"><CalendarDays size={14} /> Alquiler por días</span>
                            )}
                            {product.stock_quantity !== null && product.in_stock && (
                                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs font-bold text-white/60">{product.stock_quantity} unidades</span>
                            )}
                        </div>

                        <div className="mt-9">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Sobre esta pieza</span>
                            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-white/62">{product.description || 'Una solución seleccionada por Alma Verde para crear espacios funcionales, memorables y coherentes con tu marca.'}</p>
                        </div>

                        <div className="mt-10 rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    disabled={!product.in_stock}
                                    onClick={handleAddToCart}
                                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#13ec5b] px-5 py-3.5 text-sm font-black text-[#07110a] transition hover:-translate-y-0.5 hover:bg-[#2cf371] disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    {product.is_rental ? <RotateCcw size={17} /> : <ShoppingCart size={17} />}
                                    {product.in_stock ? (product.is_rental ? 'Agregar alquiler' : 'Agregar al carrito') : 'No disponible'}
                                </button>
                                <button type="button" onClick={handleQuote} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/14 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white transition hover:border-white/30 hover:bg-white/[0.08]">
                                    <MessageCircle size={17} className="text-[#13ec5b]" /> Consultar por WhatsApp
                                </button>
                            </div>
                            {product.is_rental && <p className="mt-4 text-center text-[11px] leading-5 text-white/35">La disponibilidad y duración final del alquiler se confirman con nuestro equipo.</p>}
                        </div>

                        <div className="mt-7 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-3">
                            {benefits.map(({ Icon, label }) => (
                                <div key={label} className="flex items-center gap-3 text-xs font-semibold text-white/48">
                                    <Icon size={17} className="text-[#13ec5b]" /> {label}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <Footer />

            {isViewerOpen && mainImage && (
                <div role="dialog" aria-modal="true" aria-label={`Galería de ${product.name}`} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/96 p-4 backdrop-blur-md" onClick={() => setIsViewerOpen(false)}>
                    <button type="button" onClick={() => setIsViewerOpen(false)} aria-label="Cerrar galería" className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white">
                        <X size={22} />
                    </button>
                    <div className="relative h-[82vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
                        <Image src={mainImage} alt={product.name} fill priority quality={100} sizes="100vw" className="object-contain" />
                    </div>
                    {product.images.length > 1 && (
                        <>
                            <button type="button" onClick={(event) => { event.stopPropagation(); previousImage() }} aria-label="Imagen anterior" className="absolute left-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/14 bg-black/40 text-white transition hover:bg-[#13ec5b] hover:text-[#07110a]"><ChevronLeft size={23} /></button>
                            <button type="button" onClick={(event) => { event.stopPropagation(); nextImage() }} aria-label="Imagen siguiente" className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/14 bg-black/40 text-white transition hover:bg-[#13ec5b] hover:text-[#07110a]"><ChevronRight size={23} /></button>
                        </>
                    )}
                </div>
            )}
        </main>
    )
}
