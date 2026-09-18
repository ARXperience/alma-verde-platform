import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'

export const metadata = {
    title: 'Montaje Profesional | Alma Verde Diseño',
    description: 'Servicio integral de montaje y desmontaje profesional para stands, eventos y espacios comerciales.',
}

export default function MontajePage() {
    return (
        <ServiceDetailPage
            eyebrow="Ejecución integral"
            title="Todo en su lugar."
            accent="Todo a tiempo."
            description="Coordinamos logística, instalación, supervisión técnica y desmontaje para que el proyecto llegue impecable al momento de abrir puertas."
            heroImage="/hero-slides/slide-6.webp"
            primaryCta="Planear un montaje"
            capabilitiesTitle="La tranquilidad también se diseña."
            capabilitiesDescription="Un equipo que conoce el proyecto, anticipa los riesgos y responde en sitio de principio a fin."
            features={[
                { title: 'Equipo especializado', description: 'Personal técnico con experiencia en instalaciones de alta complejidad.' },
                { title: 'Control de tiempos', description: 'Cronogramas precisos y coordinación con recintos, proveedores y clientes.' },
                { title: 'Supervisión técnica', description: 'Revisión de estructura, acabados, iluminación y funcionamiento final.' },
                { title: 'Cierre responsable', description: 'Desmontaje organizado, inventario y recuperación de elementos reutilizables.' },
            ]}
            galleryTitle="Detrás de una apertura impecable."
            galleryDescription="Método, coordinación y cuidado en cada etapa para que el resultado se vea simple."
            gallery={[
                { image: '/hero-slides/slide-6.webp', title: 'Instalación en sitio', label: 'Montaje' },
                { image: '/hero-slides/slide-1.webp', title: 'Entrega terminada', label: 'Resultado' },
                { image: '/hero-slides/slide-5.webp', title: 'Escala y precisión', label: 'Producción' },
            ]}
            ctaTitle="Tu proyecto merece una ejecución a la altura del diseño."
            ctaDescription="Compártenos fechas, ciudad, recinto y alcance. Organizaremos el equipo y la logística necesarios para hacerlo realidad."
        />
    )
}
