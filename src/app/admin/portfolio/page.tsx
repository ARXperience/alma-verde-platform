'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Globe, Images, Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { FilterChip, PageHeader, Pill, SearchBox, Stat } from '@/components/admin/ui'
import { storyExcerpt } from '@/lib/projects/display'

interface PortfolioItem {
    id: string
    title: string
    description: string
    featured_image_url: string
    gallery_images: string[]
    tags: string[]
    is_featured: boolean
    display_order: number
    published_at: string | null
}

const STATES = [
    { id: 'all', label: 'Todos', test: () => true },
    { id: 'published', label: 'Publicados', test: (i: PortfolioItem) => !!i.published_at },
    { id: 'draft', label: 'Borradores', test: (i: PortfolioItem) => !i.published_at },
    { id: 'featured', label: 'Destacados', test: (i: PortfolioItem) => i.is_featured },
]

export default function AdminPortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [state, setState] = useState('all')
    const [category, setCategory] = useState('all')
    const [busy, setBusy] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/portfolio/admin').then(res => res.json()).then(({ data }) => {
            setItems(data || [])
            setLoading(false)
        })
    }, [])

    async function update(item: PortfolioItem, changes: Partial<PortfolioItem>) {
        setBusy(item.id)
        const res = await fetch(`/api/portfolio/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changes),
        })
        if (res.ok) setItems(list => list.map(i => (i.id === item.id ? { ...i, ...changes } : i)))
        else alert('No se pudo guardar el cambio')
        setBusy(null)
    }

    async function remove(item: PortfolioItem) {
        if (!confirm(`¿Eliminar "${item.title}" del portafolio? Esta acción no se puede deshacer.`)) return
        setBusy(item.id)
        const res = await fetch(`/api/portfolio/${item.id}`, { method: 'DELETE' })
        if (res.ok) setItems(list => list.filter(i => i.id !== item.id))
        else alert('No se pudo eliminar')
        setBusy(null)
    }

    const term = search.trim().toLowerCase()
    const categories = [...new Set(items.map(i => i.tags?.[0]).filter(Boolean))] as string[]
    const stateTest = STATES.find(s => s.id === state)!.test
    const visible = items.filter(i =>
        stateTest(i) &&
        (category === 'all' || i.tags?.[0] === category) &&
        (!term || i.title?.toLowerCase().includes(term) || i.tags?.some(t => t.toLowerCase().includes(term)))
    )
    const photos = items.reduce((sum, i) => sum + (i.gallery_images?.length || 0), 0)

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow="Sitio web"
                title="Portafolio"
                description="Proyectos de Alma Verde que se muestran en la página pública"
                actions={
                    <>
                        <Link href="/portafolio" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:text-[#102216]">
                            <Globe className="h-4 w-4" /> Ver en la web
                        </Link>
                        <Link href="/admin/portfolio/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#13ec5b] px-5 text-sm font-bold text-[#102216] shadow-sm transition-transform hover:-translate-y-0.5">
                            <Plus className="h-4 w-4" /> Nuevo proyecto
                        </Link>
                    </>
                }
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Proyectos" value={items.length} />
                <Stat label="Publicados" value={items.filter(i => i.published_at).length} />
                <Stat label="Destacados" value={items.filter(i => i.is_featured).length} hint="Aparecen primero en la web" />
                <Stat label="Fotos" value={photos} />
            </div>

            <div className="mb-6 flex flex-col gap-4">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar proyecto o categoría…" />
                <div className="flex flex-wrap gap-2">
                    {STATES.map(s => (
                        <FilterChip key={s.id} active={state === s.id} onClick={() => setState(s.id)} label={s.label} count={items.filter(s.test).length} />
                    ))}
                    <span className="mx-1 hidden w-px bg-slate-200 sm:block" />
                    <FilterChip active={category === 'all'} onClick={() => setCategory('all')} label="Todas las categorías" />
                    {categories.map(c => (
                        <FilterChip key={c} active={category === c} onClick={() => setCategory(c)} label={c} count={items.filter(i => i.tags?.[0] === c).length} />
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : visible.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center shadow-sm">
                    <Globe className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                    <p className="font-bold text-[#102216]">{items.length ? 'No hay proyectos con estos filtros' : 'El portafolio está vacío'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map(item => (
                        <article key={item.id} className={`group overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-lg ${busy === item.id ? 'opacity-60' : ''}`}>
                            <Link href={`/admin/portfolio/${item.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
                                {item.featured_image_url ? (
                                    <img src={item.featured_image_url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="grid h-full place-items-center"><Globe className="h-12 w-12 text-slate-300" /></div>
                                )}
                                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                                    <Pill tone={item.published_at ? 'green' : 'slate'}>{item.published_at ? 'Publicado' : 'Borrador'}</Pill>
                                    {item.is_featured && <Pill tone="amber"><Star className="h-3 w-3 fill-current" /> Destacado</Pill>}
                                </div>
                                {item.gallery_images?.length > 0 && (
                                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                                        <Images className="h-3.5 w-3.5" /> {item.gallery_images.length}
                                    </span>
                                )}
                            </Link>
                            <div className="p-4">
                                {item.tags?.[0] && <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.tags[0]}</p>}
                                <Link href={`/admin/portfolio/${item.id}`} className="mt-1 line-clamp-1 font-bold text-[#102216] hover:text-[#0a8c35]">{item.title}</Link>
                                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">{storyExcerpt(item.description)}</p>
                                <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3">
                                    <Action onClick={() => update(item, { published_at: item.published_at ? null : new Date().toISOString() })} disabled={busy === item.id} title={item.published_at ? 'Ocultar de la web' : 'Publicar en la web'}>
                                        {item.published_at ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        {item.published_at ? 'Ocultar' : 'Publicar'}
                                    </Action>
                                    <Action onClick={() => update(item, { is_featured: !item.is_featured })} disabled={busy === item.id} title={item.is_featured ? 'Quitar de destacados' : 'Destacar en la web'} active={item.is_featured}>
                                        <Star className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} /> Destacar
                                    </Action>
                                    <Link href={`/admin/portfolio/${item.id}`} className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#102216]" title="Editar">
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                    <button onClick={() => remove(item)} disabled={busy === item.id} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

function Action({ onClick, disabled, title, active, children }: { onClick: () => void; disabled: boolean; title: string; active?: boolean; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors hover:bg-slate-100 ${active ? 'text-amber-600' : 'text-slate-600'}`}
        >
            {children}
        </button>
    )
}
