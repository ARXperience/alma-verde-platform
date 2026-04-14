// =====================================================
// QUOTATION TYPES
// =====================================================

import type { ProjectType } from './database'

export interface QuotationVariables {
    project_type: ProjectType
    square_meters?: number
    location: string
    materials: string[]
    production_time: number // days
    requires_transport: boolean
    requires_installation: boolean
    requires_disassembly: boolean
    estimated_budget?: number
    client_type: 'empresa' | 'hogar' | 'feria'
    special_requirements: string[]
    style_preferences?: string
}

export interface PricingBreakdown {
    base_cost: number
    materials_cost: number
    transport_cost: number
    installation_cost: number
    disassembly_cost: number
    subtotal: number
    tax: number
    total: number
    breakdown: {
        design: number
        production: number
        materials: Array<{
            item: string
            cost: number
        }>
    }
    notes: string[]
}

export interface QuotationState {
    // Input
    briefing: string
    audio_url?: string
    audio_transcription?: string

    // Extracted data
    variables?: QuotationVariables

    // Generated content
    description?: string
    render_prompts: string[]
    render_images: Array<{
        url: string
        prompt: string
        version: number
    }>

    // Pricing
    pricing?: PricingBreakdown

    // Chat history
    messages: Array<{
        role: 'user' | 'assistant'
        content: string
        timestamp: Date
    }>

    // Status
    step: 'briefing' | 'extraction' | 'confirmation' | 'rendering' | 'pricing' | 'complete'
    created_at: Date
    updated_at: Date
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export interface RenderIteration {
    version: number
    prompt: string
    image_url?: string
    feedback?: string
    created_at: Date
}
