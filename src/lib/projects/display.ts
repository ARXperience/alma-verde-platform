// Shared presentation helpers for the client area (dashboard and project page)

// `dot` is the solid stage color used in the admin pipeline and board
export const PROJECT_STEPS = [
    { id: 'cotizacion', label: 'Cotización', dot: 'bg-amber-400' },
    { id: 'aprobado', label: 'Aprobado', dot: 'bg-[#13ec5b]' },
    { id: 'en_diseno', label: 'En diseño', dot: 'bg-sky-400' },
    { id: 'en_produccion', label: 'En producción', dot: 'bg-indigo-400' },
    { id: 'instalado', label: 'Instalado', dot: 'bg-teal-400' },
    { id: 'finalizado', label: 'Finalizado', dot: 'bg-violet-400' },
] as const

export const ACTIVE_STATUSES = ['aprobado', 'en_diseno', 'en_produccion', 'instalado']

// Admin uses a light background
const STATUS_CLASSES_LIGHT: Record<string, string> = {
    cotizacion: 'bg-amber-50 text-amber-700 ring-amber-200',
    aprobado: 'bg-[#13ec5b]/10 text-[#0a8c35] ring-[#13ec5b]/30',
    en_diseno: 'bg-sky-50 text-sky-700 ring-sky-200',
    en_produccion: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    instalado: 'bg-teal-50 text-teal-700 ring-teal-200',
    finalizado: 'bg-violet-50 text-violet-700 ring-violet-200',
    cancelado: 'bg-red-50 text-red-700 ring-red-200',
}

const STATUS_CLASSES: Record<string, string> = {
    cotizacion: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
    aprobado: 'bg-[#13ec5b]/15 text-[#13ec5b] ring-[#13ec5b]/30',
    en_diseno: 'bg-sky-400/15 text-sky-200 ring-sky-300/30',
    en_produccion: 'bg-indigo-400/15 text-indigo-200 ring-indigo-300/30',
    instalado: 'bg-teal-400/15 text-teal-200 ring-teal-300/30',
    finalizado: 'bg-violet-400/15 text-violet-200 ring-violet-300/30',
    cancelado: 'bg-red-400/15 text-red-200 ring-red-300/30',
}

export const statusLabel = (status: string) =>
    status === 'cancelado' ? 'Cancelado' : PROJECT_STEPS.find(step => step.id === status)?.label ?? status

export const statusClass = (status: string, theme: 'dark' | 'light' = 'dark') =>
    theme === 'light'
        ? STATUS_CLASSES_LIGHT[status] ?? 'bg-slate-50 text-slate-700 ring-slate-200'
        : STATUS_CLASSES[status] ?? 'bg-white/10 text-white/80 ring-white/20'

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

// "hace 3 horas", "ayer"…
export function timeAgo(date: string) {
    const minutes = Math.round((new Date(date).getTime() - Date.now()) / 60_000)
    if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
    const days = Math.round(hours / 24)
    if (Math.abs(days) < 30) return relative.format(days, 'day')
    return formatDate(date)
}

export const formatCOP = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)

export const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })

type Nameable = { title?: string; project_type?: string; extracted_variables?: { project_type?: string; square_meters?: number } | null }

// AI quotes are titled "Cotización - stand"; show "Stand de 9 m²" instead
export function projectName(project: Nameable) {
    if (project.title && !project.title.startsWith('Cotización')) return project.title
    const type = project.extracted_variables?.project_type || project.project_type || 'Proyecto'
    const area = project.extracted_variables?.square_meters
    const name = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
    return area ? `${name} de ${area} m²` : name
}

// First sentence of the briefing, for cards
export function briefExcerpt(text?: string | null, max = 140) {
    const first = (text || '').split(/(?<=[.!?])\s/)[0].trim()
    return first.length > max ? `${first.slice(0, max).trimEnd()}…` : first
}
