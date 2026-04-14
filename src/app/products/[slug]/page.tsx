'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, ShoppingCart, Check } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

interface Product {
    id: string
    name: string
    slug: string
    description: string
    price: number
    compare_price: number | null
    images: string[]
    category: string
    in_stock: boolean
    stock_quantity: number | null
    business_unit: string
}

export default function ProductDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { addItem } = useCart()
    const slug = params.slug as string

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        fetchProduct()
    }, [slug])

    async function fetchProduct() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single()

            if (error) throw error
            setProduct(data)
            if (data.images && data.images.length > 0) {
                setSelectedImage(data.images[0])
            } else {
                setSelectedImage('/placeholder-product.jpg') // Fallback
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            // Redirect to store home or 404?
            // router.push('/alma-home/tienda') 
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        if (!product) return

        setAdding(true)
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: selectedImage || '',
            quantity: quantity,
            businessUnit: product.business_unit,
            slug: product.slug
        })

        // Simulate a small delay for feedback
        setTimeout(() => {
            setAdding(false)
        }, 500)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold">Producto no encontrado</h1>
                <Button onClick={() => router.back()}>Volver</Button>
            </div>
        )
    }

    const isAlmaHome = product.business_unit === 'ALMA_HOME'
    const backLink = isAlmaHome ? '/alma-home/tienda' : '/alma-verde/catalogo'
    const brandColor = isAlmaHome ? 'text-purple-600' : 'text-green-600'
    const buttonVariant = isAlmaHome ? 'default' : 'secondary'

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
                <Button variant="ghost" onClick={() => router.push(backLink)} className="mb-8 pl-0 hover:bg-transparent hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al {isAlmaHome ? 'Catálogo' : 'Inicio'}
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-transparent">
                            {selectedImage && (
                                <Image
                                    src={selectedImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            )}
                            {!product.in_stock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Badge variant="destructive" className="text-xl px-6 py-2">Agotado</Badge>
                                </div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === img ? (isAlmaHome ? 'border-purple-600' : 'border-green-600') : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <Image src={img} alt={`View ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <Badge variant="outline" className={`mb-4 ${brandColor} border-current`}>
                                {product.category}
                            </Badge>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                            <p className="text-sm text-gray-500">REF: {product.slug}</p>
                        </div>

                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(product.price)}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                                <span className="text-xl text-gray-500 line-through">
                                    {formatCurrency(product.compare_price)}
                                </span>
                            )}
                        </div>

                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p className="whitespace-pre-line">{product.description}</p>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                            {product.in_stock ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center border rounded-md w-32">
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >-</button>
                                        <input
                                            type="number"
                                            className="w-full text-center bg-transparent border-none focus:ring-0"
                                            value={quantity}
                                            readOnly
                                        />
                                        <button
                                            className="px-3 py-2 hover:bg-gray-100"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >+</button>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="flex-1 text-lg h-12"
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                        variant={buttonVariant}
                                    >
                                        {adding ? (
                                            <>
                                                <Check className="mr-2 h-5 w-5" />
                                                Agregado
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                Agregar al Carrito
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium">
                                    Este producto no está disponible en este momento.
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Envío seguro
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Garantía de calidad
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Soporte 24/7
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Devoluciones fáciles
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
