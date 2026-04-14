import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Stands Ecológicos | Alma Verde Diseño",
    description: "Diseñamos y construimos stands sostenibles con materiales reutilizables y respetuosos con el medio ambiente.",
}

const features = [
    { icon: 'view_in_ar', label: 'Diseño 3D personalizado' },
    { icon: 'view_module', label: 'Estructuras modulares' },
    { icon: 'local_shipping', label: 'Optimización de transporte' },
    { icon: 'verified', label: 'Acabados premium' },
]

export default function StandsEcologicosPage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />
            <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 flex flex-col gap-8">
                        <div>
                            <span className="text-[#13ec5b] font-bold tracking-widest text-xs uppercase">Arquitectura Sostenible</span>
                            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight mt-4">Stands ecológicos</h1>
                            <p className="text-[#61896f] text-lg leading-relaxed max-w-xl mt-6">
                                Diseñamos y construimos stands sostenibles utilizando materiales reutilizables y respetuosos con el medio ambiente. Nuestras soluciones incluyen estructuras modulares, transporte ligero y componentes reutilizables para minimizar el impacto ambiental.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            {features.map((f) => (
                                <div key={f.icon} className="flex items-start gap-3">
                                    <div className="bg-[#13ec5b]/10 p-2 rounded-lg text-[#13ec5b] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">{f.icon}</span>
                                    </div>
                                    <span className="font-medium">{f.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/cotizar" className="bg-[#13ec5b] text-[#111813] px-8 py-4 rounded-full font-bold text-base hover:shadow-lg hover:shadow-[#13ec5b]/20 transition-all">Ver proyectos</Link>
                            <Link href="/contacto" className="border-2 border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Saber más</Link>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 relative">
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
                            <img alt="Stand ecológico premium" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDexqW4XNUcio52ePIXyH24xiYDmrsLPyv7vA7D_Kc5ngOy8cAw-hAEeJY_p5Qq_HwlRLzIC27ouQh5Rw7jUXGkxrKVggUm1qo7Z63zfEWVhYt_OmkE_-xDD2eZLE97sqi0Na84Z5ikgaeP0YjZCJHbDLdhIjLM7Wd_-rSw6jiCZcZvrSgUvmuk8MVdke-FlDfFYw2Ctnqb0wHG0g5ndSbqlsPLGxDtI-iV0nwlQ197_CTuIhPvyzNy8Dye8AWfhyXhyWC8By6cEsc" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl hidden md:block border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-black text-[#13ec5b]">100%</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Materiales<br />Reutilizables</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-900 dark:bg-black py-20 px-6">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
                    <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight">¿Listo para destacar de forma sostenible?</h2>
                    <p className="text-slate-400 text-lg max-w-2xl">Convierte tu próxima feria en un referente de diseño ecológico.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/cotizar" className="bg-[#13ec5b] text-[#111813] px-10 py-4 rounded-full font-bold transition-transform hover:scale-105">Solicitar catálogo</Link>
                        <Link href="/contacto" className="bg-white/10 text-white backdrop-blur-md px-10 py-4 rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all">Contactar ahora</Link>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}
