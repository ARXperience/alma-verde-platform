'use client'

import { useState } from 'react'

const initialFormData = {
    name: '',
    company: '',
    email: '',
    phone: '',
    projectType: '',
    budget: '',
    description: '',
}

const fieldClassName = 'min-h-14 w-full rounded-xl border border-[#d5ddd6] bg-white px-4 text-base text-[#111813] outline-none transition placeholder:text-[#9aa49c] focus:border-[#168340] focus:ring-4 focus:ring-[#168340]/10'

export function ContactSection() {
    const [formData, setFormData] = useState(initialFormData)
    const [status, setStatus] = useState('')

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }))
        if (status) setStatus('')
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const subject = `Nuevo proyecto — ${formData.company || formData.name}`
        const body = [
            `Nombre: ${formData.name}`,
            `Empresa: ${formData.company || 'No indicada'}`,
            `Email: ${formData.email}`,
            `Teléfono: ${formData.phone || 'No indicado'}`,
            `Tipo de proyecto: ${formData.projectType}`,
            `Presupuesto estimado: ${formData.budget || 'Por definir'}`,
            '',
            'Descripción:',
            formData.description,
        ].join('\n')

        setStatus('Abriendo tu aplicación de correo con la solicitud preparada…')
        window.location.href = `mailto:info@almaverde.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }

    return (
        <section className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36" id="contacto">
            <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12 lg:gap-16">
                <div className="flex flex-col justify-between lg:col-span-5">
                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">Empecemos</p>
                        <h2 className="text-balance text-[clamp(3.2rem,6vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
                            Tu próxima idea merece un buen comienzo.
                        </h2>
                        <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
                            Cuéntanos lo esencial. Revisaremos tu solicitud y te ayudaremos a definir el siguiente paso.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <a href="mailto:info@almaverde.co" className="group">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Correo</span>
                            <p className="mt-2 text-base font-medium transition-colors group-hover:text-[#5cff8d]">info@almaverde.co</p>
                        </a>
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Base</span>
                            <p className="mt-2 text-base font-medium">Bogotá, Colombia</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] bg-[#f4f6f3] p-6 text-[#101510] sm:p-9 lg:col-span-7 lg:rounded-[2.5rem] lg:p-12">
                    <div className="mb-9 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#168340]">Brief inicial</p>
                            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Cuéntanos lo esencial.</h3>
                        </div>
                        <span className="hidden text-xs text-[#6b766d] sm:block">Respuesta en 1 día hábil</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Nombre <span className="text-[#168340]">*</span>
                                <input
                                    className={fieldClassName}
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Tu nombre"
                                    required
                                    value={formData.name}
                                    onChange={(event) => updateField('name', event.target.value)}
                                />
                            </label>
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Empresa
                                <input
                                    className={fieldClassName}
                                    name="company"
                                    autoComplete="organization"
                                    placeholder="Nombre de la empresa"
                                    value={formData.company}
                                    onChange={(event) => updateField('company', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Email <span className="text-[#168340]">*</span>
                                <input
                                    className={fieldClassName}
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="correo@empresa.com"
                                    required
                                    value={formData.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                />
                            </label>
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Teléfono
                                <input
                                    className={fieldClassName}
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+57 300 000 0000"
                                    value={formData.phone}
                                    onChange={(event) => updateField('phone', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Tipo de proyecto <span className="text-[#168340]">*</span>
                                <select
                                    className={fieldClassName}
                                    name="projectType"
                                    required
                                    value={formData.projectType}
                                    onChange={(event) => updateField('projectType', event.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Stand o exhibición">Stand o exhibición</option>
                                    <option value="Activación de marca">Activación de marca</option>
                                    <option value="Decoración y ambientación">Decoración y ambientación</option>
                                    <option value="Mobiliario comercial">Mobiliario comercial</option>
                                    <option value="Producción gráfica">Producción gráfica</option>
                                    <option value="Montaje">Montaje</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </label>
                            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                                Presupuesto estimado
                                <select
                                    className={fieldClassName}
                                    name="budget"
                                    value={formData.budget}
                                    onChange={(event) => updateField('budget', event.target.value)}
                                >
                                    <option value="">Por definir</option>
                                    <option value="$5M – $15M COP">$5M – $15M COP</option>
                                    <option value="$15M – $50M COP">$15M – $50M COP</option>
                                    <option value="$50M – $100M COP">$50M – $100M COP</option>
                                    <option value="Más de $100M COP">Más de $100M COP</option>
                                </select>
                            </label>
                        </div>

                        <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#526259]">
                            Cuéntanos sobre el proyecto <span className="text-[#168340]">*</span>
                            <textarea
                                className={`${fieldClassName} min-h-36 resize-y py-4`}
                                name="description"
                                placeholder="Objetivo, ciudad, fecha aproximada, dimensiones o cualquier detalle importante…"
                                required
                                value={formData.description}
                                onChange={(event) => updateField('description', event.target.value)}
                            />
                        </label>

                        <button
                            type="submit"
                            className="group flex min-h-14 w-full items-center justify-between rounded-full bg-[#132018] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#24402b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168340]"
                        >
                            Enviar solicitud por correo
                            <span aria-hidden="true" className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </button>

                        <div className="flex flex-col gap-2 text-xs leading-5 text-[#6b766d] sm:flex-row sm:items-center sm:justify-between">
                            <p>Al enviar se abrirá tu aplicación de correo con la información preparada.</p>
                            {status && <p className="font-medium text-[#168340]" aria-live="polite">{status}</p>}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
