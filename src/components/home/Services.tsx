'use client'

import Link from "next/link"

const services = [
    {
        icon: 'architecture',
        title: 'Stand Design',
        description: 'Diseño arquitectónico innovador para ferias y exposiciones internacionales.',
    },
    {
        icon: 'chair',
        title: 'Mobiliario Comercial',
        description: 'Mobiliario a medida optimizado para el retail y la experiencia de usuario.',
    },
    {
        icon: 'rocket_launch',
        title: 'Activaciones de Marca',
        description: 'Experiencias inmersivas que conectan emocionalmente con el consumidor.',
    },
    {
        icon: 'event_seat',
        title: 'Instalaciones para Eventos',
        description: 'Montajes logísticos integrales para eventos corporativos y lanzamientos.',
    },
]

export function Services() {
    return (
        <section className="py-24 px-6 lg:px-20 bg-white/60 backdrop-blur-xl dark:bg-[#102216]/50" id="servicios">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-4xl font-black mb-4 font-display">Nuestros Servicios</h2>
                <p className="text-[#61896f]">Soluciones integrales desde el concepto hasta la instalación final.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="p-8 rounded-2xl bg-[#f6f8f6] dark:bg-white/5 border border-transparent hover:border-[#13ec5b] transition-all group"
                    >
                        <span className="material-symbols-outlined text-4xl text-[#13ec5b] mb-6 block group-hover:scale-110 transition-transform">
                            {service.icon}
                        </span>
                        <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                        <p className="text-sm text-[#61896f] leading-relaxed">{service.description}</p>
                    </div>
                ))}
            </div>
            <div className="text-center mt-12">
                <Link
                    href="/cotizar"
                    className="inline-block bg-[#13ec5b] text-[#111813] px-8 py-4 rounded-lg font-bold text-base hover:scale-105 transition-transform shadow-lg shadow-[#13ec5b]/20"
                >
                    Cotizar tu proyecto
                </Link>
            </div>
        </section>
    )
}
