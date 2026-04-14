'use client'

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useState } from "react"

const contactInfo = [
    { icon: 'location_on', title: 'Oficina Principal', lines: ['Calle de la Innovación 45', 'Bogotá, Colombia'] },
    { icon: 'call', title: 'Teléfono', lines: ['+57 300 123 4567'] },
    { icon: 'mail', title: 'Email', lines: ['info@almaverde.co'] },
    { icon: 'schedule', title: 'Horario', lines: ['Lun – Vie: 9:00 – 18:00', 'Sáb: 10:00 – 14:00'] },
]

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        name: '', company: '', email: '', phone: '', projectType: '', budget: '', description: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
    }

    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />
            <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:py-24">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Left */}
                    <div>
                        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
                            Construyamos algo <span className="text-[#13ec5b] underline decoration-[#13ec5b]/30 underline-offset-8">extraordinario</span> juntos.
                        </h1>
                        <p className="mt-6 max-w-lg text-lg text-[#61896f] leading-relaxed">
                            Ya sea que busques arquitectura sostenible, renovación de interiores o planificación de espacios, nuestro equipo está listo para dar vida a tu visión.
                        </p>
                        <div className="mt-12 space-y-8">
                            {contactInfo.map((info) => (
                                <div key={info.icon} className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13ec5b]/10 text-[#13ec5b]">
                                        <span className="material-symbols-outlined">{info.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">{info.title}</h3>
                                        {info.lines.map((line) => (
                                            <p key={line} className="text-sm text-[#61896f]">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="bg-white dark:bg-slate-900/50 p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <h2 className="text-2xl font-bold mb-8">Solicitar información</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Nombre completo</label>
                                    <input className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Empresa</label>
                                    <input className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" placeholder="Nombre de empresa" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Email</label>
                                    <input className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" placeholder="correo@ejemplo.com" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Teléfono</label>
                                    <input className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" placeholder="+57 300 000 0000" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Tipo de proyecto</label>
                                    <select className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" value={formData.projectType} onChange={(e) => setFormData({...formData, projectType: e.target.value})}>
                                        <option value="">Seleccionar...</option>
                                        <option value="stand">Diseño de Stand</option>
                                        <option value="mobiliario">Mobiliario Comercial</option>
                                        <option value="activacion">Activación de Marca</option>
                                        <option value="produccion">Producción Gráfica</option>
                                        <option value="montaje">Montaje Profesional</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-[#61896f]">Presupuesto estimado</label>
                                    <select className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}>
                                        <option value="">Seleccionar...</option>
                                        <option value="5-15m">$5M - $15M COP</option>
                                        <option value="15-50m">$15M - $50M COP</option>
                                        <option value="50-100m">$50M - $100M COP</option>
                                        <option value="100m+">$100M+ COP</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-[#61896f]">Descripción del proyecto</label>
                                <textarea className="w-full bg-[#f6f8f6] dark:bg-[#102216] border border-slate-200 dark:border-slate-700 rounded-lg p-3 outline-none focus:border-[#13ec5b] transition-colors" placeholder="Cuéntanos sobre tu proyecto, fechas, ubicación..." rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-[#13ec5b] text-[#111813] font-black py-4 rounded-xl hover:bg-[#13ec5b]/90 transition-all shadow-lg shadow-[#13ec5b]/20">
                                Enviar solicitud
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}
