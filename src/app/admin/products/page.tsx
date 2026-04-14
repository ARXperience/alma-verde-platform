'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, Plus, Search, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'

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
}

export default function ProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [businessUnitFilter, setBusinessUnitFilter] = useState('all')

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
        } catch (error: any) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesUnit = businessUnitFilter === 'all' || product.business_unit === businessUnitFilter
        return matchesSearch && matchesUnit
    })

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Productos</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona el catálogo de Alma Verde y Alma Home</p>
                </div>
                <Button 
                    onClick={() => router.push('/admin/products/new')}
                    className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#111813] font-bold shadow-md rounded-lg"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-[#152e1e] rounded-2xl overflow-hidden">
                <CardHeader className="bg-white dark:bg-[#152e1e] border-b border-gray-100 dark:border-[#1e402a] pb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar productos..."
                                className="pl-9 bg-gray-50/50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={businessUnitFilter}
                            onValueChange={setBusinessUnitFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus:ring-[#13ec5b] rounded-xl">
                                <SelectValue placeholder="Unidad de Negocio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="alma_verde">Alma Verde</SelectItem>
                                <SelectItem value="alma_home">Alma Home</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            No se encontraron productos
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-100 dark:border-[#1e402a] hover:bg-transparent">
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12 px-6">Nombre</TableHead>
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12">Tipo</TableHead>
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12">Unidad</TableHead>
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12">Categoría</TableHead>
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12">Precio</TableHead>
                                        <TableHead className="text-gray-500 dark:text-gray-400 font-semibold h-12">Stock</TableHead>
                                        <TableHead className="text-right text-gray-500 dark:text-gray-400 font-semibold h-12 px-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id} className="border-gray-100 dark:border-[#1e402a]/50 hover:bg-gray-50/50 dark:hover:bg-[#1e402a]/30 transition-colors">
                                            <TableCell className="font-semibold text-gray-900 dark:text-white px-6 py-4">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {product.is_rental ? (
                                                    <Badge className="bg-blue-100/80 text-blue-800 hover:bg-blue-200 border-0 dark:bg-blue-900/30 dark:text-blue-300">
                                                        🔄 Renta
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-[#13ec5b]/10 text-[#102216] dark:text-[#13ec5b] hover:bg-[#13ec5b]/20 border-0">
                                                        🛒 Venta
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge className={
                                                    product.business_unit === 'alma_home' 
                                                        ? 'bg-amber-100/80 text-amber-800 hover:bg-amber-200 border-0 dark:bg-amber-900/30 dark:text-amber-300' 
                                                        : 'bg-[#13ec5b]/10 text-[#102216] dark:text-[#13ec5b] hover:bg-[#13ec5b]/20 border-0'
                                                }>
                                                    {product.business_unit === 'alma_home' ? 'Alma Home' : 'Alma Verde'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300 py-4">{product.category}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white font-medium py-4">
                                                <div>
                                                    {formatCurrency(product.price)}
                                                    {product.is_rental && product.rental_price && (
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                                            Renta: {formatCurrency(product.rental_price)}/día
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {product.in_stock ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 font-medium">
                                                        En Stock ({product.stock_quantity || '∞'})
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0 dark:bg-red-900/30 dark:text-red-400">Agotado</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right px-6 py-4">
                                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-[#13ec5b] hover:bg-[#13ec5b]/10 rounded-full" onClick={() => router.push(`/admin/products/${product.id}`)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
