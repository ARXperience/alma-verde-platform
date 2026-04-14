export function AboutSection() {
    return (
        <section className="py-24 px-6 lg:px-20 grid lg:grid-cols-2 gap-16 items-center">
            <div>
                <h3 className="text-[#13ec5b] font-bold tracking-widest uppercase text-sm mb-4">Sobre Nosotros</h3>
                <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight font-display">
                    Estudio creativo de espacios efímeros.
                </h2>
                <p className="text-[#61896f] text-lg leading-relaxed mb-6">
                    En Alma Verde Diseño, fusionamos la arquitectura contemporánea con estrategias de marketing espacial. Nuestro enfoque premium se centra en la excelencia técnica y la sostenibilidad creativa.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#13ec5b] transition-colors">
                        <span className="material-symbols-outlined text-[#13ec5b] text-3xl">workspace_premium</span>
                        <div>
                            <h4 className="font-bold">Calidad</h4>
                            <p className="text-sm text-[#61896f]">Acabados de alta gama y atención meticulosa al detalle.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#13ec5b] transition-colors">
                        <span className="material-symbols-outlined text-[#13ec5b] text-3xl">precision_manufacturing</span>
                        <div>
                            <h4 className="font-bold">Expertise</h4>
                            <p className="text-sm text-[#61896f]">Años dominando entornos comerciales exigentes.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative group">
                <div className="absolute -inset-4 bg-[#13ec5b]/20 rounded-xl blur-2xl group-hover:bg-[#13ec5b]/30 transition-all" />
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhroRLbpEEpBdSLXiw4krR8XoqW0azkSv3FB1Rk8R0lTEAaXmtbBz2Q7PV-1V1jLr0IiC6wBGiiT4zSmv6QFBNJ5N_SG3zLP2R9r5s8wyjyyKnJo1xqZwgE-eZ7M-9txVj7mQzlziZulT0rrUJYcysY2aTNCLomETQspVrUR7S9sj58eXeyTuPAcnY7gsNc7aLZh7YIp6Ra0d1aTHXcP2FgGj1gtQ98v21j9AMmBz0GDSqEZe9OU3lQ7NV82mEfclyHnXaDjGl-AI')`
                        }}
                    />
                </div>
            </div>
        </section>
    )
}
