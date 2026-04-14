import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

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

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    // Use first image or placeholder
    const mainImage = product.images && product.images.length > 0
        ? product.images[0]
        : '/placeholder-product.jpg' // Ensure you have a placeholder or handle this

    return (
        <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-all duration-300">
            <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-1">Agotado</Badge>
                    </div>
                )}
                {product.compare_price && product.compare_price > product.price && (
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-red-500">Oferta</Badge>
                    </div>
                )}
            </Link>

            <CardContent className="p-4 flex-1">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</div>
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-baseline gap-2 mt-auto">
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.compare_price)}
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full" disabled={!product.in_stock} variant={product.business_unit === 'ALMA_HOME' ? 'default' : 'secondary'}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Agregar
                </Button>
            </CardFooter>
        </Card>
    )
}
