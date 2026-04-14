'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, cartTotal, clearCart } = useCart()
    const { user } = useAuth()

    // Form State
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')

    const [formData, setFormData] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            alert('El carrito está vacío')
            return
        }

        if (!user) {
            alert('Debes iniciar sesión para completar la compra')
            router.push('/auth/login?redirect=/checkout')
            return
        }

        setLoading(true)

        try {
            // 1. Create Order
            const newOrderNumber = `ORD-${Date.now()}` // Simple ID generation

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: newOrderNumber,
                    user_id: user.id,
                    subtotal: cartTotal,
                    tax: 0, // Simplified for now
                    total: cartTotal,
                    status: 'PENDING',
                    shipping_address: `${formData.address}, ${formData.city}`,
                    notes: formData.notes,
                    payment_method: 'PENDING'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total: item.price * item.quantity,
                product_id: item.productId,
                is_rental: false // Default
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // 3. Success
            setOrderNumber(newOrderNumber)
            setSuccess(true)
            clearCart()

        } catch (error) {
            console.error('Error creating order:', error)
            alert('Error al procesar la orden. Por favor intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">¡Pedido Recibido!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            Gracias por tu compra. Hemos recibido tu pedido exitosamente.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Número de Orden</p>
                            <p className="text-xl font-bold font-mono">{orderNumber}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Te contactaremos pronto para coordinar el pago y envío.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/')}>
                            Volver al Inicio
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-3xl font-bold">Finalizar Compra</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <Card className="h-fit order-2 lg:order-1">
                        <CardHeader>
                            <CardTitle>Resumen del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {items.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
                            ) : (
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{item.name}</h4>
                                                <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Envío</span>
                                    <span>Por calcular</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checkout Form */}
                    <Card className="order-1 lg:order-2">
                        <CardHeader>
                            <CardTitle>Datos de Envío y Contacto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Tu nombre completo"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="+57 300 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección de Entrega</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Calle 123 # 45-67, Apto 101"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Bogotá, Medellín, Cali..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                                    <Input
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Instrucciones especiales para la entrega"
                                    />
                                </div>

                                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Confirmar Pedido'
                                    )}
                                </Button>

                                <p className="text-xs text-center text-gray-500">
                                    Al confirmar, nos pondremos en contacto contigo para finalizar el pago y coordinar el envío.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
