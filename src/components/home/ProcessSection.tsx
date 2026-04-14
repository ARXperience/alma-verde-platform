const steps = [
    { num: 1, title: 'Concepto', desc: 'Briefing creativo y definición de la estrategia de marca.' },
    { num: 2, title: 'Diseño 3D', desc: 'Modelado hiperrealista y visualización del espacio.' },
    { num: 3, title: 'Fabricación', desc: 'Producción técnica con materiales premium y sostenibles.' },
    { num: 4, title: 'Instalación', desc: 'Montaje de precisión y supervisión técnica en sitio.' },
]

export function ProcessSection() {
    return (
        <section className="py-24 px-6 lg:px-20 bg-[#111813] text-white" id="proceso">
            <div className="max-w-4xl mx-auto text-center mb-20">
                <h2 className="text-4xl font-black mb-6 font-display">Nuestro Flujo de Trabajo</h2>
                <p className="text-slate-400">Transformamos ideas en realidades tangibles mediante un proceso estructurado.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative max-w-6xl mx-auto">
                <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-white/10 z-0" />
                {steps.map((step) => (
                    <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#13ec5b] text-[#111813] flex items-center justify-center font-black text-xl mb-6 shadow-[0_0_20px_rgba(19,236,91,0.4)]">
                            {step.num}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-400">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
