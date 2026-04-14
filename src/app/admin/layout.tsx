'use client'

import { useAuth } from '@/contexts/AuthContext' // Assuming this exists or using supabase
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2, LayoutDashboard, FileText, Settings, Users, ShoppingBag, LogOut, Package, ShoppingCart, Globe } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [checkingRole, setCheckingRole] = useState(true)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login')
            } else {
                checkUserRole(user.id)
            }
        }
    }, [user, loading, router])

    async function checkUserRole(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) throw error

            // Allow admin, comercial, produccion, diseno, marketing
            // Block cliente
            const allowedRoles = ['admin', 'comercial', 'produccion', 'diseno', 'marketing', 'financiero']

            if (data && allowedRoles.includes((data as any).role)) {
                setIsAdmin(true)
            } else {
                router.push('/dashboard') // Redirect to client dashboard
            }
        } catch (error) {
            console.error('Error checking role:', error)
            router.push('/dashboard')
        } finally {
            setCheckingRole(false)
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    if (loading || checkingRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAdmin) return null

    return (
        <div className="flex h-screen bg-[#f6f8f6] font-display">
            {/* Sidebar */}
            <aside className="w-64 bg-[#102216] border-r border-white/10 hidden md:flex flex-col text-slate-300 relative overflow-hidden">
                {/* Subtle dark green glow in sidebar */}
                <div className="absolute top-0 left-[-50%] w-[200%] h-[300px] bg-[#13ec5b]/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
                
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#13ec5b] to-[#0a8c35] flex items-center justify-center shadow-lg shadow-[#13ec5b]/20">
                            <span className="material-symbols-outlined text-[#102216] font-black">eco</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">
                                Alma Verde
                            </h1>
                            <p className="text-[10px] text-[#13ec5b] uppercase font-bold tracking-widest mt-0.5">Workspace</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto relative z-10 custom-scrollbar">
                    <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavLink href="/admin/portfolio" icon={<Globe size={20} />} label="Portafolio Web" />
                    <NavLink href="/admin/projects" icon={<FileText size={20} />} label="Proyectos CRM" />
                    <NavLink href="/admin/products" icon={<Package size={20} />} label="Productos Web" />
                    <NavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Ordenes Web" />
                    <NavLink href="/admin/quotations" icon={<ShoppingBag size={20} />} label="Cotizaciones CRM" />
                    <NavLink href="/admin/users" icon={<Users size={20} />} label="Usuarios" />
                    <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Configuración" />
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20 relative z-10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-[#13ec5b] flex items-center justify-center text-[#102216] font-bold text-sm shadow-md">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-slate-400">Administrador</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" onClick={handleSignOut}>
                        <LogOut size={18} className="mr-3" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#f6f8f6]">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    // Basic active state check (can be improved with usePathname)
    const isActive = false // we will rely on hover states mostly, or we could add usePathname if imported
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                hover:bg-white/10 hover:text-white
            `}
        >
            <span className="text-slate-400 group-hover:text-[#13ec5b] transition-colors">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </Link>
    )
}
