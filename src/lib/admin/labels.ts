// Spanish names for the codes stored in the database, so no admin screen shows "FURNITURE" or "CASH"

export type Tone = 'amber' | 'green' | 'sky' | 'indigo' | 'violet' | 'red' | 'slate'
type Status = Record<string, { label: string; tone: Tone }>

export const ORDER_STATUS: Status = {
    PENDING: { label: 'Pendiente', tone: 'amber' },
    PAID: { label: 'Pagada', tone: 'green' },
    PROCESSING: { label: 'En preparación', tone: 'sky' },
    SHIPPED: { label: 'Enviada', tone: 'indigo' },
    DELIVERED: { label: 'Entregada', tone: 'violet' },
    CANCELLED: { label: 'Cancelada', tone: 'red' },
}

export const QUOTATION_STATUS: Status = {
    PENDING: { label: 'Pendiente', tone: 'amber' },
    SENT: { label: 'Enviada', tone: 'sky' },
    APPROVED: { label: 'Aprobada', tone: 'green' },
    REJECTED: { label: 'Rechazada', tone: 'red' },
}

// Values the checkout stores (paymentMethod.toUpperCase())
export const PAYMENT_METHODS: Record<string, string> = {
    STRIPE: 'Tarjeta de crédito o débito',
    BOLD: 'Transferencia o link de Bold',
    CASH: 'Pago a convenir o efectivo',
}

export const PRODUCT_CATEGORIES: Record<string, string> = {
    FURNITURE: 'Mobiliario',
    DECORATION: 'Decoración',
    STAND: 'Stands',
    ACCESSORY: 'Accesorios',
    SERVICE: 'Servicios',
}

export const BUSINESS_UNITS: Record<string, string> = {
    alma_verde: 'Alma Verde',
    alma_home: 'Alma Home',
}

// Intents detected by the WhatsApp bot
export const LEAD_INTENTS: Record<string, string> = {
    cotizacion: 'Quiere cotizar',
    soporte: 'Soporte',
    informacion: 'Información',
    compra: 'Compra',
}

export const statusOf = (map: Status, code: string) => map[code] ?? { label: code, tone: 'slate' as Tone }

export const nameOf = (map: Record<string, string>, code?: string | null) =>
    code ? map[code] ?? code.charAt(0).toUpperCase() + code.slice(1).toLowerCase().replace(/_/g, ' ') : 'Sin definir'

// WhatsApp ids look like 573001234567@s.whatsapp.net or 1411…@lid (a private id that is not a phone number)
export function whatsappContact(id: string) {
    const [number, domain] = id.split('@')
    const isPhone = /^\d{8,15}$/.test(number) && (!domain || domain === 's.whatsapp.net' || domain === 'c.us')
    return { label: isPhone ? `+${number}` : 'Contacto privado', phone: isPhone ? number : null, broadcast: domain === 'broadcast' }
}
