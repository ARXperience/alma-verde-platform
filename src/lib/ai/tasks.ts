// Shared by the server engine and the admin UI (no server-only imports here)

export type AiProvider = 'gemini' | 'openai' | 'local' | 'pollinations'
export type AiTask = 'transcribe' | 'refine' | 'extract' | 'reasoning' | 'chat' | 'image'

export interface AiTaskConfig {
    provider: AiProvider
    model: string
}

export const TASKS: { id: AiTask; label: string; description: string; providers: AiProvider[] }[] = [
    { id: 'transcribe', label: 'Transcripción de audio', description: 'Convierte la nota de voz del cliente en texto.', providers: ['gemini', 'openai'] },
    { id: 'refine', label: 'Mejora del texto', description: 'Botón "Mejorar con IA" del brief.', providers: ['gemini', 'openai', 'local'] },
    { id: 'extract', label: 'Extracción de variables', description: 'Lee el brief y saca tipo, m², materiales, ciudad…', providers: ['gemini', 'openai', 'local'] },
    { id: 'reasoning', label: 'Cotización (modelo de pensamiento)', description: 'Razona el desglose de costos y el precio final.', providers: ['gemini', 'openai', 'local'] },
    { id: 'chat', label: 'Asistente de chat', description: 'Chat de la web y del cotizador.', providers: ['gemini', 'openai', 'local'] },
    { id: 'image', label: 'Generación de imágenes', description: 'Render conceptual del proyecto.', providers: ['gemini', 'local', 'openai', 'pollinations'] },
]
