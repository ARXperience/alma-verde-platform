import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'

export const metadata = {
    title: 'Stands Ecológicos | Alma Verde Diseño',
    description: 'Diseñamos y construimos stands sostenibles con materiales reutilizables y respetuosos con el medio ambiente.',
}

export default function StandsEcologicosPage() {
    return (
        <ServiceDetailPage
            eyebrow="Arquitectura sostenible"
            title="Stands que hacen"
            accent="visible tu marca."
            description="Diseñamos espacios de exhibición con presencia arquitectónica, sistemas modulares y materiales elegidos para volver a usarse."
            heroImage="/hero-slides/slide-5.webp"
            primaryCta="Diseñar mi stand"
            capabilitiesTitle="Más impacto visual. Menos desperdicio."
            capabilitiesDescription="Un sistema integral que combina estrategia de marca, diseño espacial y producción precisa para cada feria."
            features={[
                { title: 'Diseño 3D', description: 'Visualizamos el espacio, los recorridos y cada punto de contacto antes de fabricar.' },
                { title: 'Sistema modular', description: 'Estructuras adaptables que pueden reconfigurarse para futuros eventos.' },
                { title: 'Materialidad consciente', description: 'Seleccionamos acabados durables, recuperables y de bajo impacto.' },
                { title: 'Entrega integral', description: 'Coordinamos producción, transporte, montaje y desmontaje en sitio.' },
            ]}
            galleryTitle="Diseño pensado para volver a funcionar."
            galleryDescription="Cada elemento tiene una función hoy y una posibilidad de uso mañana."
            gallery={[
                { image: '/hero-slides/slide-1.webp', title: 'Arquitectura de marca', label: 'Presencia' },
                { image: '/about-alma-verde.webp', title: 'Del modelo al espacio', label: 'Proceso' },
                { image: '/hero-slides/slide-6.webp', title: 'Montaje preciso', label: 'Ejecución' },
            ]}
            ctaTitle="Tu próximo stand puede trabajar mejor para tu marca."
            ctaDescription="Cuéntanos el evento, el área y tus objetivos. Diseñaremos una propuesta clara, memorable y lista para producir."
        />
    )
}
