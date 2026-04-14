import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Nosotros | Alma Verde Diseño",
    description: "Conoce al equipo detrás de Alma Verde. Arquitectura, marketing espacial y sostenibilidad en cada proyecto.",
}

const stats = [
    { value: '150+', label: 'Proyectos Entregados', highlight: true },
    { value: '12', label: 'Premios de Diseño', highlight: false },
    { value: '08', label: 'Países Alcanzados', highlight: false },
    { value: '100%', label: 'Enfoque Sostenible', highlight: true },
]

const team = [
    { name: 'Julian Velez', role: 'Arquitecto Jefe & Fundador', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACM-b6Z2UxLCM35T2TvlYFgHMRfyD1DQSK4DHapnodp5RuVoBoHuDpKY7DrPMWKcVhkVmaeIv8wWwNUHnXGUTCByaRFgBWh5Plxl0IWP9NLa1XGVuCDiAVbReNxP_kVIKbaalqC1NIf4g_ovv0Xm_QCcBuR9MvkuCPrgw0rwN_geDHSMd-tXT4Wgjw4m0zSPOtLo3lLCegS817uirGrLp5pxQKiY7iJ4U76PjYfa9dm12eBSFqJVZaRk-rpgVoK1lCvN17FOKlLXk' },
    { name: 'Sofia Martinez', role: 'Directora de Estrategia', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAirjuF9S2Jlm12o3Vkb-QB-_Rk5FePYATj01E84bB01I0SX6xLKAf-LIishrhJey3uXe2YqiLEa-6kC4l3V6lWzNYuSBYrDt8C3i-5H7EZDbFcGR-OhSI0u2lffz7j9YVQOZZourpqJxtWnzhGMkwz1K7N2XAUjs-fTfc-bnyLHOfqDNTvtL87lbxtDAyYroW-WkO1njRxVKlULCYzPKp_uobVQRaFpPSg5LFlYMn0fQfrDUjvf9HmIYHAkgN6HbH9trd-2FnVkR4' },
    { name: 'Lucas Thorne', role: 'Consultor de Sostenibilidad', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpwMkfKkh9ZqjsvLtqK0ZZVAucYWBP8Ovl_i_nGdbmNjHtpwoeHGwLkSHaYWFOK5BMEJxqBfNzjG-HN8X1ilZ1_pEDDfHe-OBzWUgn1mHDpe79SiD8QsFTbDiV5MXkFoeFKcGxztH0Tmktv5qhNK7ya9Rl5RgJ2fqqjE2xZe55iR21J3iBKLgZGK2kG7X2TL-UxTLUYvC7cQU1umHZ5LzzHJUjcJJYd2t9nSuP941RrhQK776Q5p1RPGylMSoAIA_N5vBtm8kjig8' },
    { name: 'Elena Rivas', role: 'Diseñadora Principal', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQR1RdVnGQRAW81IuN_yeLL1PrDwk8mPBhSxG00hUs3RQWM9nVH5KGeu7tmuRTsryK8Oti4K2KqrTexMem944a3bNmzRTcVeAzPC1Fzsgu_aRFra9H8TzofaovgDN2agsLmdXo7IfICPaXm46h8ubJjOzXTBB1hTihbjMvVBylHTWMka6yFdcApjmHCfKk2vQI7S2FoNveV4SZS9zV9OmM6WKW884v7x_DlNrL0IU0eKYyrzEfRyPWf5vG3X6YV4stZeMV_ZUeIzs' },
]

const capabilities = [
    { icon: 'draw', title: 'Diseño a Medida', desc: 'Soluciones personalizadas para la identidad de cada marca.' },
    { icon: 'precision_manufacturing', title: 'Excelencia Técnica', desc: 'Modelado de última generación y análisis estructural.' },
    { icon: 'campaign', title: 'Integración de Marketing', desc: 'Cada decisión de diseño cumple un propósito comunicativo.' },
]

export default function NosotrosPage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />

            {/* Hero — Video de fondo full-width */}
            <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/almaverde.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/50 to-transparent" />
                </div>
                <div className="relative z-10 w-full px-6 md:px-20 lg:px-40 pb-16 md:pb-24">
                    <div className="max-w-[1200px] mx-auto">
                        <span className="bg-[#13ec5b] text-[#102216] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded mb-4 inline-block">Fundado en 2012</span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">Elevando Espacios,<br />Definiendo Marcas.</h1>
                    </div>
                </div>
            </section>

            {/* Contenido */}
            <section className="px-6 md:px-20 lg:px-40 py-12 md:py-20">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Precisión Arquitectónica + Marketing Estratégico</h2>
                            <p className="text-lg text-[#61896f] leading-relaxed">
                                En Alma Verde Diseño, creemos que un espacio es más que una estructura física — es una narrativa viva. Fundados con el principio de que la arquitectura debe ser tan funcional como comunicativa, cerramos la brecha entre la excelencia técnica y el storytelling de marca.
                            </p>
                            <p className="text-lg text-[#61896f] leading-relaxed">
                                Nuestro equipo multidisciplinario combina el rigor de la ingeniería estructural con la creatividad del marketing de alto nivel para crear entornos que no solo se ven bien, sino que rinden excepcionalmente para los objetivos de negocio de nuestros clientes.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className={`p-8 rounded-xl border ${stat.highlight ? 'bg-[#13ec5b]/10 border-[#13ec5b]/20' : 'bg-slate-200/30 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}>
                                    <div className={`text-4xl font-black mb-2 ${stat.highlight ? 'text-[#13ec5b]' : ''}`}>{stat.value}</div>
                                    <div className="text-sm font-bold uppercase tracking-wide text-slate-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Workshop */}
            <section className="bg-slate-100 dark:bg-slate-900/50 py-20 px-6 md:px-20 lg:px-40">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-full md:w-1/2 relative">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#13ec5b]/20 rounded-full blur-2xl" />
                        <img
                            alt="El Taller"
                            className="rounded-2xl shadow-2xl relative z-10 w-full"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPtwRXIfUNR54cvfejKJqtBIYpJrI8GEm8UfGJRa7G-vH1YuyivQPihMg79lYRInjLHEuJ_HNrvM5HEf5uedsQA3bxcYbyvdq-lwOJq-SWcPagysyk9sksk-zmUJUxUSifQPbabvIgYH5yG0UWye5vF-zSv6qTrp4Pm4MDczPhV42n8M4l3MsC9Xf4Rj8KxMfryEPiwe6F_z0FgYPS3Jfq1SUovinDhTzt0e3VpBxPs1iEgImx6z_5Zj3n20W_47CdmAPiY7esV_E"
                        />
                    </div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <h3 className="text-sm font-bold text-[#13ec5b] uppercase tracking-[0.2em]">Nuestro Oficio</h3>
                        <h2 className="text-4xl font-bold leading-tight">Experiencia en Cada Detalle</h2>
                        <p className="text-[#61896f] italic font-medium border-l-4 border-[#13ec5b] pl-4 py-2">
                            &quot;No solo diseñamos edificios; diseñamos experiencias que resuenan con el espíritu humano.&quot;
                        </p>
                        <div className="space-y-4 pt-4">
                            {capabilities.map((cap) => (
                                <div key={cap.icon} className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-[#13ec5b] p-2 bg-[#13ec5b]/10 rounded-lg">{cap.icon}</span>
                                    <div>
                                        <h4 className="font-bold">{cap.title}</h4>
                                        <p className="text-sm text-slate-500">{cap.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-6 md:px-20 lg:px-40">
                <div className="max-w-[1200px] mx-auto text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Conoce a los Visionarios</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Nuestro equipo es una mezcla diversa de arquitectos, estrategas de marca y especialistas ambientales trabajando en sinergia.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto">
                    {team.map((member) => (
                        <div key={member.name} className="group">
                            <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                                <img alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={member.img} />
                                <div className="absolute inset-0 bg-[#13ec5b]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="text-xl font-bold">{member.name}</h4>
                            <p className="text-[#13ec5b] text-sm font-semibold">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sustainability */}
            <section className="bg-[#102216] text-white py-24 px-6 md:px-20 lg:px-40 relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#13ec5b]/30 bg-[#13ec5b]/10">
                            <span className="material-symbols-outlined text-[#13ec5b] text-sm">eco</span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#13ec5b]">Compromiso Sostenible</span>
                        </div>
                        <h2 className="text-5xl font-black leading-tight">Producción Sostenible para un Mañana más Verde</h2>
                        <p className="text-slate-400 text-lg">
                            Nuestra esencia &apos;Alma Verde&apos; se integra en cada fase de producción. Abastecemos localmente, minimizamos residuos mediante fabricación digital de precisión y priorizamos materiales con bajo impacto ambiental.
                        </p>
                        <ul className="space-y-4">
                            {['Procesos de fabricación cero residuos', 'Fuentes de madera certificadas sostenibles', 'Soluciones arquitectónicas de energía pasiva'].map((item) => (
                                <li key={item} className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-[#13ec5b]">check_circle</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href="/contacto" className="inline-flex items-center gap-2 bg-[#13ec5b] text-[#102216] px-8 py-4 rounded-lg font-bold hover:scale-105 transition-transform">
                            Contáctanos <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                        <img alt="Materiales Sostenibles" className="rounded-xl w-full h-64 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_6I_KmsKxR8j-BLJF2pzfKH6OucssdAYcB3vDrU26wHs5bIV8qrcUraErw0rL1D6YDzZPh7uNaeH7fJVJtA4cggqwPjqaPDHH70QoyuhyIkJG3Pr5AxssSGZnvxRIyCgsKE7t8BOtbOAsrem-qKadvMlICtP3Oqjc-6pRxlRDSDvg4H_QgiSBa28yyhjYWilLtirCRPreSF4d3Upt2TDWPz3_mLWjsaNR163JxgxS9TvV32oHFvSDlLtzd730zmacV75IrOudS1o" />
                        <img alt="Energía Verde" className="rounded-xl w-full h-64 object-cover mt-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWfMcFjVlCpClMC0JzIisAhxdZjIgPTZ6hFJpt1OMXcg4_L6NHpcbkB9J8ZVUmE1-s_yZAcVA9RSTcsuCCp5PLMdEcTT1ZQ7arUeyzS9f1q12WshfSPe4DIqNlgiC3am9wn29cXPysUPejy8Wt2Yvns3ycY8AxSYmbybvHpI9u6fXdYQS62uXlFMcDy3aF0r8X1xnJF2DuadlcCTAb1wvJRkYK537tHLQ8_w3PAyMKFzPhHQCWNhEH_CrVDVJYE4uye80ltuyaVrE" />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
