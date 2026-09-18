import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

type Feature = {
    title: string
    description: string
}

type GalleryItem = {
    image: string
    title: string
    label: string
}

type ServiceDetailPageProps = {
    eyebrow: string
    title: string
    accent: string
    description: string
    heroImage: string
    primaryCta: string
    capabilitiesTitle: string
    capabilitiesDescription: string
    features: Feature[]
    galleryTitle: string
    galleryDescription: string
    gallery: GalleryItem[]
    ctaTitle: string
    ctaDescription: string
}

export function ServiceDetailPage({
    eyebrow,
    title,
    accent,
    description,
    heroImage,
    primaryCta,
    capabilitiesTitle,
    capabilitiesDescription,
    features,
    galleryTitle,
    galleryDescription,
    gallery,
    ctaTitle,
    ctaDescription,
}: ServiceDetailPageProps) {
    return (
        <main className="min-h-screen bg-[#f3f5f2] font-display text-[#101510]">
            <Header />

            <section className="bg-[#090d0a] px-4 pb-5 pt-4 text-white sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                <div className="relative mx-auto min-h-[720px] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-[#172019] sm:rounded-[2.5rem] lg:min-h-[820px]">
                    <Image
                        src={heroImage}
                        alt={`${title} — ${accent}`}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/5" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

                    <div className="relative flex min-h-[720px] flex-col justify-between p-6 sm:p-10 lg:min-h-[820px] lg:p-16">
                        <div className="flex items-center justify-between gap-5">
                            <span className="rounded-full border border-white/20 bg-black/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md sm:text-xs">
                                {eyebrow}
                            </span>
                            <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-white/50 sm:block">
                                Alma Verde Diseño
                            </span>
                        </div>

                        <div className="max-w-5xl pb-3">
                            <h1 className="text-balance text-[clamp(3.5rem,7.4vw,7.8rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
                                {title}
                                <span className="block text-[#5cff8d]">{accent}</span>
                            </h1>
                            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8 lg:text-xl">
                                {description}
                            </p>
                            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
                                <Link
                                    href="/cotizar"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#5cff8d] px-7 py-3 text-sm font-semibold text-[#071108] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                                >
                                    {primaryCta}
                                </Link>
                                <Link
                                    href="/portafolio"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                                >
                                    Ver proyectos <span aria-hidden="true">↗</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                <div className="mx-auto max-w-[1440px]">
                    <div className="grid items-end gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#168340]">Qué resolvemos</p>
                            <h2 className="max-w-4xl text-balance text-[clamp(2.8rem,5.3vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
                                {capabilitiesTitle}
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-7 text-[#657067] sm:text-lg sm:leading-8 lg:col-span-4">
                            {capabilitiesDescription}
                        </p>
                    </div>

                    <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-7">
                        {features.map((feature, index) => (
                            <article key={feature.title} className="border-t border-[#cdd5ce] pt-6">
                                <span className="text-xs font-semibold tabular-nums text-[#168340]">0{index + 1}</span>
                                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em]">{feature.title}</h3>
                                <p className="mt-4 text-sm leading-6 text-[#657067] sm:text-base sm:leading-7">{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#090d0a] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36">
                <div className="mx-auto max-w-[1440px]">
                    <div className="mb-14 grid items-end gap-8 lg:mb-20 lg:grid-cols-12">
                        <h2 className="max-w-4xl text-balance text-[clamp(2.8rem,5.3vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] lg:col-span-8">
                            {galleryTitle}
                        </h2>
                        <p className="max-w-xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8 lg:col-span-4">
                            {galleryDescription}
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:gap-6">
                        {gallery.map((item, index) => (
                            <article
                                key={item.title}
                                className={`group relative min-h-[390px] overflow-hidden rounded-[1.75rem] bg-[#172019] sm:min-h-[480px] ${index === 0 ? 'lg:col-span-8 lg:row-span-2 lg:min-h-[720px]' : 'lg:col-span-4 lg:min-h-0'}`}
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes={index === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 34vw'}
                                    className="object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5cff8d] sm:text-xs">{item.label}</p>
                                    <h3 className={`mt-2 font-semibold leading-none tracking-[-0.04em] ${index === 0 ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>
                                        {item.title}
                                    </h3>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
                <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#dff7e5] lg:grid-cols-12 lg:rounded-[3rem]">
                    <div className="p-8 sm:p-12 lg:col-span-8 lg:p-16">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#168340]">Hagámoslo realidad</p>
                        <h2 className="max-w-4xl text-balance text-[clamp(2.8rem,5.2vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
                            {ctaTitle}
                        </h2>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-[#526259] sm:text-lg sm:leading-8">{ctaDescription}</p>
                    </div>
                    <div className="flex flex-col justify-end gap-3 border-t border-[#bfdac6] p-8 sm:flex-row sm:p-12 lg:col-span-4 lg:flex-col lg:items-stretch lg:border-l lg:border-t-0 lg:p-12">
                        <Link href="/cotizar" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#0d180f] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#1f3a25]">
                            Empezar un proyecto
                        </Link>
                        <Link href="/contacto" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#91ad98] px-8 py-4 text-sm font-semibold transition hover:bg-white/60">
                            Hablar con el equipo
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
