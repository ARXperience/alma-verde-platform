'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Package, User, MapPin } from 'lucide-react'
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

interface OrderItem {
    id: string
    name: string
    quantity: number
    unit_price: number
    total: number
}

interface Order {
    id: string
    order_number: string
    status: string
    created_at: string
    subtotal: number
    total: number
    shipping_address: string
    notes: string
    user: {
        email: string
        full_name: string
        phone: string
    }
    items: OrderItem[]
}

const STATUS_MAP: Record<string, string> = {
    'PENDING': 'Pendiente',
    'PAID': 'Pagada',
    'PROCESSING': 'Procesando',
    'SHIPPED': 'Enviada',
    'DELIVERED': 'Entregada',
    'CANCELLED': 'Cancelada'
}

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        fetchOrder()
    }, [orderId])

    async function fetchOrder() {
        try {
            setLoading(true)
            // Fetch order with user
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select(`
                    *,
                    user:users(email, full_name, phone)
                `)
                .eq('id', orderId)
                .single()

            if (orderError) throw orderError

            // Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)

            if (itemsError) throw itemsError

            setOrder({ ...(orderData as any), items: itemsData || [] })

        } catch (error) {
            console.error('Error fetching order:', error)
            router.push('/admin/orders')
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(newStatus: string) {
        if (!order) return
        setUpdating(true)
        try {
            const { error } = await (supabase
                .from('orders') as any)
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            setOrder({ ...order, status: newStatus })
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar el estado')
        } finally {
            setUpdating(false)
        }
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

    if (!order) return null

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Orden #{order.order_number}
                        <Badge variant="outline" className="text-base">
                            {STATUS_MAP[order.status]}
                        </Badge>
                    </h1>
                    <p className="text-gray-500">
                        Realizada el {new Date(order.created_at).toLocaleDateString()} a las {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Items del Pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                        <TableHead className="text-center">Cant</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(item.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                                        <TableCell className="text-right">{formatCurrency(order.subtotal)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg">{formatCurrency(order.total)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notas del Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 italic">"{order.notes}"</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Status Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Actualizar Estado</label>
                                <Select onValueChange={handleStatusChange} value={order.status} disabled={updating}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                        <SelectItem value="PAID">Pagada</SelectItem>
                                        <SelectItem value="PROCESSING">Procesando</SelectItem>
                                        <SelectItem value="SHIPPED">Enviada</SelectItem>
                                        <SelectItem value="DELIVERED">Entregada</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nombre</p>
                                <p>{order.user?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p>{order.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                <p>{order.user?.phone || 'No registrado'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Envío
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Dirección</p>
                                <p>{order.shipping_address}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
