'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Check, X, RotateCcw, CalendarDays } from 'lucide-react'
import Image from 'next/image'

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
}

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
        fetchProduct()
    }, [productId])

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const nextImage = () => {
        if (product && product.images) {
            setActiveImage((prev) => (prev + 1) % product.images.length)
        }
    }

    const prevImage = () => {
        if (product && product.images) {
            setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)
        }
    }

    const handleQuote = () => {
        const typeLabel = product?.is_rental ? 'alquilar' : 'comprar'
        const priceInfo = product?.is_rental && product?.rental_price 
            ? `Renta: ${formatCurrency(product.rental_price)}/día` 
            : formatCurrency(product?.price || 0)
        const message = `¡Hola! Estoy interesado en ${typeLabel} el producto: ${product?.name} (${priceInfo}).`
        const wpUrl = `https://wa.me/573000000000?text=${encodeURIComponent(message)}`
        window.open(wpUrl, '_blank')
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#13ec5b] mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wide animate-pulse">Cargando producto...</p>
                </div>
                <Footer />
            </main>
        )
    }

    if (!product) return null

    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display selection:bg-[#13ec5b]/30 flex flex-col">
            <Header />
            
            <div className="flex-1 container mx-auto px-4 md:px-6 pt-32 pb-20">
                <button 
                    onClick={() => router.push('/tienda')}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-8 group font-medium"
                >
                    <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Volver al catálogo
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                    {/* Galería de Imágenes */}
                    <div className="space-y-6">
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#152e1e] border border-gray-100 dark:border-[#1e402a] shadow-xl">
                            {product.images && product.images.length > 0 ? (
                                <>
                                    <div 
                                        className="absolute inset-0 cursor-zoom-in"
                                        onClick={() => setIsViewerOpen(true)}
                                    >
                                        <Image
                                            src={product.images[activeImage]}
                                            alt={product.name}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                            priority
                                        />
                                    </div>
                                    {product.images.length > 1 && (
                                        <>
                                            <button 
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#13ec5b] text-gray-900 shadow-md backdrop-blur-sm p-3 rounded-full transition-all border border-gray-200"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button 
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-[#13ec5b] text-gray-900 shadow-md backdrop-blur-sm p-3 rounded-full transition-all border border-gray-200"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700">
                                    <ShoppingCart className="h-24 w-24 opacity-50" />
                                </div>
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-6 left-6 flex gap-2">
                                {product.is_rental ? (
                                    <Badge className="bg-blue-500/90 backdrop-blur-md text-white border-0 px-4 py-1.5 text-xs uppercase tracking-widest shadow-lg font-bold">
                                        🔄 Disponible para Renta
                                    </Badge>
                                ) : (
                                    <Badge className="bg-[#13ec5b]/90 backdrop-blur-md text-[#111813] border-0 px-4 py-1.5 text-xs uppercase tracking-widest shadow-lg font-bold">
                                        🛒 En Venta
                                    </Badge>
                                )}
                                {!product.in_stock && (
                                    <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-md border-red-500/20 px-4 py-1.5 text-xs text-white uppercase tracking-widest shadow-lg">
                                        Agotado temporalmente
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                {product.images.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                            activeImage === idx 
                                            ? 'border-[#13ec5b] scale-105 shadow-md' 
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100 bg-white dark:bg-[#152e1e]'
                                        }`}
                                    >
                                        <Image src={url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Información del Producto */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-8">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold tracking-widest uppercase mb-4">
                                {product.category} {product.business_unit === 'alma_home' ? '| Alma Home' : '| Alma Verde'}
                            </p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                {product.name}
                            </h1>

                            {/* Precios */}
                            {product.is_rental ? (
                                <div className="space-y-3 mb-6">
                                    {product.rental_price && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(product.rental_price)}
                                            </span>
                                            <span className="text-lg text-gray-500 dark:text-gray-400">/día</span>
                                        </div>
                                    )}
                                    {product.price > 0 && (
                                        <p className="text-gray-500 dark:text-gray-400 text-md">
                                            También a la venta: <span className="font-bold text-[#13ec5b]">{formatCurrency(product.price)}</span>
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-end gap-4 mb-6">
                                    <span className="text-3xl md:text-4xl font-bold text-[#13ec5b]">
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>
                            )}
                            
                            {/* Tags/Features */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-[#152e1e] px-4 py-2 rounded-full border border-gray-200 dark:border-[#1e402a] text-sm font-medium shadow-sm">
                                    {product.in_stock ? (
                                        <><Check className="h-4 w-4 text-[#13ec5b] mr-2" /> Disponible</>
                                    ) : (
                                        <><X className="h-4 w-4 text-red-500 mr-2" /> No disponible</>
                                    )}
                                </div>

                                {product.is_rental && (
                                    <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-[#152e1e] px-4 py-2 rounded-full border border-gray-200 dark:border-[#1e402a] text-sm font-medium shadow-sm">
                                        <CalendarDays className="h-4 w-4 text-blue-500 mr-2" /> Alquiler por días
                                    </div>
                                )}

                                <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-[#152e1e] px-4 py-2 rounded-full border border-gray-200 dark:border-[#1e402a] text-sm font-medium shadow-sm">
                                    <Check className="h-4 w-4 text-[#13ec5b] mr-2" /> Calidad Garantizada
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none mb-10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Descripción del Producto</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            {product.is_rental ? (
                                <>
                                    <Button 
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-900/20 h-14 text-lg rounded-xl transition-all hover:scale-[1.02]"
                                        disabled={!product.in_stock}
                                        onClick={() => {
                                            if (!product) return;
                                            addItem({
                                                productId: product.id,
                                                name: product.name,
                                                price: product.rental_price || 0, // Use rental price
                                                quantity: 1,
                                                image: product.images?.[0] || '',
                                                businessUnit: product.business_unit
                                            });
                                            setIsOpen(true);
                                        }}
                                    >
                                        <ShoppingCart className="mr-3 h-5 w-5" />
                                        {product.in_stock ? 'Agregar (Pago Anticipado)' : 'Agotado'}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="flex-1 border-gray-200 dark:border-[#1e402a] bg-white hover:bg-gray-50 dark:bg-[#152e1e] dark:hover:bg-[#1e402a] text-gray-900 dark:text-white font-bold h-14 text-lg rounded-xl transition-all shadow-sm"
                                        onClick={handleQuote}
                                    >
                                        <MessageCircle className="mr-3 h-5 w-5 text-blue-500" />
                                        Cotizar por WhatsApp
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button 
                                        className="flex-1 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#111813] font-bold shadow-lg shadow-[#13ec5b]/20 h-14 text-lg rounded-xl transition-all hover:scale-[1.02]"
                                        disabled={!product.in_stock}
                                        onClick={() => {
                                            if (!product) return;
                                            addItem({
                                                productId: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                image: product.images?.[0] || '',
                                                businessUnit: product.business_unit
                                            });
                                            setIsOpen(true);
                                        }}
                                    >
                                        <ShoppingCart className="mr-3 h-5 w-5" />
                                        {product.in_stock ? 'Agregar al Carrito' : 'Agotado'}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="flex-1 border-gray-200 dark:border-[#1e402a] bg-white hover:bg-gray-50 dark:bg-[#152e1e] dark:hover:bg-[#1e402a] text-gray-900 dark:text-white font-bold h-14 text-lg rounded-xl transition-all shadow-sm"
                                        onClick={handleQuote}
                                    >
                                        <MessageCircle className="mr-3 h-5 w-5 text-[#13ec5b]" />
                                        Cotizar por WhatsApp
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Image Viewer Modal */}
            {isViewerOpen && product && product.images && product.images.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
                    <button 
                        onClick={() => setIsViewerOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-[#13ec5b]/20 p-3 rounded-full transition-all z-50"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    
                    <div className="relative w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center p-4 md:p-12" onClick={() => setIsViewerOpen(false)}>
                        <Image
                            src={product.images[activeImage]}
                            alt={product.name}
                            fill
                            className="object-contain cursor-zoom-out"
                            quality={100}
                            priority
                        />
                    </div>

                    {product.images.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#13ec5b] text-white shadow-xl backdrop-blur-md p-4 rounded-full transition-all border border-white/10"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#13ec5b] text-white shadow-xl backdrop-blur-md p-4 rounded-full transition-all border border-white/10"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                            
                            {/* Thumbnails en el modal */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 max-w-full overflow-x-auto">
                                {product.images.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                            activeImage === idx 
                                            ? 'border-[#13ec5b] scale-110 shadow-lg shadow-[#13ec5b]/20' 
                                            : 'border-transparent opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <Image src={url} alt={`Thumb ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>
    )
}
