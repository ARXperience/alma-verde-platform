// =====================================================
// TYPES - Authentication and User Roles
// =====================================================

export type UserRole =
    | 'admin'
    | 'comercial'
    | 'diseno'
    | 'produccion'
    | 'marketing'
    | 'financiero'
    | 'cliente';

export type BusinessUnit = 'alma_verde' | 'alma_home';

export type ProjectStatus =
    | 'cotizacion'
    | 'aprobado'
    | 'en_diseno'
    | 'en_produccion'
    | 'instalado'
    | 'finalizado'
    | 'cancelado';

export type ProjectType =
    | 'stand'
    | 'evento'
    | 'branding'
    | 'decoracion'
    | 'mobiliario'
    | 'alquiler'
    | 'otro';

export type PaymentStatus = 'pendiente' | 'parcial' | 'completado' | 'reembolsado';

export type InvoiceStatus = 'borrador' | 'enviada' | 'pagada' | 'vencida' | 'cancelada';

// =====================================================
// DATABASE TYPES
// =====================================================

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    company?: string;
    avatar_url?: string;
    business_unit: BusinessUnit;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    project_number: string;
    client_id?: string;
    business_unit: BusinessUnit;

    // Project details
    title: string;
    description?: string;
    project_type: ProjectType;
    status: ProjectStatus;

    // Quotation data
    briefing?: string;
    audio_transcription?: string;
    audio_url?: string;
    extracted_variables: Record<string, any>;

    // Pricing
    estimated_cost?: number;
    final_cost?: number;
    pricing_breakdown: Record<string, any>;

    // Timeline
    estimated_delivery_date?: string;
    actual_delivery_date?: string;

    // Assignment
    assigned_to?: string;

    // Metadata
    metadata: Record<string, any>;
    is_published: boolean;
    published_at?: string;

    created_at: string;
    updated_at: string;
}

export interface ProjectRender {
    id: string;
    project_id: string;
    image_url: string;
    prompt?: string;
    version: number;
    is_selected: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

export interface ProjectFile {
    id: string;
    project_id: string;
    uploaded_by?: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    category?: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface ProjectMessage {
    id: string;
    project_id: string;
    user_id?: string;
    message: string;
    attachments: any[];
    is_internal: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

export interface Payment {
    id: string;
    project_id: string;
    client_id?: string;
    amount: number;
    payment_type: string;
    status: PaymentStatus;
    bold_transaction_id?: string;
    bold_payment_link?: string;
    payment_method?: string;
    payment_date?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: string;
    project_id: string;
    client_id?: string;
    payment_id?: string;
    invoice_number: string;
    status: InvoiceStatus;
    subtotal: number;
    tax: number;
    total: number;
    dian_cufe?: string;
    dian_xml_url?: string;
    dian_pdf_url?: string;
    issue_date: string;
    due_date?: string;
    paid_date?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface PortfolioItem {
    id: string;
    project_id: string;
    business_unit: BusinessUnit;
    title: string;
    description?: string;
    category?: string;
    client_name?: string;
    featured_image_url?: string;
    gallery_images: string[];
    metrics: Record<string, any>;
    tags: string[];
    is_featured: boolean;
    display_order: number;
    published_at: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    business_unit: BusinessUnit;
    name: string;
    description?: string;
    category?: string;
    price: number;
    compare_at_price?: number;
    images: string[];
    stock_quantity: number;
    is_available: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

// =====================================================
// AUTH TYPES
// =====================================================

export interface AuthUser extends User {
    // Extended from Supabase auth.user
}

export interface AuthSession {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

// =====================================================
// PERMISSION HELPERS
// =====================================================

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['*'], // All permissions
    comercial: [
        'projects:read',
        'projects:create',
        'projects:update',
        'clients:read',
        'clients:create',
        'clients:update',
        'quotations:read',
        'quotations:create',
        'quotations:update',
        'payments:read',
        'products:read',
    ],
    diseno: [
        'projects:read',
        'projects:update',
        'project_files:read',
        'project_files:create',
        'project_messages:read',
        'project_messages:create',
    ],
    produccion: [
        'projects:read',
        'projects:update',
        'project_files:read',
        'project_files:create',
        'project_messages:read',
        'project_messages:create',
    ],
    marketing: [
        'projects:read',
        'portfolio:read',
        'portfolio:create',
        'portfolio:update',
        'products:read',
    ],
    financiero: [
        'projects:read',
        'payments:read',
        'payments:create',
        'payments:update',
        'invoices:read',
        'invoices:create',
        'invoices:update',
    ],
    cliente: [
        'projects:read:own',
        'quotations:create',
        'payments:read:own',
        'invoices:read:own',
        'products:read',
    ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
}

export function isInternalRole(role: UserRole): boolean {
    return role !== 'cliente';
}
