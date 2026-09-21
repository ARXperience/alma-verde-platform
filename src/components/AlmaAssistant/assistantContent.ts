export type AlmaPose =
    | 'idle'
    | 'wave'
    | 'point'
    | 'think'
    | 'build'
    | 'plant'
    | 'draw'
    | 'sit'
    | 'walk'
    | 'celebrate'

export type AlmaPosition = 'left' | 'right'

export interface AssistantSectionContent {
    message: string
    variants?: string[]
    pose: AlmaPose
    position: AlmaPosition
    offsetY?: number
    scale?: number
}

export const assistantContent: Record<string, AssistantSectionContent> = {
    hero: {
        message: 'Hola. Soy Ensamble. Por aquí convertimos ideas en espacios que las personas pueden recorrer, tocar y recordar. Te acompaño.',
        pose: 'wave',
        position: 'right',
        scale: 1.08,
    },
    about: {
        message: 'Antes de diseñar un espacio buscamos entender qué debe hacer sentir. Lo bonito viene después; primero encontramos el propósito.',
        pose: 'idle',
        position: 'right',
    },
    philosophy: {
        message: 'Cada decisión cuenta: una forma, un material, una luz o incluso un espacio vacío pueden decir algo de una marca.',
        pose: 'think',
        position: 'left',
    },
    services: {
        message: 'No hacemos todos los proyectos de la misma manera. Diseñamos la solución alrededor de lo que la marca necesita comunicar y conseguir.',
        variants: [
            'Podemos entrar desde la idea, el diseño, la producción o acompañar todo el proceso.',
            'Cada proyecto necesita una mezcla diferente de estrategia, espacio, material y producción.',
            'Si todavía no sabes exactamente qué necesitas, no pasa nada. También podemos empezar por ahí.',
        ],
        pose: 'point',
        position: 'right',
    },
    stands: {
        message: 'Un stand dura pocos días, pero puede quedarse mucho tiempo en la memoria. Diseñamos pensando en experiencia, operación y montaje.',
        pose: 'build',
        position: 'right',
    },
    decoration: {
        message: 'Cambiar un espacio no siempre significa llenarlo. A veces una textura, una luz o un detalle bien elegido transforma toda la experiencia.',
        pose: 'think',
        position: 'left',
    },
    activations: {
        message: 'Cuando una persona participa, la marca deja de ser algo que simplemente observa. Aquí diseñamos momentos para vivirla.',
        pose: 'celebrate',
        position: 'right',
    },
    branding: {
        message: 'El branding también se toca. Colores, formas, materiales y recorridos pueden convertir una identidad gráfica en una experiencia real.',
        pose: 'point',
        position: 'left',
    },
    furniture: {
        message: 'Una pieza puede resolver una función y, al mismo tiempo, contar quién eres. Ahí es donde mobiliario y marca trabajan juntos.',
        pose: 'sit',
        position: 'right',
    },
    design: {
        message: 'Todo empieza pequeño: una conversación, un boceto, una pregunta. Después vamos convirtiéndolo en algo que pueda construirse.',
        pose: 'draw',
        position: 'left',
    },
    visualization: {
        message: 'Antes de fabricar podemos recorrer la idea. El 3D permite probar proporciones, materiales y decisiones antes de llevarlas al mundo real.',
        pose: 'think',
        position: 'right',
    },
    production: {
        message: 'Diseñar también significa saber cómo se construye. Cada unión, material y acabado forma parte de la idea.',
        pose: 'build',
        position: 'left',
    },
    montage: {
        message: 'Aquí el diseño deja la pantalla. Coordinamos piezas, tiempos y personas para que todo termine exactamente donde debe estar.',
        pose: 'build',
        position: 'right',
    },
    sustainability: {
        message: 'Ser sostenible no significa decorar todo de verde. Significa pensar desde el inicio cómo usar mejor cada material y cada recurso.',
        pose: 'plant',
        position: 'left',
    },
    materials: {
        message: 'Los materiales hablan. Algunos transmiten calidez, otros precisión, ligereza o fuerza. Elegirlos también es diseñar.',
        pose: 'plant',
        position: 'right',
    },
    portfolio: {
        message: 'Cada proyecto empezó con un problema diferente. Por eso preferimos enseñarte lo que hicimos y también por qué lo hicimos.',
        pose: 'point',
        position: 'right',
    },
    'case-study': {
        message: 'No mires solamente el resultado. Concepto, circulación, materiales, fabricación y experiencia trabajan juntos.',
        pose: 'think',
        position: 'right',
    },
    process: {
        message: 'Una idea pasa por muchas manos antes de convertirse en espacio. Cuidamos que durante ese recorrido no pierda su intención.',
        pose: 'walk',
        position: 'left',
    },
    team: {
        message: 'Yo soy solo la cara pequeña de todo esto. Detrás hay personas que diseñan, producen, coordinan y hacen que las ideas sucedan.',
        pose: 'wave',
        position: 'right',
    },
    clients: {
        message: 'Nuestra identidad nunca debería competir con la de nuestros clientes. La protagonista de cada espacio debe ser su marca.',
        pose: 'idle',
        position: 'left',
    },
    contact: {
        message: 'Si tienes una idea todavía sin forma, también sirve. Cuéntanos qué necesitas lograr y podemos empezar desde ahí.',
        pose: 'wave',
        position: 'left',
    },
    form: {
        message: 'No necesitas tener todo resuelto. Cuéntanos qué quieres crear, dónde, cuándo y qué debería conseguir el proyecto.',
        pose: 'point',
        position: 'left',
    },
    cta: {
        message: 'Las mejores ideas no tienen que empezar grandes. Solo necesitan un buen lugar para comenzar.',
        pose: 'walk',
        position: 'right',
    },
}

export const routeDefaults: Record<string, string> = {
    '/': 'hero',
    '/nosotros': 'hero',
    '/servicios': 'services',
    '/servicios/stands-ecologicos': 'stands',
    '/servicios/activaciones': 'activations',
    '/servicios/produccion-grafica': 'branding',
    '/servicios/mobiliario': 'furniture',
    '/servicios/montaje': 'montage',
    '/portafolio': 'portfolio',
    '/contacto': 'contact',
}

export const navigationOptions = [
    { label: 'Quiero hacer un stand', href: '/servicios#stands' },
    { label: 'Necesito mobiliario', href: '/servicios#mobiliario' },
    { label: 'Tengo un evento', href: '/servicios#activaciones' },
    { label: 'Quiero transformar un espacio', href: '/servicios#decoracion' },
    { label: 'Quiero ver proyectos', href: '/portafolio' },
    { label: 'Quiero hablar con Alma Verde', href: '/contacto' },
]
