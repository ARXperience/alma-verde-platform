'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    ExternalLink, FileText, FolderKanban, Globe, LayoutDashboard, Loader2, LogOut, Menu, MessageSquare,
    Package, Settings, ShoppingCart, Users, X, type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { supabase } from '@/lib/supabase/client'

const STAFF_ROLES: Record<string, string> = {
    admin: 'Administrador',
    comercial: 'Comercial',
    produccion: 'Producción',
    diseno: 'Diseño',
    marketing: 'Marketing',
    financiero: 'Financiero',
}

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: 'quotes' }

const NAV: { section?: string; items: NavItem[] }[] = [
    { items: [{ href: '/admin', label: 'Inicio', icon: LayoutDashboard }] },
    {
        section: 'Ventas',
        items: [
            { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban, badge: 'quotes' },
            { href: '/admin/quotations', label: 'Cotizaciones', icon: FileText },
            { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare },
        ],
    },
    {
        section: 'Tienda',
        items: [
            { href: '/admin/products', label: 'Productos', icon: Package },
            { href: '/admin/orders', label: 'Órdenes', icon: ShoppingCart },
        ],
    },
    { section: 'Sitio web', items: [{ href: '/admin/portfolio', label: 'Portafolio', icon: Globe }] },
    {
        section: 'Sistema',
        items: [
            { href: '/admin/users', label: 'Usuarios', icon: Users },
            { href: '/admin/settings', label: 'Configuración', icon: Settings },
        ],
    },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [role, setRole] = useState<string | null>(null)
    const [checkingRole, setCheckingRole] = useState(true)
    const [menuOpen, setMenuOpen] = useState(false)
    const [newQuotes, setNewQuotes] = useState(0)

    useEffect(() => {
        if (loading) return
        if (!user) {
            router.push('/auth/login')
            return
        }
        supabase.from('users').select('role').eq('id', user.id).single().then(({ data, error }) => {
            const userRole = (data as { role: string } | null)?.role
            if (error || !userRole || !STAFF_ROLES[userRole]) router.push('/dashboard') // clients go to their own area
            else setRole(userRole)
            setCheckingRole(false)
        })
    }, [user, loading, router])

    // Quotes waiting for review: refreshed on every navigation so the badge follows status changes
    useEffect(() => {
        if (!role) return
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'cotizacion')
            .then(({ count }) => setNewQuotes(count || 0))
    }, [pathname, role])

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    if (loading || checkingRole) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f6f8f6]">
                <Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" />
            </div>
        )
    }

    if (!role) return null

    const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

    const sidebar = (
        <div className="relative flex h-full flex-col overflow-hidden bg-[#102216] text-slate-300">
            <div className="pointer-events-none absolute left-[-50%] top-0 h-[300px] w-[200%] rounded-full bg-[#13ec5b]/5 blur-[80px]" />

            <div className="relative flex items-center justify-between p-6">
                <Link href="/admin" className="text-white">
                    <Logo className="h-10 w-auto" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#13ec5b]">Panel de gestión</p>
                </Link>
                <button className="rounded-lg p-2 hover:bg-white/10 md:hidden" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="custom-scrollbar relative flex-1 space-y-6 overflow-y-auto px-4 py-2">
                {NAV.map((group, i) => (
                    <div key={group.section || i}>
                        {group.section && (
                            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{group.section}</p>
                        )}
                        <div className="space-y-1">
                            {group.items.map(item => {
                                const active = isActive(item.href)
                                const badge = item.badge === 'quotes' ? newQuotes : 0
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? 'bg-[#13ec5b]/10 text-white shadow-[inset_3px_0_0_#13ec5b]' : 'hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <item.icon size={19} className={active ? 'text-[#13ec5b]' : 'text-slate-500 transition-colors group-hover:text-[#13ec5b]'} />
                                        <span className="flex-1">{item.label}</span>
                                        {badge > 0 && (
                                            <span className="min-w-[22px] rounded-full bg-amber-400 px-1.5 py-0.5 text-center text-[11px] font-black text-[#102216]" title="Cotizaciones por revisar">
                                                {badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="relative space-y-2 border-t border-white/10 bg-black/20 p-4">
                <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
                    <ExternalLink size={16} /> Ver sitio web
                </Link>
                <div className="flex items-center gap-3 px-2 pt-2">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#13ec5b] text-sm font-bold text-[#102216]">
                        {(user?.full_name || user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{user?.full_name || user?.email}</p>
                        <p className="text-xs text-slate-400">{STAFF_ROLES[role]}</p>
                    </div>
                    <button onClick={handleSignOut} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300" aria-label="Cerrar sesión" title="Cerrar sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-[#f6f8f6] font-display">
            <aside className="hidden w-64 flex-none border-r border-white/10 md:block">{sidebar}</aside>

            {/* Mobile: top bar + drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in shadow-2xl">{sidebar}</aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between bg-[#102216] px-4 py-3 text-white md:hidden">
                    <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Abrir menú">
                        <Menu className="h-5 w-5" />
                    </button>
                    <Logo className="h-8 w-auto" />
                    <span className="w-9" />
                </header>
                <main className="flex-1 overflow-auto bg-[#f6f8f6]">{children}</main>
            </div>
        </div>
    )
}
