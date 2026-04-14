'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, ShoppingBag, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
    { id: 'SERVICE', name: 'Servicios' }
]

const PRODUCT_TYPES = [
    { id: 'all', name: 'Todo', icon: null },
    { id: 'sale', name: '🛒 Venta' },
    { id: 'rental', name: '🔄 Renta' },
]

export default function TiendaPage() {
    const router = useRouter()
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        const matchesType = selectedType === 'all' 
            || (selectedType === 'rental' && product.is_rental) 
            || (selectedType === 'sale' && !product.is_rental)
        return matchesSearch && matchesCategory && matchesType
    })

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display selection:bg-[#13ec5b]/30">
            <Header />
            
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Video de fondo */}
                <div className="absolute inset-0 z-0">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                        <source src="/tienda.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-[#102216]/60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f6f8f6] dark:to-[#102216]" />
                </div>
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <Badge variant="outline" className="text-[#13ec5b] border-[#13ec5b]/30 bg-[#13ec5b]/10 mb-6 px-4 py-1.5 text-sm uppercase tracking-wider">
                        Catálogo y Alquiler
                    </Badge>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
                        Venta y Renta de <br/>
                        <span className="text-[#13ec5b]">
                            Mobiliario & Accesorios
                        </span>
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto font-medium">
                        Encuentra productos decorativos para tu hogar, alquila mobiliario para eventos, renta stands listos y accesorios como pantallas, luces, mesas, sillas y counters.
                    </p>

                    {/* Tipo de Producto: Tarjetas Hero */}
                    <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12 max-w-2xl mx-auto">
                        <button
                            onClick={() => setSelectedType(selectedType === 'sale' ? 'all' : 'sale')}
                            className={`flex items-center gap-4 px-8 py-5 rounded-2xl border-2 transition-all text-left backdrop-blur-md ${
                                selectedType === 'sale'
                                ? 'border-[#13ec5b] bg-[#13ec5b]/15 shadow-lg'
                                : 'border-white/20 bg-white/10 hover:border-[#13ec5b]/50 shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${selectedType === 'sale' ? 'bg-[#13ec5b]/20' : 'bg-white/10'}`}>
                                <ShoppingBag className={`h-6 w-6 ${selectedType === 'sale' ? 'text-[#13ec5b]' : 'text-white/70'}`} />
                            </div>
                            <div>
                                <p className={`font-bold text-lg ${selectedType === 'sale' ? 'text-white' : 'text-white/90'}`}>Comprar</p>
                                <p className="text-sm text-white/60">Productos a la venta</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setSelectedType(selectedType === 'rental' ? 'all' : 'rental')}
                            className={`flex items-center gap-4 px-8 py-5 rounded-2xl border-2 transition-all text-left backdrop-blur-md ${
                                selectedType === 'rental'
                                ? 'border-blue-400 bg-blue-500/20 shadow-lg'
                                : 'border-white/20 bg-white/10 hover:border-blue-400/50 shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${selectedType === 'rental' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                                <RotateCcw className={`h-6 w-6 ${selectedType === 'rental' ? 'text-blue-400' : 'text-white/70'}`} />
                            </div>
                            <div>
                                <p className={`font-bold text-lg ${selectedType === 'rental' ? 'text-white' : 'text-white/90'}`}>Alquilar</p>
                                <p className="text-sm text-white/60">Muebles, stands y accesorios</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros y Buscador */}
            <div className="container mx-auto px-4 md:px-6 mb-12 -mt-8 relative z-20">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#152e1e] border border-gray-100 dark:border-[#1e402a] p-4 rounded-2xl shadow-xl">
                    <div className="w-full md:w-96 relative group">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-[#13ec5b] transition-colors" />
                        <Input
                            placeholder="Buscar productos..."
                            className="pl-12 bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-[#13ec5b] h-12 rounded-xl text-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex gap-2 items-center" style={{ scrollbarWidth: 'none' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${
                                    selectedCategory === cat.id 
                                    ? 'bg-[#13ec5b] text-[#111813] shadow-md shadow-[#13ec5b]/20 border-0' 
                                    : 'bg-white dark:bg-[#102216] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1e402a]/50 border border-gray-200 dark:border-[#1e402a]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="container mx-auto px-4 md:px-6 pb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-12 w-12 animate-spin text-[#13ec5b] mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-[#152e1e] rounded-3xl border border-gray-100 dark:border-[#1e402a] shadow-sm">
                        <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No se encontraron productos</h3>
                        <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros de búsqueda o categoría.</p>
                        <Button 
                            variant="link" 
                            className="text-[#13ec5b] hover:text-[#13ec5b]/80 mt-4"
                            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedType('all'); }}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <Link href={`/tienda/${product.id}`} key={product.id} className="group">
                                <div className="bg-white dark:bg-[#152e1e] border border-gray-100 dark:border-[#1e402a] rounded-2xl overflow-hidden hover:border-[#13ec5b]/50 dark:hover:border-[#13ec5b]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#13ec5b]/10 h-full flex flex-col">
                                    {/* Imagen */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-[#102216]">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                                <ShoppingBag className="h-12 w-12 opacity-20" />
                                            </div>
                                        )}
                                        
                                        {/* Badges superiores */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {product.is_rental ? (
                                                <Badge className="bg-blue-500/90 backdrop-blur-md text-white border-0 px-3 py-1 uppercase tracking-widest text-[10px] shadow-sm font-bold">
                                                    🔄 Renta
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-[#13ec5b]/90 backdrop-blur-md text-[#111813] border-0 px-3 py-1 uppercase tracking-widest text-[10px] shadow-sm font-bold">
                                                    🛒 Venta
                                                </Badge>
                                            )}
                                            {!product.in_stock && (
                                                <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-md border-red-500/20 px-3 py-1 uppercase tracking-widest text-[10px] shadow-sm">
                                                    Agotado
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {/* Hover Overlay Button */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5 dark:bg-black/20 backdrop-blur-[2px]">
                                            <span className="bg-[#13ec5b] text-[#111813] px-6 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                                                Ver Detalles
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Información */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wider uppercase mb-2">
                                                {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                                            </p>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#13ec5b] transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1e402a]">
                                            {product.is_rental && product.rental_price ? (
                                                <div>
                                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {formatCurrency(product.rental_price)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400"> /día</span>
                                                    {product.price > 0 && (
                                                        <p className="text-xs text-gray-400 mt-1">Compra: {formatCurrency(product.price)}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xl font-bold text-[#13ec5b]">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
