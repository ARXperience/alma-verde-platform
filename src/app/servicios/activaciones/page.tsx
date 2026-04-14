import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Activaciones de Marca | Alma Verde Diseño",
    description: "Experiencias inmersivas y activaciones de marca que conectan emocionalmente con el consumidor.",
}

const cards = [
    { title: 'Instalaciones Escultóricas', desc: 'Estética arquitectónica de gran formato para impacto visual inmediato.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu5Wdg0uXedTKj1paL_S1oX82bjI3xCIoBmAFdutqzsMAzLFZid4gQq2LVn9DqbPxbfx3RHx6hqYpq1tX8FIkd1iJ7bqzW-gRaYnJcPnFpQwUdt-BuDWal8Rmjsn9jhzXJti34Q9AmUBN6J1J-_F2OJbBzvovpjKgpf57-d-EdYJPlncynEvKtTTn0OHQkzPP3_gcAs5DFWLV1QObAS62FdlJmz9sfPvefmr2DAA4Ka6hCgE11lAtS_QwKsnP2BEmOnQMycDxXc_g' },
    { title: 'Digital Interactivo', desc: 'Engagement tecnológico con pantallas táctiles, VR y sensores de movimiento.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4UscmDSWOuyO24qiqwm3YzjFyV8ACVBJuIPE9R5LQjyt6D4O6b3TuLfZ9_abdX9oAZnyafQEuJc7ej5L1oBvG3K_1P6Sz6T3kO6622L39zAbv4_iQSgmPAbS6G6vdDIYegEsViqHvaaM7dsHW5uACSeItddRofwTdSpQPWBCaIt9_UW9KWgei6BnKvHhTvt7586BkyqC-KuIp5a4cqDRNNTkaZ2MQZB3SWzYg0HPkeAhbqtelmHTp-YgU5ycO-Yqs1-EElQcyKAE' },
    { title: 'Booth Minimalista', desc: 'Diseño limpio enfocado en la funcionalidad y la elegancia corporativa.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3mh7P6OxaeFwSfKwwlXfIhdGWIoch9bCT50-_GS9lro0BYlkSy73ZPPxpOqoS2b97Kj641goXCaQwOlng2GuIeXqJkuqypS1v1J7hxJ5_zM995E2ScIIGVQHKvARi3XDOMmuSnVSXUOBK7SU6opiWfhD_nEQbrJIVUlARKAJ5RXoIYM4oN3hWu_v6xgE9YI2ZpaP92ys8IbHq5kD7_xtHnm_r3h6tOWEnRJOBxKnFXDfT2gsFcd07RwCaLa26QfcjbH_VB6N86kQ' },
]

const stats = [
    { icon: 'rocket_launch', label: 'Proyectos Realizados', value: '150+', trend: '+15%' },
    { icon: 'groups', label: 'Audiencia Impactada', value: '1M+', trend: '+22%' },
    { icon: 'award_star', label: 'Calidad de Impacto', value: 'Premium', trend: '+10%' },
]

export default function ActivacionesPage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />

            {/* Hero */}
            <section className="px-4 md:px-20 py-6">
                <div className="relative w-full aspect-[21/9] min-h-[500px] overflow-hidden rounded-xl shadow-2xl group">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `linear-gradient(to right, rgba(16, 34, 22, 0.9) 0%, rgba(16, 34, 22, 0.4) 50%, rgba(0,0,0,0) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvOBlv-sztzb2HWQTaQqeNxv-fgH_BNJ8_dQtBpjp_fe5HAY7IgNI7yohO5Trp9YUkYqgiZQB8E0hlnbVxKcKzykGDWgOMYyEbsBAHlboQBG_oY5X3BkCmPnJ6eex1MlzZ6J4nDLWTm6uxVHx4tIqnK0bfxsKNpDOb4BM1nMZjvt1Dhx6UfBn4flEhpSUKnD3u-GNtZZH1iFCeOH1BGUC7pn8es_413VALy5Bkn_GuD8ZFvwN_Qi7pd7EeiKWxPlSRUIzXsCWL_4U')` }} />
                    <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl gap-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13ec5b]/20 border border-[#13ec5b]/30 text-[#13ec5b] w-fit">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            <span className="text-xs font-bold uppercase tracking-widest">Experiencias Premium</span>
                        </div>
                        <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                            Activaciones de marca que <span className="text-[#13ec5b]">atraen público</span>
                        </h1>
                        <p className="text-slate-200 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                            Creamos espacios interactivos y experiencias de marca inolvidables para eventos corporativos y lanzamientos de alto impacto.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Link href="/cotizar" className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 bg-[#13ec5b] text-[#102216] text-base font-extrabold transition-all hover:shadow-[0_0_20px_rgba(19,236,91,0.4)]">
                                Diseñar una activación <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                            <Link href="/portafolio" className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white text-base font-bold hover:bg-white/20 transition-all">
                                Ver Portafolio
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cards */}
            <section className="px-4 md:px-20 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Experiencias Premium</h2>
                        <div className="h-1.5 w-20 bg-[#13ec5b] mt-2 rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <div key={card.title} className="flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 transition-transform hover:-translate-y-1">
                            <div className="h-56 w-full bg-cover bg-center" style={{ backgroundImage: `url('${card.img}')` }} />
                            <div className="p-6 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-xl font-bold">{card.title}</h3>
                                    <p className="text-slate-500 text-sm mt-1">{card.desc}</p>
                                </div>
                                <button className="w-full py-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-[#13ec5b] hover:text-[#102216] transition-colors flex items-center justify-center gap-2">
                                    Ver Proyecto <span className="material-symbols-outlined text-sm">visibility</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="px-4 md:px-20 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.icon} className="flex flex-col gap-3 rounded-2xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#13ec5b]/40 group transition-all">
                            <div className="size-12 rounded-lg bg-[#13ec5b]/10 flex items-center justify-center text-[#13ec5b] group-hover:bg-[#13ec5b] group-hover:text-[#102216] transition-colors">
                                <span className="material-symbols-outlined">{stat.icon}</span>
                            </div>
                            <p className="text-slate-500 text-base font-medium">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black">{stat.value}</p>
                                <p className="text-[#13ec5b] text-sm font-bold flex items-center"><span className="material-symbols-outlined text-xs">trending_up</span> {stat.trend}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    )
}
