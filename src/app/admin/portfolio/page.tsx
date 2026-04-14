'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Plus, Eye, Edit, Trash2, Globe, GlobeLock, Star } from 'lucide-react'

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
    created_at: string
    updated_at: string
}

export default function AdminPortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchPortfolioItems()
    }, [])

    async function fetchPortfolioItems() {
        try {
            setLoading(true)
            const res = await fetch('/api/portfolio/admin')
            const { data } = await res.json()
            setItems(data || [])
        } catch (err) {
            console.error('Error fetching portfolio:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este proyecto del portafolio?')) return
        try {
            setDeleting(id)
            const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setItems(items.filter(item => item.id !== id))
            }
        } catch (err) {
            console.error('Error deleting portfolio item:', err)
            alert('Error al eliminar')
        } finally {
            setDeleting(null)
        }
    }

    const filtered = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-[#102216] tracking-tight">Proyectos Propios</h1>
                    <p className="text-slate-500 mt-2 text-lg">Gestiona los proyectos de Alma Verde que se muestran en el portafolio público</p>
                </div>
                <Button onClick={() => router.push('/admin/portfolio/new')} className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold h-12 px-6 rounded-xl shadow-[0_4px_20px_rgba(19,236,91,0.2)] transition-all hover:-translate-y-1">
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Proyecto
                </Button>
            </div>

            <Card className="mb-10 border-none shadow-sm bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-white/50 border-slate-200 text-slate-800 rounded-xl focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] text-lg"
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[#13ec5b]" />
                </div>
            ) : filtered.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-transparent shadow-none rounded-3xl">
                    <CardContent className="py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                            <Globe className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#102216] mb-3">No hay proyectos en el portafolio</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">Crea tu primer proyecto para mostrarlo en la web pública y en el cotizador.</p>
                        <Button onClick={() => router.push('/admin/portfolio/new')} className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold h-12 px-8 rounded-xl shadow-[0_4px_20px_rgba(19,236,91,0.2)]">
                            <Plus className="w-5 h-5 mr-2" />
                            Crear Primer Proyecto
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((item) => (
                        <Card key={item.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-3xl hover:-translate-y-2">
                            {/* Image */}
                            <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden">
                                {item.featured_image_url ? (
                                    <img
                                        src={item.featured_image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Globe className="w-16 h-16 opacity-30" />
                                    </div>
                                )}
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {/* Status badge */}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    {item.published_at ? (
                                        <Badge className="bg-[#13ec5b] text-[#102216] font-bold border-0 shadow-lg px-3 py-1">
                                            <Globe className="w-3 h-3 mr-1.5" /> Publicado
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-white/90 text-slate-700 backdrop-blur-md shadow-lg font-semibold px-3 py-1">
                                            <GlobeLock className="w-3 h-3 mr-1.5" /> Borrador
                                        </Badge>
                                    )}
                                    {item.is_featured && (
                                        <Badge className="bg-yellow-400 text-yellow-900 font-bold border-0 shadow-lg px-3 py-1">
                                            <Star className="w-3 h-3 mr-1.5 fill-current" /> Destacado
                                        </Badge>
                                    )}
                                </div>
                                {/* Image count */}
                                {item.gallery_images && item.gallery_images.length > 0 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10 shadow-lg">
                                        {item.gallery_images.length} fotos
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="font-bold text-xl leading-tight text-[#102216] line-clamp-2">{item.title}</h3>
                                    {item.tags?.[0] && (
                                        <Badge variant="outline" className="shrink-0 text-xs bg-slate-50 border-slate-200 text-slate-600 px-2 py-1 rounded-md">{item.tags[0]}</Badge>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{item.description}</p>
                                )}
                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/admin/portfolio/${item.id}`)}
                                        className="flex-1 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] text-slate-600 rounded-lg h-10 font-medium transition-colors"
                                    >
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                    </Button>
                                    {item.published_at && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`/portafolio/${item.id}`, '_blank')}
                                            className="hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg h-10 px-3 transition-colors"
                                            title="Ver proyecto público"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-10 px-3 transition-colors"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deleting === item.id}
                                        title="Eliminar proyecto"
                                    >
                                        {deleting === item.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
