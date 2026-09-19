import Image from 'next/image'
import Link from 'next/link'

const services = [
    {
        title: 'Decoración y ambientación',
        category: 'Espacios con identidad',
        description: 'Escenografías, atmósferas y detalles que transforman un lugar en una experiencia.',
        image: '/hero-slides/slide-4.webp',
        href: '/servicios#decoracion',
        assistantSection: 'decoration',
        className: 'lg:col-span-7 lg:row-span-2 lg:min-h-[640px]',
        featured: true,
    },
    {
        title: 'Stands y exhibiciones',
        category: 'Diseño · Producción',
        description: 'Espacios de marca memorables para ferias y encuentros comerciales.',
        image: '/hero-slides/slide-5.webp',
        href: '/servicios/stands-ecologicos',
        assistantSection: 'stands',
        className: 'lg:col-span-5 lg:min-h-[304px]',
    },
    {
        title: 'Eventos y activaciones',
        category: 'Experiencias en vivo',
        description: 'Momentos diseñados para provocar conversación, conexión y recuerdo.',
        image: '/hero-slides/slide-3.webp',
        href: '/servicios/activaciones',
        assistantSection: 'activations',
        className: 'lg:col-span-5 lg:min-h-[304px]',
    },
    {
        title: 'Branding físico',
        category: 'Identidad espacial',
        description: 'La marca aplicada al entorno con consistencia y carácter.',
        image: '/hero-slides/slide-2.webp',
        href: '/servicios/produccion-grafica',
        assistantSection: 'branding',
        className: 'lg:col-span-4',
    },
    {
        title: 'Mobiliario comercial',
        category: 'Diseño a medida',
        description: 'Piezas funcionales que elevan la experiencia del espacio.',
        image: '/hero-slides/slide-1.webp',
        href: '/servicios/mobiliario',
        assistantSection: 'furniture',
        className: 'lg:col-span-4',
    },
    {
        title: 'Montaje y producción',
        category: 'Ejecución integral',
        description: 'Coordinamos cada detalle para que la idea llegue impecable al espacio.',
        image: '/hero-slides/slide-6.webp',
        href: '/servicios/montaje',
        assistantSection: 'montage',
        className: 'lg:col-span-4',
    },
]

export function Services() {
    return (
        <section id="servicios" className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36" data-assistant-section="services">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">
                            Lo que hacemos
                        </p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Ideas que se convierten en lugares.
                        </h2>
                    </div>
                    <div className="lg:col-span-4 lg:pb-2">
                        <p className="max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                            Diseñamos, producimos y montamos experiencias físicas que hacen visible la esencia de cada marca.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            href={service.href}
                            data-assistant-section={service.assistantSection}
                            className={`group relative min-h-[390px] overflow-hidden rounded-[1.75rem] bg-[#172019] sm:min-h-[440px] lg:min-h-[300px] ${service.className}`}
                        >
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                sizes={service.featured
                                    ? '(max-width: 1024px) 100vw, 58vw'
                                    : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 34vw'}
                                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.045]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10 transition-colors duration-500 group-hover:from-black/80" />

                            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
                                <span className="rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md sm:text-xs">
                                    {service.category}
                                </span>
                                <span className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/15 text-lg backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black" aria-hidden="true">
                                    ↗
                                </span>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                <h3 className={`max-w-xl font-semibold leading-[1.02] tracking-[-0.045em] ${service.featured ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl'}`}>
                                    {service.title}
                                </h3>
                                <p className={`mt-4 max-w-lg text-sm leading-6 text-white/65 transition duration-500 sm:text-base sm:leading-7 ${service.featured ? 'opacity-100' : 'lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100'}`}>
                                    {service.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center">
                    <p className="max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                        ¿Tienes una idea distinta? Construimos soluciones a la medida de cada proyecto.
                    </p>
                    <Link
                        href="/cotizar"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#5cff8d] px-7 py-3 text-sm font-semibold text-[#081109] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                    >
                        Crear un proyecto
                    </Link>
                </div>
            </div>
        </section>
    )
}
