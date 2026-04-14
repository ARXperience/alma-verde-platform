import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Mobiliario para Ferias | Alma Verde Diseño",
    description: "Diseñamos y fabricamos mobiliario a medida para stands, espacios comerciales y exhibidores de productos.",
}

const items = [
    { icon: 'storefront', title: 'Mostradores', desc: 'Diseños ergonómicos y funcionales para la mejor experiencia de atención al cliente.' },
    { icon: 'shopping_bag', title: 'Exhibidores', desc: 'Soluciones creativas que resaltan las cualidades únicas de sus productos.' },
    { icon: 'grid_view', title: 'Estantería Modular', desc: 'Estructuras versátiles y escalables que se adaptan a cualquier espacio.' },
    { icon: 'location_city', title: 'Espacios de Marca', desc: 'Piezas arquitectónicas únicas para experiencias inmersivas en ferias.' },
]

export default function MobiliarioPage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />
            <section className="relative overflow-hidden px-6 pt-16 pb-12 lg:px-12 lg:pt-24">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="inline-block rounded-full bg-[#13ec5b]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#13ec5b] mb-6">Diseño & Fabricación</span>
                    <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Mobiliario para ferias<br className="hidden sm:block" /> y exhibición</h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#61896f]">
                        En Alma Verde Diseño diseñamos y fabricamos mobiliario a medida para stands de exhibición, espacios comerciales y exhibidores de productos.
                    </p>
                </div>
            </section>

            <section className="px-6 py-12 lg:px-12 lg:pb-24">
                <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => (
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
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#13ec5b] via-transparent to-transparent" />
                        </div>
                        <h2 className="relative z-10 mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">¿Listo para destacar en su próxima feria?</h2>
                        <p className="relative z-10 mb-10 max-w-2xl text-lg text-slate-300">Creamos el mobiliario perfecto para su marca con acabados arquitectónicos de alta gama.</p>
                        <div className="relative z-10 flex flex-wrap justify-center gap-4">
                            <Link href="/cotizar" className="rounded-full bg-[#13ec5b] px-10 py-4 text-base font-bold text-[#102216] hover:scale-105 transition-transform">Solicitar Presupuesto</Link>
                            <Link href="/portafolio" className="rounded-full border border-slate-700 bg-slate-800/50 px-10 py-4 text-base font-bold text-white hover:bg-slate-700 transition-colors">Ver Catálogo</Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}
