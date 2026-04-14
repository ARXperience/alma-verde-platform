'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PaymentButtonProps {
    projectId?: string
    quotationId?: string
    amount: number
    label?: string
    className?: string
}

export function PaymentButton({ projectId, quotationId, amount, label = 'Pagar Ahora', className }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function handlePayment() {
        try {
            setLoading(true)
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    quotationId
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar el pago')
            }

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl
            } else {
                throw new Error('No se recibió la URL de pago')
            }

        } catch (error: any) {
            console.error('Payment error:', error)
            toast({
                title: 'Error',
                description: error.message || 'No se pudo iniciar el proceso de pago',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className={className}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            {label}
        </Button>
    )
}
