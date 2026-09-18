import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'

export const metadata = {
    title: 'Mobiliario para Ferias | Alma Verde Diseño',
    description: 'Diseñamos y fabricamos mobiliario a medida para stands, espacios comerciales y exhibidores de productos.',
}

export default function MobiliarioPage() {
    return (
        <ServiceDetailPage
            eyebrow="Diseño y fabricación"
            title="Objetos que organizan."
            accent="Piezas que representan."
            description="Diseñamos mobiliario comercial y expositivo que resuelve la operación mientras expresa el carácter de la marca."
            heroImage="/service-furniture.webp"
            primaryCta="Diseñar mobiliario"
            capabilitiesTitle="Función, material y detalle en equilibrio."
            capabilitiesDescription="Cada pieza nace del uso, el producto y el contexto para integrarse naturalmente al espacio."
            features={[
                { title: 'Mostradores', description: 'Puntos de atención ergonómicos con almacenamiento y cableado resueltos.' },
                { title: 'Exhibidores', description: 'Sistemas que presentan el producto con jerarquía y acceso claro.' },
                { title: 'Módulos adaptables', description: 'Piezas que cambian de configuración según el espacio o la colección.' },
                { title: 'Acabados a medida', description: 'Maderas, metales, pinturas y detalles alineados con la identidad visual.' },
            ]}
            galleryTitle="Diseñado para usarse. Construido para durar."
            galleryDescription="Un lenguaje de formas, materiales y proporciones que acompaña al producto sin competir con él."
            gallery={[
                { image: '/service-furniture.webp', title: 'Sistemas de exhibición', label: 'Colección' },
                { image: '/hero-slides/slide-2.webp', title: 'Experiencia comercial', label: 'Retail' },
                { image: '/about-alma-verde.webp', title: 'Desarrollo a medida', label: 'Proceso' },
            ]}
            ctaTitle="Diseñemos la pieza que tu espacio necesita."
            ctaDescription="Comparte medidas, usos y referencias. Desarrollaremos una solución fabricable, funcional y coherente con tu marca."
        />
    )
}
