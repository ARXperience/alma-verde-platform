'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft, Save, Plus, X, Star, Globe, ImageIcon, Eye } from 'lucide-react'

const PORTFOLIO_CATEGORIES = ['Stands', 'Activaciones', 'Mobiliario', 'Producción gráfica']

export default function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('Stands')
    const [images, setImages] = useState<string[]>([])
    const [featuredImage, setFeaturedImage] = useState('')
    const [published, setPublished] = useState(false)
    const [featured, setFeatured] = useState(false)
    const [customDetails, setCustomDetails] = useState<{ key: string, value: string }[]>([])

    // UI state
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchItem()
    }, [id])

    async function fetchItem() {
        try {
            setLoading(true)
            const res = await fetch(`/api/portfolio/${id}`)
            if (!res.ok) {
                router.push('/admin/portfolio')
                return
            }
            const { data } = await res.json()
            if (!data) {
                router.push('/admin/portfolio')
                return
            }
            setTitle(data.title || '')
            setCategory(data.tags?.[0] || 'Stands')
            setImages(data.gallery_images || [])
            setFeaturedImage(data.featured_image_url || '')
            setPublished(!!data.published_at)
            setFeatured(data.is_featured || false)

            // Parse description into narrative and custom details
            const rawLines = data.description ? data.description.split('\n') : [];
            const parsedDetails: { key: string, value: string }[] = [];
            const narrativeParagraphs: string[] = [];

            rawLines.forEach((line: string) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    narrativeParagraphs.push('');
                    return;
                }

                const match = trimmed.match(/^([^:]{2,30}):\s*(.+)$/);
                if (match && !match[1].includes('.') && match[2].length < 150) {
                    parsedDetails.push({ key: match[1].trim(), value: match[2].trim() });
                } else {
                    narrativeParagraphs.push(line);
                }
            });

            setDescription(narrativeParagraphs.join('\n').trim())
            setCustomDetails(parsedDetails.length > 0 ? parsedDetails : [
                { key: 'Cliente', value: '' },
                { key: 'Ubicación', value: '' }
            ])
        } catch (err) {
            console.error('Error fetching:', err)
            router.push('/admin/portfolio')
        } finally {
            setLoading(false)
        }
    }

    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = event.target.files
        if (!selectedFiles || selectedFiles.length === 0) return

        setUploading(true)
        try {
            const newImages: string[] = []
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('bucket', 'project-files')
                formData.append('folder', `portfolio`)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json()
                    throw new Error(errorData.error || 'Error subiendo imagen')
                }

                const { url } = await uploadRes.json()
                newImages.push(url)
            }

            setImages(prev => [...prev, ...newImages])
            if (!featuredImage && newImages.length > 0) {
                setFeaturedImage(newImages[0])
            }
        } catch (err: any) {
            console.error('Error uploading:', err)
            alert(err.message || 'Error al subir imágenes')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    function handleRemoveImage(url: string) {
        setImages(prev => prev.filter(img => img !== url))
        if (featuredImage === url) {
            const remaining = images.filter(img => img !== url)
            setFeaturedImage(remaining[0] || '')
        }
    }

    function addDetailField() {
        setCustomDetails(prev => [...prev, { key: '', value: '' }])
    }

    function removeDetailField(index: number) {
        setCustomDetails(prev => prev.filter((_, i) => i !== index))
    }

    function updateDetailField(index: number, field: 'key' | 'value', val: string) {
        setCustomDetails(prev => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: val }
            return next
        })
    }

    async function handleSave() {
        if (!title.trim()) {
            alert('El título es obligatorio')
            return
        }

        try {
            setSaving(true)

            // Compile description + custom details
            const validDetails = customDetails.filter(d => d.key.trim() && d.value.trim())
            const detailsString = validDetails.map(d => `${d.key.trim()}: ${d.value.trim()}`).join('\n')
            const finalDescription = [description.trim(), detailsString].filter(Boolean).join('\n\n')

            const payload = {
                title: title.trim(),
                description: finalDescription,
                featured_image_url: featuredImage || images[0] || '',
                gallery_images: images,
                tags: [category],
                is_featured: featured,
                display_order: 0,
                published_at: published ? new Date().toISOString() : null
            }

            const res = await fetch(`/api/portfolio/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Error actualizando proyecto')
            }

            alert('Proyecto actualizado exitosamente')
        } catch (err: any) {
            console.error('Error saving:', err)
            alert(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/admin/portfolio')} className="hover:bg-slate-100 text-slate-600 rounded-xl px-4 h-12">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black text-[#102216] tracking-tight">Editar Proyecto</h1>
                        <p className="text-slate-500 mt-1 text-lg">{title || 'Sin título'}</p>
                    </div>
                </div>
                {published && (
                    <Button variant="outline" onClick={() => window.open(`/portafolio/${id}`, '_blank')} className="rounded-xl h-12 px-6 border-slate-200 text-slate-600 hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] hover:border-[#13ec5b]/30">
                        <Eye className="w-5 h-5 mr-2" />
                        Ver en Web
                    </Button>
                )}
            </div>

            <div className="space-y-8">
                {/* Publish & Featured toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Globe className="w-6 h-6 text-[#0a8c35]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#102216] text-lg">Publicar en Web</h4>
                                    <p className="text-sm text-slate-500">Visible en el portafolio público</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPublished(!published)}
                                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                                    published ? 'bg-[#13ec5b]' : 'bg-slate-200'
                                }`}
                            >
                                <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                    published ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                            </button>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-50 rounded-xl">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#102216] text-lg">Proyecto Destacado</h4>
                                    <p className="text-sm text-slate-500">Mostrar con prioridad</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeatured(!featured)}
                                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                                    featured ? 'bg-yellow-400' : 'bg-slate-200'
                                }`}
                            >
                                <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                    featured ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Title & Category */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                        <CardTitle className="text-2xl font-bold text-[#102216]">Información del Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Título del Proyecto *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Stand Samsung CES 2025"
                                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] bg-slate-50"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Categoría</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-[#13ec5b] bg-slate-50">
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {PORTFOLIO_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="rounded-lg focus:bg-green-50 focus:text-green-900">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-bold text-slate-700">Descripción Narrativa del Proyecto</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe el proyecto, objetivos del cliente..."
                                rows={5}
                                className="resize-none rounded-xl border-slate-200 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] bg-slate-50 p-4"
                            />
                        </div>

                        <div className="pt-8 border-t border-slate-100 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-[#102216]">Detalles Específicos</h4>
                                    <p className="text-sm text-slate-500 mt-1">Estos aparecerán organizados en la tarjeta lateral del portafolio.</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addDetailField} className="rounded-xl h-10 px-4 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200">
                                    <Plus className="w-4 h-4 mr-2" /> Añadir Detalle
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {customDetails.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2 pl-4 rounded-xl border border-slate-100">
                                        <Input
                                            placeholder="Clave (ej: Cliente)"
                                            value={detail.key}
                                            onChange={(e) => updateDetailField(idx, 'key', e.target.value)}
                                            className="w-1/3 border-transparent bg-white shadow-sm focus-visible:ring-[#13ec5b] h-10 rounded-lg"
                                        />
                                        <Input
                                            placeholder="Valor (ej: Nike Colombia)"
                                            value={detail.value}
                                            onChange={(e) => updateDetailField(idx, 'value', e.target.value)}
                                            className="flex-1 border-transparent bg-white shadow-sm focus-visible:ring-[#13ec5b] h-10 rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeDetailField(idx)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg h-10 w-10 mr-1"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                                {customDetails.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-6 italic bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                        No se han añadido detalles específicos a la ficha técnica.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Image Gallery */}
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold text-[#102216]">Galería de Imágenes</CardTitle>
                                <CardDescription className="text-slate-500 mt-1">Sube las fotos del proyecto. Haz click en una imagen para hacerla principal.</CardDescription>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    multiple
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="rounded-xl h-12 px-6 border-slate-200 shadow-sm hover:bg-[#13ec5b]/10 hover:text-[#0a8c35] hover:border-[#13ec5b]/30"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5 mr-2" />
                                    )}
                                    Subir Imágenes
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {images.length === 0 ? (
                            <div
                                className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 cursor-pointer hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 transition-all duration-300"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50 text-slate-300" />
                                <p className="font-bold text-lg text-slate-600 mb-1">Arrastra o haz click para subir imágenes</p>
                                <p className="text-sm">JPG, PNG, WebP hasta 10MB</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((imgUrl, idx) => (
                                    <div key={idx} className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                                        <img
                                            src={imgUrl}
                                            alt={`Imagen ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                            <Button
                                                size="sm"
                                                onClick={() => setFeaturedImage(imgUrl)}
                                                disabled={featuredImage === imgUrl}
                                                className={`text-xs px-4 h-9 rounded-lg font-bold border-0 shadow-lg ${featuredImage === imgUrl ? 'bg-yellow-400 text-yellow-900 pointer-events-none' : 'bg-white text-slate-800 hover:bg-[#13ec5b] hover:text-[#102216]'}`}
                                            >
                                                {featuredImage === imgUrl ? '★ Principal' : 'Hacer Principal'}
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="h-9 w-9 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(imgUrl); }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {featuredImage === imgUrl && (
                                            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs px-3 py-1.5 rounded-md font-bold shadow-lg">
                                                ★ Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 pb-12">
                    <Button variant="outline" onClick={() => router.push('/admin/portfolio')} className="rounded-xl h-14 px-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-black rounded-xl h-14 px-8 shadow-[0_4px_20px_rgba(19,236,91,0.2)] transition-all hover:scale-[1.02]"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 mr-3" />
                        )}
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </div>
    )
}
