import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export const metadata = {
    title: "Servicios | Alma Verde Diseño",
    description: "Diseño de stands, mobiliario comercial, activaciones de marca e instalaciones para eventos. Soluciones integrales desde el concepto hasta la instalación.",
}

const services = [
    {
        icon: 'architecture',
        badge: 'Excelencia en Exhibición',
        title: 'Diseño y Construcción de Stands',
        desc: 'Creamos entornos de marca inmersivos que capturan la atención. Nuestros diseños de stands combinan artesanía arquitectónica con estrategias de marketing de alto impacto para asegurar que tu marca destaque en cualquier espacio de exhibición.',
        features: ['Estructuras modulares y a medida para ferias internacionales.', 'Iluminación integrada y displays de medios digitales.'],
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO6Ko52fZ7L5jpDozFFyi9araE48f4X5S7pxcJV8L0AkyX8GKqZzRpDKjELNnsZzcBzCKmsBLbuhDrjc_7Y8cU8pCMjbGhJr3eBoSv6-IPBX9lxI3Omfs7g4OnEfhjnDBH7T_urCR_gx-OZksfdciUuIbkjCqFUZEl-aI_Grvf-WOA0bOo1Q4oZl2u-rwQiuPJ21Uk4q5C0CbGqmgmcP3UGXfGAHVVL6KKaRNw3uSsjYWeI0jKMtj94J6GpPmDh8TErH2KeONtPo8',
        link: '/servicios/stands-ecologicos',
        reverse: false,
    },
    {
        icon: 'chair_alt',
        badge: 'Carpintería Artesanal',
        title: 'Mobiliario Comercial',
        desc: 'Eleva tu retail o espacio de trabajo con piezas de mobiliario a medida diseñadas para durabilidad y alineación de marca. Nuestro equipo artesano combina carpintería tradicional con manufactura moderna.',
        features: ['Ajuste personalizado para tu plano único.', 'Materiales resistentes al alto tráfico.'],
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHUHvp7F0l5LybkIIYE3bjlroy51L_YffYxDaedOxzDtxuFqBJgDbXtp8WJyrBwVVQGkKAs5C4XIuxHnZzUcQcpp8e8gvusdtQI2zs3nStB09QRtdpjzTaVnwXpYi-QGqiqRweXiFK2XJQ0lclp1JHUAF1K9ACqq-1fxn70VBcLeZFBXG_114AazjOrHG8oas9Dji22mM9lSMMQqX_r9VS2Zqo5isI6OFp2uuTuR7f1PotLGP-9w9UnxrrAmDohrxbG-Oal3o2HE',
        link: '/servicios/mobiliario',
        reverse: true,
    },
    {
        icon: 'campaign',
        badge: 'Estrategia de Engagement',
        title: 'Activaciones de Marca',
        desc: 'No solo construimos sets; construimos experiencias. Nuestras activaciones de marca están diseñadas para generar respuestas emocionales y compartir en redes. Desde pop-up shops hasta lanzamientos interactivos.',
        features: ['Elementos interactivos para engagement táctil y digital.', 'Diseño fotogénico optimizado para impacto en redes sociales.'],
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqezQIH8NCix1wwPOkWM693KG-IE6R0J2RPCKfXAqdOnkyUYniGt6razd1NjTIgTE30NW4lRJHTUzE-ijvUEidadDXmqKWAEO69Nr-OT8SgolwkO-qLaCgnHClMkLT2UYZNj6Ak4-j6nQMVxfceR6pK5i9IZXRjUOjz4C1BrKB09UpV52ZNJvYr3c9peEqp5cwIXstBtXW9SIpPCR0ljF2qicSnsdE_RrKSzyCpxWJwqqwiBQ5PP-hb3V6OWl2uZOSd9DJy1QNEIc',
        link: '/servicios/activaciones',
        reverse: false,
    },
    {
        icon: 'event',
        badge: 'Espacios Impactantes',
        title: 'Instalaciones para Eventos',
        desc: 'Instalaciones a gran escala que transforman venues en viajes narrativos. Trabajamos con planificadores de eventos y clientes corporativos para proveer elementos escénicos arquitectónicos.',
        features: ['Dirección Creativa y Concept Art', 'Ensamblaje Rápido y Logística de Desmontaje', 'Certificación de Seguridad Estructural'],
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjzCFi_tZuqpAGYY4Hm0u8HpDl0UNTqcGzMerhewCUxBHtKpYbNMiCfJKft1cKJl5PMcbcWKIbltL8BsZ4Q3991qxpwKeFs_497nsBGTGvFF40M78yNFJ2Fae4yF9cvVtA1_yUME9IiW9TxgKV1dJK73WcBo3hB40EZYiXWfdReOBpa0y7-k4kIrynp38EMuZoEKo29vGG_QD6vdEFjGGqV44AmPqwrJMiMd631qjBTsI0DXhpoJGINq1p4CcjOMhmIKKMRjBEyLI',
        link: '/contacto',
        reverse: true,
    },
]

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] font-display">
            <Header />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
                {/* Hero */}
                <div className="mb-20">
                    <span className="inline-block px-3 py-1 bg-[#13ec5b]/20 text-[#13ec5b] text-xs font-bold uppercase tracking-widest rounded mb-4">Nuestra Experiencia</span>
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
                        Creando Entornos <span className="text-[#13ec5b]">Memorables</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-[#61896f] max-w-2xl leading-relaxed">
                        Combinamos artesanía arquitectónica de alto nivel con visión estratégica de marca para crear espacios físicos que comunican tu mensaje y cautivan a tu audiencia.
                    </p>
                </div>

                {/* Services */}
                {services.map((service, i) => (
                    <section key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32 group">
                        <div className={service.reverse ? 'order-1' : 'order-2 lg:order-1'}>
                            <div className="flex items-center gap-3 mb-4 text-[#13ec5b]">
                                <span className="material-symbols-outlined">{service.icon}</span>
                                <span className="font-bold tracking-widest uppercase text-xs">{service.badge}</span>
                            </div>
                            <h2 className="text-4xl font-extrabold mb-6 leading-tight">{service.title}</h2>
                            <p className="text-[#61896f] mb-6 leading-relaxed text-lg">{service.desc}</p>
                            <ul className="space-y-4 mb-8">
                                {service.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#13ec5b] mt-1">check_circle</span>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href={service.link} className="flex items-center gap-2 font-bold text-[#13ec5b] group-hover:gap-4 transition-all w-fit">
                                Ver más <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                        <div className={service.reverse ? 'order-2' : 'order-1 lg:order-2'}>
                            <div className="rounded-xl overflow-hidden shadow-2xl bg-emerald-900/10">
                                <img alt={service.title} className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700" src={service.img} />
                            </div>
                        </div>
                    </section>
                ))}

                {/* CTA */}
                <section className="bg-[#102216] text-white rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">¿Listo para dar vida a tu proyecto?</h2>
                        <p className="text-slate-400 text-lg">Consulta con nuestros diseñadores líderes y recibe una propuesta arquitectónica detallada en 48 horas.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Link href="/cotizar" className="bg-[#13ec5b] text-[#102216] font-black px-8 py-4 rounded-lg hover:scale-105 transition-transform text-center">Iniciar Proyecto</Link>
                        <Link href="/contacto" className="border-2 border-[#13ec5b]/40 text-[#13ec5b] font-black px-8 py-4 rounded-lg hover:bg-[#13ec5b]/10 transition-colors text-center">Agendar Llamada</Link>
                    </div>
                </section>
            </div>

            <Footer />
        </main>
    )
}
