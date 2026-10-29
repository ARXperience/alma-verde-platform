import type { ReactNode } from 'react'
import { statusClass, statusLabel } from '@/lib/projects/display'

export function PageHeader({ eyebrow, title, description, actions }: {
    eyebrow?: string
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
}) {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a8c35]">{eyebrow}</p>}
                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#102216] md:text-4xl">{title}</h1>
                {description && <p className="mt-1 text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass(status, 'light')}`}>
            {statusLabel(status)}
        </span>
    )
}

// Image of a project (its main render) or a soft brand placeholder
export function ProjectThumb({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
    return src ? (
        <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
    ) : (
        <div className={`bg-[radial-gradient(circle_at_30%_20%,rgba(19,236,91,0.35),transparent_60%),linear-gradient(135deg,#1a3a2a,#102216)] ${className}`} />
    )
}
