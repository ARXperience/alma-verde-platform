import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'

export const metadata = {
    title: 'Producción Gráfica | Alma Verde Diseño',
    description: 'Producción gráfica integral para eventos, ferias y espacios comerciales.',
}

export default function ProduccionGraficaPage() {
    return (
        <ServiceDetailPage
            assistantSection="branding"
            eyebrow="Comunicación visual"
            title="Gráfica que ocupa"
            accent="su lugar."
            description="Llevamos la identidad de marca del archivo al espacio con impresión, señalética y acabados que mantienen la intención del diseño."
            heroImage="/service-graphic-production.webp"
            primaryCta="Cotizar producción"
            capabilitiesTitle="Precisión visual, a cualquier escala."
            capabilitiesDescription="Producimos piezas que conviven con la arquitectura y resisten las exigencias de cada montaje."
            features={[
                { title: 'Gran formato', description: 'Lonas, vinilos, textiles y gráficos de alta resolución para grandes superficies.' },
                { title: 'Señalética', description: 'Sistemas de orientación claros, consistentes y fáciles de instalar.' },
                { title: 'Branding físico', description: 'Aplicaciones de identidad que integran color, volumen y materialidad.' },
                { title: 'Material POP', description: 'Displays, tótems y elementos promocionales con acabados profesionales.' },
            ]}
            galleryTitle="La identidad también se construye."
            galleryDescription="Materiales, color y escala trabajando juntos para mantener la marca reconocible en cada punto."
            gallery={[
                { image: '/service-graphic-production.webp', title: 'Producción de precisión', label: 'Taller' },
                { image: '/hero-slides/slide-2.webp', title: 'Marca en el espacio', label: 'Aplicación' },
                { image: '/hero-slides/slide-5.webp', title: 'Escala expositiva', label: 'Formato' },
            ]}
            ctaTitle="Haz que cada superficie comunique con claridad."
            ctaDescription="Envíanos las medidas, artes o referencias. Te ayudamos a definir materiales, acabados y el sistema de instalación."
        />
    )
}
