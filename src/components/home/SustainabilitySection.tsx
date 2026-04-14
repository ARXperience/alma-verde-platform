export function SustainabilitySection() {
    return (
        <section className="py-24 px-6 lg:px-20 bg-[#13ec5b]/10">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2">
                    <div
                        className="w-full h-80 rounded-2xl bg-cover bg-center"
                        style={{
                            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6jVOTasuk4KPiYOPASU_WlLFTZiShvBNHuCtn1phcblg0g_EzcBLVvWgrmMuS3p6iFQsiJUlT0apbq5VoZwmVka4ElN7EDR36ebKBCh4uyUdZocszOI9bQphl_94FmDVop9qhxyUnnYCwrUGu1ZbNKe9em2lx2wXU4pKf6QHsU6UflpswV7LpKByGnBYbmeyzMBKo7eP_5VuKYE4EpzooZJNz9F14TKyWsNkyJaA805TnzTXaX_YLcq_5QQQGoQNnmN97sVztm4k')`
                        }}
                    />
                </div>
                <div className="lg:w-1/2">
                    <h2 className="text-4xl font-black mb-6 font-display">Compromiso con el Mañana</h2>
                    <p className="text-[#61896f] text-lg mb-8">
                        Nuestro nombre, <span className="text-[#111813] dark:text-white font-bold italic">Alma Verde</span>, no es solo estética. Utilizamos materiales certificados, pinturas de bajo VOC y procesos de fabricación que minimizan el desperdicio. Creemos en el diseño circular.
                    </p>
                    <div className="flex items-center gap-4 text-[#13ec5b] font-black uppercase tracking-tighter text-2xl">
                        <span className="material-symbols-outlined text-4xl">eco</span>
                        Producción Sostenible
                    </div>
                </div>
            </div>
        </section>
    )
}
