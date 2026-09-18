import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export const metadata = {
    title: 'Servicios | Alma Verde Diseño',
    description: 'Diseño de stands, decoración, activaciones de marca, producción gráfica, mobiliario, montaje y alquiler para eventos y espacios comerciales.',
}

const services = [
    {
        number: '01',
        id: 'stands',
        title: 'Stands y exhibiciones',
        label: 'Arquitectura de marca',
        description: 'Diseño, fabricación y montaje de espacios memorables para ferias y encuentros comerciales.',
        image: '/hero-slides/slide-5.webp',
        href: '/servicios/stands-ecologicos',
        className: 'lg:col-span-8',
    },
    {
        number: '02',
        id: 'decoracion',
        title: 'Decoración y ambientación',
        label: 'Atmósferas con identidad',
        description: 'Escenografía, iluminación, styling y detalles que transforman la percepción del espacio.',
        image: '/hero-slides/slide-4.webp',
        href: '/cotizar?servicio=decoracion',
        className: 'lg:col-span-4',
    },
    {
        number: '03',
        id: 'activaciones',
        title: 'Eventos y activaciones',
        label: 'Experiencias en vivo',
        description: 'Lanzamientos, pop-ups e instalaciones creadas para atraer, conectar y generar conversación.',
        image: '/hero-slides/slide-3.webp',
        href: '/servicios/activaciones',
        className: 'lg:col-span-4',
    },
    {
        number: '04',
        id: 'branding',
        title: 'Branding y producción gráfica',
        label: 'Comunicación visual',
        description: 'Impresión, señalética, vinilos, material POP y aplicaciones de identidad a cualquier escala.',
        image: '/service-graphic-production.webp',
        href: '/servicios/produccion-grafica',
        className: 'lg:col-span-8',
    },
    {
        number: '05',
        id: 'mobiliario',
        title: 'Mobiliario comercial',
        label: 'Diseño a medida',
        description: 'Mostradores, exhibidores, módulos y piezas que combinan función, materialidad y marca.',
        image: '/service-furniture.webp',
        href: '/servicios/mobiliario',
        className: 'lg:col-span-4',
    },
    {
        number: '06',
        id: 'montaje',
        title: 'Montaje y logística',
        label: 'Ejecución integral',
        description: 'Coordinación técnica, transporte, instalación, supervisión y desmontaje en sitio.',
        image: '/hero-slides/slide-6.webp',
        href: '/servicios/montaje',
        className: 'lg:col-span-4',
    },
    {
        number: '07',
        id: 'alquiler',
        title: 'Alquiler de equipos',
        label: 'Infraestructura temporal',
        description: 'Mobiliario, iluminación, estructuras y recursos técnicos listos para complementar cada evento.',
        image: '/service-equipment-rental.webp',
        href: '/cotizar?servicio=alquiler',
        className: 'lg:col-span-4',
    },
]

