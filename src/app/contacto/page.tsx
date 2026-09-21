'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const contactInfo = [
    { Icon: Mail, title: 'Escríbenos', lines: ['info@almaverde.co'] },
    { Icon: Phone, title: 'Llámanos', lines: ['+57 300 123 4567'] },
    { Icon: MapPin, title: 'Estamos en', lines: ['Bogotá, Colombia'] },
    { Icon: Clock3, title: 'Horario', lines: ['Lun – Vie · 9:00 – 18:00'] },
]

const projectTypes = [
    ['stand', 'Diseño de stand'],
    ['mobiliario', 'Mobiliario comercial'],
    ['activacion', 'Activación de marca'],
    ['produccion', 'Producción gráfica'],
    ['montaje', 'Montaje profesional'],
    ['otro', 'Otro proyecto'],
]

const fieldClass = 'h-12 w-full rounded-xl border border-[#183122]/12 bg-[#f5f7f3] px-4 text-sm text-[#0d1710] outline-none transition placeholder:text-[#819087] focus:border-[#16b852]/55 focus:bg-white focus:ring-4 focus:ring-[#13ec5b]/8'
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-[#5e7165]'

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        projectType: '',
        budget: '',
        description: '',
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        console.log('Form submitted:', formData)
    }

    return (
        <main className="min-h-screen bg-[#edf1eb] text-[#0b140e] font-display">
            <Header />

            <section className="relative isolate overflow-hidden bg-[#09110c] text-white" data-assistant-section="contact">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(19,236,91,0.16),transparent_25%),radial-gradient(circle_at_8%_92%,rgba(107,141,116,0.18),transparent_32%)]" />
                <div className="mx-auto grid max-w-[1500px] gap-14 px-6 pb-16 pt-20 md:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-16 lg:pb-24 lg:pt-24">
                    <div className="flex flex-col justify-between">
                        <div>
                            <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#13ec5b]">
                                <span className="h-px w-10 bg-[#13ec5b]" />
                                Empecemos por tu idea
                            </div>
                            <h1 className="max-w-3xl text-[clamp(3.3rem,6.3vw,6.8rem)] font-black leading-[0.88] tracking-[-0.065em]">
                                Tu próximo espacio empieza con una conversación.
                            </h1>
                            <p className="mt-8 max-w-xl text-base leading-7 text-white/60 md:text-lg md:leading-8">
                                Cuéntanos qué quieres lograr. Nosotros convertimos objetivos, tiempos y necesidades en una propuesta clara y construible.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-2.5">
                                {['Estrategia', 'Diseño 3D', 'Fabricación', 'Montaje'].map((item) => (
                                    <span key={item} className="rounded-full border border-white/12 bg-white/[0.045] px-4 py-2 text-xs font-semibold text-white/62">{item}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-14 border-t border-white/12 pt-7">
                            <div className="flex items-center gap-3 text-sm text-white/65">
                                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#13ec5b] text-[#07110a]"><Check size={16} strokeWidth={3} /></span>
                                Respuesta inicial en un día hábil
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] bg-[#fbfcf9] p-5 text-[#0b140e] shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:p-8 lg:p-10" data-assistant-section="form">
                        <div className="mb-8 flex items-start justify-between gap-6 border-b border-[#183122]/10 pb-7">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#16a94d]">Brief inicial · 2 minutos</span>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] md:text-3xl">Cuéntanos sobre el proyecto</h2>
                            </div>
                            <span className="hidden h-10 w-10 place-items-center rounded-full bg-[#e1f8e8] text-[#119b43] sm:grid"><ArrowUpRight size={18} /></span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <label>
                                    <span className={labelClass}>Nombre completo</span>
                                    <input required autoComplete="name" className={fieldClass} placeholder="Tu nombre" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                                </label>
                                <label>
                                    <span className={labelClass}>Empresa</span>
                                    <input autoComplete="organization" className={fieldClass} placeholder="Nombre de empresa" value={formData.company} onChange={(event) => setFormData({ ...formData, company: event.target.value })} />
                                </label>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label>
                                    <span className={labelClass}>Email</span>
                                    <input required autoComplete="email" type="email" className={fieldClass} placeholder="correo@ejemplo.com" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                                </label>
                                <label>
                                    <span className={labelClass}>Teléfono</span>
                                    <input autoComplete="tel" type="tel" className={fieldClass} placeholder="+57 300 000 0000" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
                                </label>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label>
                                    <span className={labelClass}>Tipo de proyecto</span>
                                    <select required className={fieldClass} value={formData.projectType} onChange={(event) => setFormData({ ...formData, projectType: event.target.value })}>
                                        <option value="">Seleccionar</option>
                                        {projectTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                </label>
                                <label>
                                    <span className={labelClass}>Presupuesto estimado</span>
                                    <select className={fieldClass} value={formData.budget} onChange={(event) => setFormData({ ...formData, budget: event.target.value })}>
                                        <option value="">Por definir</option>
                                        <option value="5-15m">$5M – $15M COP</option>
                                        <option value="15-50m">$15M – $50M COP</option>
                                        <option value="50-100m">$50M – $100M COP</option>
                                        <option value="100m+">$100M+ COP</option>
                                    </select>
                                </label>
                            </div>

                            <label>
                                <span className={labelClass}>¿Qué necesitas crear?</span>
                                <textarea
                                    required
                                    rows={5}
                                    className={`${fieldClass} h-auto resize-none py-3.5 leading-6`}
                                    placeholder="Cuéntanos el objetivo, la ciudad, las fechas y cualquier detalle importante…"
                                    value={formData.description}
                                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                                />
                            </label>

                            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
                                <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#13ec5b] px-7 py-3.5 text-sm font-black text-[#07110a] shadow-[0_12px_28px_rgba(19,236,91,0.2)] transition hover:-translate-y-0.5 hover:bg-[#27f36c]">
                                    Enviar solicitud <Send size={16} />
                                </button>
                                <p className="text-xs leading-5 text-[#718078]">Usaremos tus datos únicamente para responder esta solicitud.</p>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-6 py-16 md:px-10 lg:px-16 lg:py-20">
                <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.23em] text-[#13a94a]">Contacto directo</span>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] md:text-5xl">También puedes encontrarnos aquí.</h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-[#68776e]">Elige el canal que te resulte más cómodo. Nuestro equipo comercial y creativo te orientará.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {contactInfo.map(({ Icon, title, lines }) => (
                        <article key={title} className="group rounded-[24px] border border-[#183122]/10 bg-white/68 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,40,22,0.08)]">
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ddf6e4] text-[#11a148]"><Icon size={19} /></span>
                            <h3 className="mt-8 text-lg font-black">{title}</h3>
                            {lines.map((line) => <p key={line} className="mt-1 text-sm text-[#68776e]">{line}</p>)}
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-t border-[#183122]/8 bg-[#f7f9f5]">
                <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-14 md:grid-cols-3 md:px-10 lg:px-16">
                    {[
                        ['01', 'Entendemos', 'Objetivo, público, espacio, tiempos y alcance.'],
                        ['02', 'Proponemos', 'Concepto, solución técnica y ruta de producción.'],
                        ['03', 'Construimos', 'Fabricación, coordinación y montaje en sitio.'],
                    ].map(([number, title, description]) => (
                        <div key={number} className="border-l border-[#183122]/12 pl-5">
                            <span className="text-xs font-black text-[#12ae4b]">{number}</span>
                            <h3 className="mt-4 text-xl font-black">{title}</h3>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-[#68776e]">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    )
}
