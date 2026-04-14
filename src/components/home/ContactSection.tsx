'use client'

import { useState } from 'react'

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        description: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: connect to backend
        console.log('Form submitted:', formData)
    }

    return (
        <section className="py-24 px-6 lg:px-20 bg-white/60 backdrop-blur-xl dark:bg-[#102216]/60" id="contacto">
            <div className="grid lg:grid-cols-2 gap-20 max-w-7xl mx-auto">
                <div>
                    <h2 className="text-5xl font-black mb-8 leading-tight font-display">
                        Hablemos de tu próximo gran proyecto.
                    </h2>
                    <p className="text-[#61896f] text-lg mb-12">
                        Cuéntanos tu visión y nosotros nos encargamos de materializarla con la máxima excelencia.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b]">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <span className="text-lg font-medium">info@almaverde.co</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b]">
                                <span className="material-symbols-outlined">call</span>
                            </div>
                            <span className="text-lg font-medium">+57 300 123 4567</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b]">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <span className="text-lg font-medium">Bogotá, Colombia</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#f6f8f6] dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[#61896f]">Nombre</label>
                                <input
                                    className="w-full bg-white dark:bg-[#102216] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors"
                                    placeholder="Tu nombre"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[#61896f]">Empresa</label>
                                <input
                                    className="w-full bg-white dark:bg-[#102216] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors"
                                    placeholder="Nombre de empresa"
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[#61896f]">Email</label>
                                <input
                                    className="w-full bg-white dark:bg-[#102216] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors"
                                    placeholder="correo@ejemplo.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[#61896f]">Teléfono</label>
                                <input
                                    className="w-full bg-white dark:bg-[#102216] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors"
                                    placeholder="+57 300 000 0000"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[#61896f]">Descripción del proyecto</label>
                            <textarea
                                className="w-full bg-white dark:bg-[#102216] border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors"
                                placeholder="Cuéntanos brevemente qué necesitas..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#13ec5b] text-[#111813] font-black py-4 rounded-xl hover:bg-[#13ec5b]/90 transition-all shadow-lg shadow-[#13ec5b]/20"
                        >
                            Enviar solicitud
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}