const capabilities = [
    {
        number: '01',
        title: 'Estrategia y concepto',
        description: 'Definimos objetivos, audiencia, narrativa y prioridades antes de diseñar.',
    },
    {
        number: '02',
        title: 'Diseño 3D e IA',
        description: 'Visualizamos alternativas, materiales y recorridos para decidir con claridad.',
    },
    {
        number: '03',
        title: 'Producción propia',
        description: 'Integramos carpintería, gráfica, acabados y control de calidad en un mismo proceso.',
    },
    {
        number: '04',
        title: 'Operación en sitio',
        description: 'Coordinamos tiempos, proveedores, montaje, entrega y cierre del proyecto.',
    },
]

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f3f5f2] font-display text-[#0c120d]">
            <Header />

            <section className="bg-[#090d0a] px-4 pb-5 pt-4 text-white sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                <div className="relative mx-auto min-h-[740px] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-[#172019] sm:rounded-[2.5rem] lg:min-h-[820px]">
                    <Image
                        src="/hero-slides/slide-1.webp"
                        alt="Experiencia espacial diseñada por Alma Verde"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/5" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

                    <div className="relative flex min-h-[740px] flex-col justify-between p-6 sm:p-10 lg:min-h-[820px] lg:p-16">
                        <div className="flex flex-wrap gap-2">
                            {['Diseño', 'Producción', 'Montaje', 'Alquiler'].map((item) => (
                                <span key={item} className="rounded-full border border-white/20 bg-black/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md sm:text-xs">
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="max-w-6xl pb-2">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">Servicios Alma Verde</p>
                            <h1 className="text-balance text-[clamp(3.7rem,7.5vw,8rem)] font-semibold leading-[0.89] tracking-[-0.068em]">
                                Todo lo que una marca puede habitar.
                            </h1>
                            <div className="mt-8 flex flex-col items-start gap-7 lg:flex-row lg:items-end lg:justify-between">
                                <p className="max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8 lg:text-xl">
                                    Conceptualizamos, diseñamos, producimos y operamos experiencias físicas completas para marcas, eventos y espacios comerciales.
                                </p>
                                <Link href="/cotizar" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#5cff8d] px-7 py-3 text-sm font-semibold text-[#071108] transition duration-300 hover:-translate-y-0.5 hover:bg-white">
                                    Cuéntanos tu proyecto
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">Lo que hacemos</p>
                            <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                                Un equipo. Siete formas de hacer realidad una idea.
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-7 text-[#657067] sm:text-lg sm:leading-8 lg:col-span-4">
                            Puedes contratar un servicio puntual o integrar varios dentro de una solución completa.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                        {services.map((service) => (
                            <Link
                                key={service.id}
                                id={service.id}
                                href={service.href}
                                className={`group relative min-h-[430px] scroll-mt-28 overflow-hidden rounded-[1.75rem] bg-[#172019] sm:min-h-[500px] lg:min-h-[460px] ${service.className}`}
                            >
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 66vw"
                                    className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.045]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10 transition duration-500 group-hover:from-black/80" />

                                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
                                    <span className="rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md sm:text-xs">
                                        {service.label}
                                    </span>
                                    <span className="text-xs font-semibold tabular-nums text-white/65">{service.number}</span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
                                    <div>
                                        <h3 className="max-w-2xl text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                                            {service.title}
                                        </h3>
                                        <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                                            {service.description}
                                        </p>
                                    </div>
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg text-white backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black" aria-hidden="true">
                                        ↗
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#dff7e5] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                <div className="mx-auto max-w-[1440px]">
                    <div className="grid items-end gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">Capacidades integradas</p>
                            <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                                La idea no cambia de manos. Evoluciona con el mismo equipo.
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-7 text-[#526259] sm:text-lg sm:leading-8 lg:col-span-4">
                            Esto reduce errores, simplifica decisiones y mantiene la intención del proyecto de principio a fin.
                        </p>
                    </div>

                    <div className="mt-16 grid border-y border-[#bcd4c2] sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
                        {capabilities.map((capability, index) => (
                            <article key={capability.number} className={`min-h-[300px] py-8 sm:p-8 lg:min-h-[340px] ${index > 0 ? 'sm:border-l sm:border-[#bcd4c2]' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''} ${index > 1 ? 'border-t border-[#bcd4c2] lg:border-t-0' : ''}`}>
                                <span className="text-xs font-semibold tabular-nums text-[#168340]">{capability.number}</span>
                                <h3 className="mt-16 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{capability.title}</h3>
                                <p className="mt-4 text-sm leading-6 text-[#5d6960] sm:text-base sm:leading-7">{capability.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
                <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">Proyecto a medida</p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,5.8vw,6.2rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Si puedes imaginarlo, podemos encontrar cómo construirlo.
                        </h2>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
                        <Link href="/cotizar" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#5cff8d] px-8 py-4 text-sm font-semibold text-[#071108] transition hover:bg-white">
                            Empezar un proyecto
                        </Link>
                        <Link href="/portafolio" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold transition hover:bg-white hover:text-black">
                            Ver proyectos realizados
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
