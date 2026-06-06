'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, User, Mail, Phone, FileText, MapPin, Calendar, MessageCircle } from 'lucide-react'

interface QuotationItem {
    concept: string
    qty: number
    unit_price: number
    total: number
}

interface Quotation {
    id: string
    reference: string
    customer_name: string
    customer_email: string
    customer_phone: string | null
    project_type: string | null
    description: string | null
    items: QuotationItem[]
    subtotal: number
    tax: number
    total: number
    status: string
    notes: string | null
    valid_until: string | null
    created_at: string
    updated_at: string
}

const STATUS_MAP: Record<string, string> = {
    'PENDING': 'Pendiente',
    'SENT': 'Enviada',
    'APPROVED': 'Aprobada',
    'REJECTED': 'Rechazada',
}

export default function QuotationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const quotationId = params.id as string

    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [notes, setNotes] = useState('')

    useEffect(() => {
        fetchQuotation()
    }, [quotationId])

    async function fetchQuotation() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('quotations')
                .select('*')
                .eq('id', quotationId)
                .single()

            if (error) throw error
            setQuotation(data as any)
            setNotes((data as any)?.notes || '')
        } catch (error) {
            console.error('Error fetching quotation:', error)
            router.push('/admin/quotations')
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(newStatus: string) {
        if (!quotation) return
        setUpdating(true)
        try {
            const { error } = await (supabase
                .from('quotations') as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', quotationId)

            if (error) throw error
            setQuotation({ ...quotation, status: newStatus })
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar el estado')
        } finally {
            setUpdating(false)
        }
    }

    async function handleSaveNotes() {
        if (!quotation) return
        setUpdating(true)
        try {
            const { error } = await (supabase
                .from('quotations') as any)
                .update({ notes, updated_at: new Date().toISOString() })
                .eq('id', quotationId)

            if (error) throw error
            setQuotation({ ...quotation, notes })
            alert('Notas guardadas')
        } catch (error) {
            console.error('Error saving notes:', error)
        } finally {
            setUpdating(false)
        }
    }

    function handleWhatsAppMessage() {
        if (!quotation) return
        const phone = quotation.customer_phone?.replace(/\D/g, '') || ''
        const message = encodeURIComponent(
            `¡Hola ${quotation.customer_name}! 👋\n\n` +
            `Le enviamos su cotización *${quotation.reference}* de Alma Verde Diseño:\n\n` +
            `📋 Proyecto: ${quotation.project_type || 'General'}\n` +
            `💰 Total: $${quotation.total.toLocaleString('es-CO')}\n\n` +
            `¿Le gustaría proceder? Quedamos atentos a sus comentarios.`
        )
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!quotation) return null

    const items: QuotationItem[] = Array.isArray(quotation.items) ? quotation.items : []

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/quotations')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Cotización #{quotation.reference}
                        <Badge variant="outline" className="text-base">
                            {STATUS_MAP[quotation.status] || quotation.status}
                        </Badge>
                    </h1>
                    <p className="text-gray-500">
                        Creada el {new Date(quotation.created_at).toLocaleDateString('es-CO')} a las {new Date(quotation.created_at).toLocaleTimeString('es-CO')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Description */}
                    {quotation.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Descripción del Proyecto
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 whitespace-pre-wrap">{quotation.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ítems de Cotización</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 italic">No hay ítems registrados</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Concepto</TableHead>
                                            <TableHead className="text-center">Cant.</TableHead>
                                            <TableHead className="text-right">P. Unitario</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.concept}</TableCell>
                                                <TableCell className="text-center">{item.qty}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                                            <TableCell className="text-right">{formatCurrency(quotation.subtotal)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium">IVA</TableCell>
                                            <TableCell className="text-right">{formatCurrency(quotation.tax)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                                            <TableCell className="text-right font-bold text-lg">{formatCurrency(quotation.total)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Internal Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas Internas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notas internas del equipo sobre esta cotización..."
                                className="w-full min-h-[120px] p-3 border rounded-xl resize-y text-sm focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50"
                            />
                            <Button onClick={handleSaveNotes} disabled={updating} className="rounded-xl">
                                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Guardar Notas
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Actualizar Estado</label>
                                <Select onValueChange={handleStatusChange} value={quotation.status} disabled={updating}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                        <SelectItem value="SENT">Enviada</SelectItem>
                                        <SelectItem value="APPROVED">Aprobada</SelectItem>
                                        <SelectItem value="REJECTED">Rechazada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {quotation.customer_phone && (
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={handleWhatsAppMessage}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Enviar por WhatsApp
                                </Button>
                            )}
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
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{quotation.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {quotation.customer_email}
                            </div>
                            {quotation.customer_phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {quotation.customer_phone}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Project Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Proyecto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tipo</p>
                                <p className="capitalize">{quotation.project_type || 'No especificado'}</p>
                            </div>
                            {quotation.valid_until && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                                    <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {new Date(quotation.valid_until).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
