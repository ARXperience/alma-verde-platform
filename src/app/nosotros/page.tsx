import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

export const metadata = {
    title: 'Nosotros | Alma Verde Diseño',
    description: 'Conoce la visión, el método y el oficio detrás de Alma Verde Diseño.',
}

const principles = [
    {
        number: '01',
        title: 'Intención antes que forma',
        description: 'Cada decisión parte de lo que la marca necesita comunicar y de lo que las personas deben sentir.',
    },
    {
        number: '02',
        title: 'Diseño que se puede construir',
        description: 'La creatividad convive con presupuestos, tiempos, materiales y una ejecución técnicamente rigurosa.',
    },
    {
        number: '03',
        title: 'Impacto más consciente',
        description: 'Buscamos resultados memorables con sistemas modulares, materiales durables y menos desperdicio.',
    },
]

const disciplines = [
    {
        number: '01',
        title: 'Estrategia espacial',
        description: 'Traducimos objetivos de negocio y comunicación en decisiones de recorrido, escala y experiencia.',
    },
    {
        number: '02',
        title: 'Diseño y visualización',
        description: 'Exploramos conceptos, modelamos alternativas y hacemos visible el proyecto antes de producirlo.',
    },
    {
        number: '03',
        title: 'Producción y oficio',
        description: 'Integramos materiales, gráfica, mobiliario y acabados bajo una misma dirección creativa.',
    },
    {
        number: '04',
        title: 'Montaje y operación',
        description: 'Coordinamos logística, instalación y entrega para proteger la intención hasta el último detalle.',
    },
]

const studioImages = [
    {
        image: '/service-furniture.webp',
        title: 'Materia y proporción',
        label: 'Diseño de producto',
        className: 'lg:col-span-7 lg:row-span-2',
    },
    {
        image: '/service-graphic-production.webp',
        title: 'Identidad en el espacio',
        label: 'Producción visual',
        className: 'lg:col-span-5',
    },
    {
        image: '/sustainable-materials.webp',
        title: 'Decisiones responsables',
        label: 'Materialidad',
        className: 'lg:col-span-5',
    },
]

export default function NosotrosPage() {
    return (
        <main className="min-h-screen bg-[#f3f5f2] font-display text-[#0c120d]">
            <Header />

            <section className="relative flex min-h-[60vh] w-full items-end overflow-hidden md:min-h-[70vh]" data-assistant-section="hero">
                <div className="absolute inset-0 z-0">
                    <video autoPlay loop muted playsInline className="h-full w-full object-cover">
                        <source src="/almaverde.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102216] via-[#102216]/50 to-transparent" />
                </div>
                <div className="relative z-10 w-full px-6 pb-16 md:px-20 md:pb-24 lg:px-40">
                    <div className="mx-auto max-w-[1200px]">
                        <span className="mb-4 inline-block rounded bg-[#13ec5b] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#102216]">
                            Fundado en 2012
                        </span>
                        <h1 className="text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
                            Elevando Espacios,<br />Definiendo Marcas.
                        </h1>
                    </div>
                </div>
            </section>

            <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36" data-assistant-section="about">
                <div className="mx-auto max-w-[1440px]">
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">Nuestro punto de vista</p>
                            <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                                No diseñamos objetos aislados. Diseñamos lo que sucede alrededor de ellos.
                            </h2>
                        </div>
                        <div className="space-y-6 text-base leading-7 text-[#657067] sm:text-lg sm:leading-8 lg:col-span-4 lg:pt-10">
                            <p>
                                Un espacio puede orientar una conversación, cambiar la forma en que se percibe una marca y convertir un encuentro breve en una experiencia significativa.
                            </p>
                            <p>
                                Por eso trabajamos desde la estrategia hasta el montaje. La idea, el material y la ejecución forman parte de una misma historia.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-[#dfe5df] sm:mt-24 lg:rounded-[3rem]">
                        <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/8.2]">
                            <Image
                                src="/about-alma-verde.webp"
                                alt="Modelo arquitectónico desarrollado en el estudio Alma Verde"
                                fill
                                sizes="(max-width: 1536px) 94vw, 1440px"
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                            <p className="absolute bottom-7 left-7 max-w-sm text-lg font-medium tracking-[-0.02em] text-white sm:bottom-10 sm:left-10 sm:text-2xl">
                                Las mejores ideas se vuelven más claras cuando se pueden tocar.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-9 md:grid-cols-3 md:gap-8 lg:mt-16">
                        {principles.map((principle) => (
                            <article key={principle.number} className="border-t border-[#cbd4cc] pt-6">
                                <span className="text-xs font-semibold tabular-nums text-[#168340]">{principle.number}</span>
                                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{principle.title}</h3>
                                <p className="mt-4 text-sm leading-6 text-[#657067] sm:text-base sm:leading-7">{principle.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36" data-assistant-section="philosophy">
                <div className="mx-auto max-w-[1440px]">
                    <div className="grid items-end gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">Un equipo integrado</p>
                            <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                                Distintas disciplinas. Una sola dirección.
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8 lg:col-span-4">
                            La colaboración continua evita que la idea se diluya cuando pasa del concepto a la realidad.
                        </p>
                    </div>

                    <div className="mt-16 grid border-y border-white/15 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
                        {disciplines.map((discipline, index) => (
                            <article key={discipline.number} className={`min-h-[330px] py-8 sm:p-8 lg:min-h-[380px] ${index > 0 ? 'sm:border-l sm:border-white/15' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''} ${index > 1 ? 'border-t border-white/15 lg:border-t-0' : ''}`}>
                                <span className="text-xs font-semibold tabular-nums text-[#5cff8d]">{discipline.number}</span>
                                <h3 className="mt-16 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{discipline.title}</h3>
                                <p className="mt-4 text-sm leading-6 text-white/50 sm:text-base sm:leading-7">{discipline.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36" data-assistant-section="team">
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">El estudio en acción</p>
                            <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                                La idea también vive en los detalles.
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-7 text-[#657067] sm:text-lg sm:leading-8 lg:col-span-4">
                            Materiales, proporciones, color y sistemas de montaje se prueban antes de llegar al espacio final.
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:gap-6">
                        {studioImages.map((item) => (
                            <article key={item.title} className={`group relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-[#172019] sm:min-h-[500px] lg:min-h-[340px] ${item.className}`}>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 58vw"
                                    className="object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5cff8d] sm:text-xs">{item.label}</p>
                                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{item.title}</h3>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#dff7e5] px-5 py-24 sm:px-8 lg:px-12 lg:py-36" data-assistant-section="cta">
                <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-8">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">Construyamos algo con sentido</p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,5.8vw,6.2rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Una buena conversación es el inicio de un gran espacio.
                        </h2>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
                        <Link href="/cotizar" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#0d180f] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#24402b]">
                            Empezar un proyecto
                        </Link>
                        <Link href="/servicios" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#94b09b] px-8 py-4 text-sm font-semibold transition hover:bg-white/60">
                            Conocer nuestros servicios
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
