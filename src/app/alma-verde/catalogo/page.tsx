'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ProductCard } from '@/components/store/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Product {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
    category: string
    in_stock: boolean
    business_unit: string
}

const CATEGORIES = [
    { id: 'all', label: 'Todo' },
    { id: 'STAND', label: 'Stands' },
    { id: 'SERVICE', label: 'Servicios' },
    { id: 'RENTAL', label: 'Alquiler' },
    { id: 'BRANDING', label: 'Branding' },
]

export default function AlmaVerdeCatalogPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('business_unit', 'ALMA_VERDE')
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
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Catálogo Alma Verde</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Soluciones integrales para ferias, eventos y espacios comerciales.
                        Diseño y producción de alta calidad.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {CATEGORIES.map(category => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`rounded-full ${selectedCategory === category.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar servicios..."
                            className="pl-10 rounded-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No encontramos servicios con esos filtros.</p>
                        <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}>
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
