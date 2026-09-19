import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'

export const metadata = {
    title: 'Activaciones de Marca | Alma Verde Diseño',
    description: 'Experiencias inmersivas y activaciones de marca que conectan emocionalmente con el consumidor.',
}

export default function ActivacionesPage() {
    return (
        <ServiceDetailPage
            assistantSection="activations"
            eyebrow="Experiencias de marca"
            title="Momentos que atraen."
            accent="Ideas que permanecen."
            description="Convertimos conceptos de campaña en experiencias físicas que invitan a entrar, participar, compartir y recordar."
            heroImage="/hero-slides/slide-3.webp"
            primaryCta="Crear una activación"
            capabilitiesTitle="Diseñamos para provocar una reacción."
            capabilitiesDescription="Desde una intervención puntual hasta un lanzamiento completo, conectamos espacio, narrativa y tecnología."
            features={[
                { title: 'Concepto creativo', description: 'Construimos una idea central coherente con la campaña y su audiencia.' },
                { title: 'Interacción', description: 'Diseñamos recorridos, dinámicas y momentos que invitan a participar.' },
                { title: 'Contenido social', description: 'Creamos escenas naturalmente fotogénicas y fáciles de compartir.' },
                { title: 'Producción en vivo', description: 'Coordinamos fabricación, técnica, operación y desmontaje del evento.' },
            ]}
            galleryTitle="Experiencias hechas para ser vividas."
            galleryDescription="Diseñamos cada encuadre, recorrido y encuentro como parte de una misma historia."
            gallery={[
                { image: '/hero-slides/slide-3.webp', title: 'Escenarios inmersivos', label: 'Experiencia' },
                { image: '/hero-slides/slide-1.webp', title: 'Encuentros de marca', label: 'Conexión' },
                { image: '/hero-slides/slide-2.webp', title: 'Espacios compartibles', label: 'Contenido' },
            ]}
            ctaTitle="Hagamos que tu próxima campaña suceda en el mundo real."
            ctaDescription="Comparte tu objetivo, público y fecha. Nuestro equipo convertirá el concepto en una experiencia lista para activarse."
        />
    )
}
