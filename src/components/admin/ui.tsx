import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { statusClass, statusLabel } from '@/lib/projects/display'
import type { Tone } from '@/lib/admin/labels'

const TONES: Record<Tone, string> = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    green: 'bg-[#13ec5b]/10 text-[#0a8c35] ring-[#13ec5b]/30',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    slate: 'bg-slate-50 text-slate-600 ring-slate-200',
}

export function Pill({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${TONES[tone]}`}>
            {children}
        </span>
    )
}

// Rounded filter button with a counter, used on every admin list
export function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${active ? 'bg-[#102216] text-white' : 'bg-white text-slate-600 shadow-sm hover:text-[#102216]'}`}
        >
            {label} {count !== undefined && <span className={active ? 'text-[#13ec5b]' : 'text-slate-400'}>{count}</span>}
        </button>
    )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
    return (
        <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm focus:border-[#13ec5b] focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/20"
            />
        </div>
    )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-black text-[#102216]">{value}</p>
            {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
        </div>
    )
}

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
