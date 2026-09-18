import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
    return (
        <section
            id="hero"
            className="relative overflow-hidden bg-[#f5f5f2] px-4 pb-5 pt-20 text-[#141713] sm:px-6 sm:pb-6 sm:pt-24 lg:px-8 lg:pb-8 lg:pt-28"
        >
            <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[#dce8d5]/70 blur-[120px]" />

            <div className="relative mx-auto max-w-[1440px]">
                <div className="mx-auto max-w-5xl px-2 text-center">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#47724b] sm:text-sm">
                        Diseño · Experiencias · Sostenibilidad
                    </p>
                    <h1 className="text-balance text-[clamp(3rem,7.2vw,7rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#111410]">
                        Espacios que dejan una huella.
                        <span className="block text-[#557a57]">No una carga.</span>
                    </h1>
                    <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-[#5d625b] sm:text-lg sm:leading-8 lg:text-xl">
                        Creamos stands, exhibiciones y experiencias de marca con diseño extraordinario y una mirada responsable.
                    </p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href="#proyectos"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#172219] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#29402d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#29402d]"
                        >
                            Explorar proyectos
                        </a>
                        <Link
                            href="/cotizar"
                            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[#172219] transition-colors hover:bg-black/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#29402d]"
                        >
                            Hablemos de tu proyecto
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </div>

                <div className="relative mt-12 overflow-hidden rounded-[1.75rem] bg-[#e8e8e3] shadow-[0_30px_100px_rgba(33,46,34,0.14)] sm:mt-16 sm:rounded-[2.5rem] lg:mt-20">
                    <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/8.2]">
                        <Image
                            src="/hero-alma-verde.webp"
                            alt="Pabellón sostenible de madera y vegetación diseñado por Alma Verde"
                            fill
                            priority
                            sizes="(max-width: 640px) 100vw, (max-width: 1536px) 96vw, 1440px"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-8 sm:left-8 sm:right-8">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Diseño integral</p>
                                <p className="mt-1 text-lg font-medium tracking-[-0.02em] sm:text-2xl">Del concepto a la experiencia.</p>
                            </div>
                            <span className="hidden rounded-full border border-white/30 bg-black/10 px-4 py-2 text-xs font-medium backdrop-blur-md sm:block">
                                Bogotá · Colombia
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
