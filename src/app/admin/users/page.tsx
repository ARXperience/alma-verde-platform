'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, UserCheck, Users as UsersIcon, UserX } from 'lucide-react'
import { FilterChip, PageHeader, SearchBox, Stat } from '@/components/admin/ui'
import { formatDate, timeAgo } from '@/lib/projects/display'

interface UserProfile {
    id: string
    email: string
    full_name: string
    role: string
    phone: string | null
    company: string | null
    is_active: boolean
    created_at: string
}

const ROLE_MAP: Record<string, string> = {
    admin: 'Administrador',
    comercial: 'Comercial',
    diseno: 'Diseño',
    produccion: 'Producción',
    marketing: 'Marketing',
    financiero: 'Financiero',
    cliente: 'Cliente',
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    useEffect(() => {
        supabase.from('users').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (error) console.error('Error fetching users:', error)
            setUsers((data || []) as UserProfile[])
            setLoading(false)
        })
    }, [])

    async function toggleUserActive(user: UserProfile) {
        const { error } = await (supabase.from('users') as any).update({ is_active: !user.is_active }).eq('id', user.id)
        if (error) alert('Error al actualizar el usuario: ' + error.message)
        else setUsers(list => list.map(u => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)))
    }

    async function changeRole(user: UserProfile, role: string) {
        // The role decides who gets into the admin, so ask before changing it
        if (!confirm(`¿Cambiar el rol de ${user.full_name || user.email} a ${ROLE_MAP[role]}?`)) return
        const { error } = await (supabase.from('users') as any).update({ role }).eq('id', user.id)
        if (error) alert('Error al cambiar el rol: ' + error.message)
        else setUsers(list => list.map(u => (u.id === user.id ? { ...u, role } : u)))
    }

    const term = search.trim().toLowerCase()
    const matches = users.filter(u => !term || [u.full_name, u.email, u.company, u.phone].some(v => v?.toLowerCase().includes(term)))
    const visible = roleFilter === 'all' ? matches : matches.filter(u => u.role === roleFilter)
    const roles = Object.keys(ROLE_MAP).filter(r => users.some(u => u.role === r))

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
    }

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <PageHeader eyebrow="Sistema" title="Usuarios" description="Clientes y equipo de Alma Verde. El rol define quién entra al panel de gestión." />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Usuarios" value={users.length} />
                <Stat label="Activos" value={users.filter(u => u.is_active).length} />
                <Stat label="Equipo" value={users.filter(u => u.role !== 'cliente').length} hint="Tienen acceso al panel" />
                <Stat label="Clientes" value={users.filter(u => u.role === 'cliente').length} />
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nombre, correo, empresa…" />
                <div className="flex flex-wrap gap-2">
                    <FilterChip active={roleFilter === 'all'} onClick={() => setRoleFilter('all')} label="Todos" count={matches.length} />
                    {roles.map(r => (
                        <FilterChip key={r} active={roleFilter === r} onClick={() => setRoleFilter(r)} label={ROLE_MAP[r]} count={matches.filter(u => u.role === r).length} />
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                {visible.length === 0 && (
                    <div className="p-16 text-center">
                        <UsersIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                        <p className="font-bold text-[#102216]">No se encontraron usuarios</p>
                    </div>
                )}
                {visible.map(user => (
                    <div key={user.id} className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-0 md:flex-row md:items-center md:px-6">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className={`grid h-11 w-11 flex-none place-items-center rounded-full text-sm font-black ${user.role === 'cliente' ? 'bg-slate-100 text-slate-500' : 'bg-[#13ec5b] text-[#102216]'}`}>
                                {(user.full_name || user.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-bold text-[#102216]">{user.full_name || 'Sin nombre'}</p>
                                <p className="truncate text-sm text-slate-500">
                                    {user.email}{user.phone ? ` · ${user.phone}` : ''}{user.company ? ` · ${user.company}` : ''}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 md:w-32 md:text-right" title={formatDate(user.created_at)}>Registro {timeAgo(user.created_at)}</p>
                        <div className="flex items-center gap-2">
                            <select
                                value={user.role}
                                onChange={(e) => changeRole(user, e.target.value)}
                                aria-label="Rol"
                                className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 focus:border-[#13ec5b] focus:outline-none"
                            >
                                {Object.entries(ROLE_MAP).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                            </select>
                            <button
                                onClick={() => toggleUserActive(user)}
                                className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-colors ${user.is_active ? 'bg-[#13ec5b]/10 text-[#0a8c35] hover:bg-[#13ec5b]/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                                title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                                {user.is_active ? <><UserCheck className="h-3.5 w-3.5" /> Activo</> : <><UserX className="h-3.5 w-3.5" /> Inactivo</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
