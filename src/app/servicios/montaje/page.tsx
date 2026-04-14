import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Montaje Profesional | Alma Verde Diseño",
    description: "Servicio integral de montaje y desmontaje profesional para stands, eventos y espacios comerciales.",
}

const features = [
    { icon: 'engineering', title: 'Equipo Especializado', desc: 'Técnicos certificados con experiencia en montajes de alta complejidad.' },
    { icon: 'schedule', title: 'Cumplimiento de Plazos', desc: 'Gestión de tiempos precisa para entregas sin contratiempos.' },
    { icon: 'build', title: 'Herramienta Profesional', desc: 'Equipos y herramientas propias para cada tipo de instalación.' },
    { icon: 'verified_user', title: 'Seguridad Certificada', desc: 'Protocolos de seguridad y certificaciones estructurales incluidas.' },
]

export default function MontajePage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />

            <section className="relative overflow-hidden px-6 pt-16 pb-12 lg:px-12 lg:pt-24">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="inline-block rounded-full bg-[#13ec5b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#13ec5b] mb-6">Servicio Integral</span>
                    <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Montaje profesional</h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#61896f]">
                        Nos encargamos del montaje y desmontaje completo de tu stand o instalación. Logística, supervisión técnica y coordinación en sitio para que te concentres en tu negocio.
                    </p>
                </div>
            </section>

            <section className="px-6 py-12 lg:px-12 lg:pb-24">
                <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((item) => (
                        <div key={item.icon} className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 hover:border-[#13ec5b]/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#13ec5b]/10 text-[#13ec5b] group-hover:bg-[#13ec5b] group-hover:text-[#102216] transition-colors">
                                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                            </div>
                            <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-[#61896f]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-6 py-20 lg:px-12">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-900">
                    <div className="relative flex flex-col items-center justify-center px-8 py-16 text-center lg:py-24">
                        <h2 className="relative z-10 mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">¿Tienes un evento próximo?</h2>
                        <p className="relative z-10 mb-10 max-w-2xl text-lg text-slate-300">Coordinamos el montaje completo para que tú te enfoques en los resultados.</p>
                        <div className="relative z-10 flex flex-wrap justify-center gap-4">
                            <Link href="/cotizar" className="rounded-full bg-[#13ec5b] px-10 py-4 text-base font-bold text-[#102216] hover:scale-105 transition-transform">Solicitar Montaje</Link>
                            <Link href="/contacto" className="rounded-full border border-slate-700 bg-slate-800/50 px-10 py-4 text-base font-bold text-white hover:bg-slate-700 transition-colors">Contactar</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
