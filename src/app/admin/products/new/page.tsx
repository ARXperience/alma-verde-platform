'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Upload, X, ArrowLeft, ShoppingBag, RotateCcw } from 'lucide-react'
import Image from 'next/image'

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<string[]>([])

    // Form State
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [rentalPrice, setRentalPrice] = useState('')
    const [category, setCategory] = useState('')
    const [businessUnit, setBusinessUnit] = useState('alma_home')
    const [inStock, setInStock] = useState(true)
    const [stockQuantity, setStockQuantity] = useState('')
    const [isRental, setIsRental] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        try {
            setUploading(true)
            const file = e.target.files[0]
            const formData = new FormData()
            formData.append('file', file)
            formData.append('bucket', 'product-images')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error uploading file')
            }

            setImages([...images, data.url])
        } catch (error) {
            console.error('Error uploading image:', error)
            alert(`Error al subir la imagen: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('products')
                .insert({
                    name,
                    description,
                    price: parseFloat(price),
                    rental_price: isRental && rentalPrice ? parseFloat(rentalPrice) : null,
                    category,
                    business_unit: businessUnit,
                    stock_quantity: stockQuantity ? parseInt(stockQuantity) : null,
                    images,
                    is_rental: isRental,
                } as any)

            if (error) throw error

            router.push('/admin/products')
        } catch (error) {
            console.error('Error creating product:', JSON.stringify(error, null, 2))
            alert(`Error al crear el producto: ${JSON.stringify(error)}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/admin/products')} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-[#1e402a]/50 rounded-lg">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Nuevo Producto</h1>
                </div>

                <Card className="border-0 shadow-lg bg-white dark:bg-[#152e1e] rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-[#1e402a] pb-6">
                        <CardTitle className="text-xl text-gray-900 dark:text-white">Detalles del Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Tipo: Venta o Renta */}
                            <div className="space-y-4">
                                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Tipo de Producto</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsRental(false)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                            !isRental 
                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10 shadow-md' 
                                            : 'border-gray-200 dark:border-[#1e402a] bg-gray-50 dark:bg-[#102216] hover:border-gray-300 dark:hover:border-[#1e402a]/80'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${!isRental ? 'bg-[#13ec5b]/20 text-[#13ec5b]' : 'bg-gray-200 dark:bg-[#1e402a] text-gray-500 dark:text-gray-400'}`}>
                                            <ShoppingBag className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold ${!isRental ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>Venta</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Producto para vender</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsRental(true)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                            isRental 
                                            ? 'border-[#13ec5b] bg-[#13ec5b]/10 shadow-md' 
                                            : 'border-gray-200 dark:border-[#1e402a] bg-gray-50 dark:bg-[#102216] hover:border-gray-300 dark:hover:border-[#1e402a]/80'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isRental ? 'bg-[#13ec5b]/20 text-[#13ec5b]' : 'bg-gray-200 dark:bg-[#1e402a] text-gray-500 dark:text-gray-400'}`}>
                                            <RotateCcw className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold ${isRental ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>Renta / Alquiler</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Producto para alquilar</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-semibold">Nombre del Producto</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Ej: Silla Eames"
                                        className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl h-11"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-semibold">Categoría</Label>
                                    <Select value={category} onValueChange={setCategory} required>
                                        <SelectTrigger className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus:ring-[#13ec5b] rounded-xl h-11">
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FURNITURE">Mobiliario</SelectItem>
                                            <SelectItem value="DECORATION">Decoración</SelectItem>
                                            <SelectItem value="STAND">Stands</SelectItem>
                                            <SelectItem value="ACCESSORY">Accesorios</SelectItem>
                                            <SelectItem value="SERVICE">Servicios</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="price" className="text-gray-700 dark:text-gray-300 font-semibold">
                                        {isRental ? 'Precio de Venta (COP) — Opcional' : 'Precio de Venta (COP)'}
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required={!isRental}
                                        placeholder="0"
                                        className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl h-11"
                                    />
                                </div>

                                {isRental && (
                                    <div className="space-y-3">
                                        <Label htmlFor="rentalPrice" className="text-gray-700 dark:text-gray-300 font-semibold">Precio de Renta / día (COP)</Label>
                                        <Input
                                            id="rentalPrice"
                                            type="number"
                                            value={rentalPrice}
                                            onChange={(e) => setRentalPrice(e.target.value)}
                                            required
                                            placeholder="0"
                                            className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl h-11"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label htmlFor="businessUnit" className="text-gray-700 dark:text-gray-300 font-semibold">Unidad de Negocio</Label>
                                    <Select value={businessUnit} onValueChange={setBusinessUnit}>
                                        <SelectTrigger className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus:ring-[#13ec5b] rounded-xl h-11">
                                            <SelectValue placeholder="Seleccionar unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="alma_verde">Alma Verde (B2B)</SelectItem>
                                            <SelectItem value="alma_home">Alma Home (B2C)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-semibold">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-gray-700 dark:text-gray-300 font-semibold">Inventario</Label>
                                    <div className="flex items-center space-x-3 pt-2">
                                        <Switch
                                            checked={inStock}
                                            onCheckedChange={setInStock}
                                            className="data-[state=checked]:bg-[#13ec5b]"
                                        />
                                        <Label className="text-gray-700 dark:text-gray-300">{inStock ? 'Disponible' : 'Agotado'}</Label>
                                    </div>
                                </div>

                                {inStock && (
                                    <div className="space-y-3">
                                        <Label htmlFor="stock" className="text-gray-700 dark:text-gray-300 font-semibold">Cantidad (Opcional)</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={stockQuantity}
                                            onChange={(e) => setStockQuantity(e.target.value)}
                                            placeholder="Ilimitado"
                                            className="bg-gray-50 dark:bg-[#102216] border-gray-200 dark:border-[#1e402a] focus-visible:ring-[#13ec5b] rounded-xl h-11"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-gray-700 dark:text-gray-300 font-semibold">Imágenes</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((url, index) => (
                                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-[#1e402a] bg-gray-50 dark:bg-[#102216]">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 rounded-full bg-red-500 hover:bg-red-600"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-[#1e402a] rounded-xl hover:border-[#13ec5b] dark:hover:border-[#13ec5b] hover:bg-[#13ec5b]/5 transition-colors cursor-pointer relative bg-gray-50 dark:bg-[#102216]">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-[#13ec5b]" />
                                        ) : (
                                            <div className="text-center text-gray-500 dark:text-gray-400">
                                                <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                                <span className="text-xs font-medium">Subir imagen</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-[#1e402a]">
                                <Button type="button" variant="outline" className="border-gray-200 dark:border-[#1e402a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e402a] rounded-xl" onClick={() => router.push('/admin/products')}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#111813] font-bold shadow-md rounded-xl px-8">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear Producto
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
