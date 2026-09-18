import Image from 'next/image'

const principles = [
    {
        number: '01',
        title: 'Diseño con intención',
        description: 'Cada decisión equilibra estética, función y conexión con la audiencia.',
    },
    {
        number: '02',
        title: 'Precisión en cada detalle',
        description: 'Del primer trazo al montaje final, cuidamos materiales, acabados y ejecución.',
    },
    {
        number: '03',
        title: 'Impacto más consciente',
        description: 'Creamos experiencias memorables con soluciones modulares y responsables.',
    },
]

export function AboutSection() {
    return (
        <section className="overflow-hidden bg-[#f6f8f6] px-5 py-24 text-[#0d150f] sm:px-8 lg:px-12 lg:py-36 dark:bg-[#102216] dark:text-white">
            <div className="mx-auto max-w-[1440px]">
                <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-8">
                        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#138a42] dark:text-[#59e98a]">
                            Sobre Alma Verde
                        </p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,6.4vw,6.75rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Diseñamos lo que las marcas
                            <span className="block text-[#5b7562] dark:text-[#8fb99a]">hacen sentir.</span>
                        </h2>
                    </div>

                    <div className="lg:col-span-4 lg:pb-2">
                        <p className="max-w-xl text-base leading-7 text-[#59635b] sm:text-lg sm:leading-8 dark:text-white/65">
                            Unimos arquitectura, narrativa de marca y producción para convertir espacios temporales en experiencias que permanecen en la memoria.
                        </p>
                    </div>
                </div>

                <div className="relative mt-14 overflow-hidden rounded-[1.75rem] bg-[#e8ece7] sm:mt-20 sm:rounded-[2.5rem] lg:mt-24">
                    <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/8.2]">
                        <Image
                            src="/about-alma-verde.webp"
                            alt="Modelo arquitectónico sostenible desarrollado en el estudio de Alma Verde"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1536px) 94vw, 1440px"
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
                        <p className="absolute bottom-6 left-6 max-w-[240px] text-sm font-medium leading-5 text-white sm:bottom-9 sm:left-9 sm:max-w-none sm:text-base">
                            Ideas que se pueden tocar, recorrer y recordar.
                        </p>
                    </div>
                </div>

                <div className="mt-12 grid gap-9 sm:mt-16 md:grid-cols-3 md:gap-8">
                    {principles.map((principle) => (
                        <article key={principle.number} className="border-t border-[#cfd7d0] pt-6 dark:border-white/15">
                            <div className="flex items-baseline gap-4">
                                <span className="text-xs font-semibold tabular-nums text-[#138a42] dark:text-[#59e98a]">
                                    {principle.number}
                                </span>
                                <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                                    {principle.title}
                                </h3>
                            </div>
                            <p className="ml-9 mt-3 max-w-sm text-sm leading-6 text-[#647067] sm:text-base sm:leading-7 dark:text-white/55">
                                {principle.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
