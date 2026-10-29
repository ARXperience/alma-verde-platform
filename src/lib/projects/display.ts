// Shared presentation helpers for the client area (dashboard and project page)

export const PROJECT_STEPS = [
    { id: 'cotizacion', label: 'Cotización' },
    { id: 'aprobado', label: 'Aprobado' },
    { id: 'en_diseno', label: 'En diseño' },
    { id: 'en_produccion', label: 'En producción' },
    { id: 'instalado', label: 'Instalado' },
    { id: 'finalizado', label: 'Finalizado' },
] as const

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

export const statusClass = (status: string) => STATUS_CLASSES[status] ?? 'bg-white/10 text-white/80 ring-white/20'

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
