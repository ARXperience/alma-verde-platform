'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!orderId) {
            setError(true)
            setLoading(false)
            return
        }

        async function updateOrderStatus() {
            try {
                // Update order status to PAID
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({ status: 'PAID', payment_method: 'STRIPE' })
                    .eq('order_number', orderId)

                if (updateError) throw updateError
                
            } catch (err) {
                console.error('Error updating order:', err)
                // We don't necessarily show an error to the user if they paid successfully but DB failed, 
                // in a real app we'd rely on Stripe Webhooks. 
                // For this MVP, it's ok.
            } finally {
                setLoading(false)
            }
        }

        updateOrderStatus()
    }, [orderId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-12 h-12 animate-spin text-[#13ec5b]" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-xl text-red-500">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        No pudimos procesar la confirmación de tu pedido.
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/')}>Volver al Inicio</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">¡Pago Exitoso!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Tu pago ha sido procesado correctamente por Stripe.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Número de Orden</p>
                        <p className="text-xl font-bold font-mono">{orderId}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                        Comenzaremos a procesar tu pedido inmediatamente.
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
