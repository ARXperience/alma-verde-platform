const steps = [
    {
        num: '01',
        title: 'Entender',
        label: 'Concepto',
        desc: 'Alineamos objetivos, audiencia, espacio, presupuesto y propósito de marca.',
    },
    {
        num: '02',
        title: 'Visualizar',
        label: 'Diseño 3D',
        desc: 'Convertimos la estrategia en una propuesta espacial clara antes de fabricar.',
    },
    {
        num: '03',
        title: 'Construir',
        label: 'Producción',
        desc: 'Materializamos cada detalle con procesos precisos y materiales responsables.',
    },
    {
        num: '04',
        title: 'Hacer realidad',
        label: 'Instalación',
        desc: 'Coordinamos logística, montaje y supervisión técnica hasta la entrega final.',
    },
]

export function ProcessSection() {
    return (
        <section className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36" id="proceso">
            <div className="mx-auto max-w-[1440px]">
                <div className="grid items-end gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#5cff8d]">
                            De la idea al espacio
                        </p>
                        <h2 className="max-w-5xl text-balance text-[clamp(3rem,6vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
                            Un proceso claro para construir sin improvisar.
                        </h2>
                    </div>
                    <p className="max-w-xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8 lg:col-span-4">
                        Un mismo equipo acompaña el proyecto desde la primera conversación hasta el último ajuste en sitio.
                    </p>
                </div>

                <div className="mt-16 grid border-y border-white/15 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <article
                            key={step.num}
                            className={`group relative flex min-h-[340px] flex-col justify-between py-8 sm:p-8 lg:min-h-[390px] lg:p-9 ${index > 0 ? 'sm:border-l sm:border-white/15' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''} ${index > 1 ? 'border-t border-white/15 lg:border-t-0' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold tabular-nums text-[#5cff8d]">{step.num}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-xs">{step.label}</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{step.title}</h3>
                                <p className="mt-5 max-w-sm text-sm leading-6 text-white/50 sm:text-base sm:leading-7">{step.desc}</p>
                            </div>
                            <div className="mt-8 h-px w-10 bg-[#5cff8d] transition-all duration-500 group-hover:w-full" />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
