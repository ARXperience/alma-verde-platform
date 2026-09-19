import Image from 'next/image'

const principles = [
    ['Reutilizar', 'Sistemas y componentes preparados para tener más de una vida.'],
    ['Optimizar', 'Diseño y producción pensados para usar solo lo necesario.'],
    ['Recuperar', 'Materiales que pueden separarse, almacenarse y volver al ciclo.'],
]

export function SustainabilitySection() {
    return (
        <section className="bg-[#dff7e5] px-5 py-24 text-[#0b150d] sm:px-8 lg:px-12 lg:py-36" data-assistant-section="sustainability">
            <div className="mx-auto max-w-[1440px]">
                <div className="grid items-end gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-9">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#168340]">Diseño circular</p>
                        <h2 className="max-w-6xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Diseñar mejor también significa desperdiciar menos.
                        </h2>
                    </div>
                    <p className="text-base leading-7 text-[#526259] sm:text-lg sm:leading-8 lg:col-span-3">
                        La sostenibilidad no es un acabado. Es una decisión presente desde el primer trazo.
                    </p>
                </div>

                <div className="mt-16 grid overflow-hidden rounded-[2rem] bg-[#f6fbf7] lg:mt-24 lg:grid-cols-12 lg:rounded-[3rem]" data-assistant-section="materials">
                    <div className="relative min-h-[430px] lg:col-span-7 lg:min-h-[720px]">
                        <Image
                            src="/sustainable-materials.webp"
                            alt="Materiales sostenibles y sistema modular en el taller de Alma Verde"
                            fill
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            className="object-cover object-center"
                        />
                    </div>
                    <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-5 lg:p-14">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#168340]">Compromiso Alma Verde</p>
                            <h3 className="mt-7 text-balance text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
                                Materiales honestos. Sistemas inteligentes.
                            </h3>
                            <p className="mt-7 text-base leading-7 text-[#5d6960] sm:text-lg sm:leading-8">
                                Priorizamos estructuras modulares, maderas recuperadas, pinturas de bajo VOC y soluciones que facilitan el desmontaje y la reutilización.
                            </p>
                        </div>

                        <div className="mt-14 space-y-0">
                            {principles.map(([title, description], index) => (
                                <div key={title} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-[#cad9ce] py-5">
                                    <span className="text-xs font-semibold tabular-nums text-[#168340]">0{index + 1}</span>
                                    <div>
                                        <h4 className="font-semibold">{title}</h4>
                                        <p className="mt-1 text-sm leading-6 text-[#657067]">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
