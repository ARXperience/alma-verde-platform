'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Eye, Users as UsersIcon, Shield, UserCheck, UserX } from 'lucide-react'

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
    'admin': 'Administrador',
    'comercial': 'Comercial',
    'diseno': 'Diseño',
    'produccion': 'Producción',
    'marketing': 'Marketing',
    'financiero': 'Financiero',
    'cliente': 'Cliente',
}

const ROLE_COLOR: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'admin': 'destructive',
    'comercial': 'default',
    'diseno': 'secondary',
    'produccion': 'secondary',
    'marketing': 'outline',
    'financiero': 'outline',
    'cliente': 'secondary',
}

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    async function toggleUserActive(userId: string, currentActive: boolean) {
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({ is_active: !currentActive })
                .eq('id', userId)

            if (error) throw error
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
        } catch (error) {
            console.error('Error toggling user:', error)
            alert('Error al actualizar el usuario')
        }
    }

    async function changeRole(userId: string, newRole: string) {
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (error) {
            console.error('Error changing role:', error)
            alert('Error al cambiar el rol')
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.company?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        admins: users.filter(u => u.role === 'admin').length,
        clients: users.filter(u => u.role === 'cliente').length,
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-[#102216] tracking-tight">Usuarios</h1>
                <p className="text-slate-500 mt-1">Gestión de usuarios de la plataforma</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <UsersIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#102216]">{stats.total}</p>
                            <p className="text-xs font-bold text-slate-500">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-50">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#102216]">{stats.active}</p>
                            <p className="text-xs font-bold text-slate-500">Activos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-50">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#102216]">{stats.admins}</p>
                            <p className="text-xs font-bold text-slate-500">Admins</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-50">
                            <UsersIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#102216]">{stats.clients}</p>
                            <p className="text-xs font-bold text-slate-500">Clientes</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, email o empresa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-48 rounded-xl">
                                <SelectValue placeholder="Filtrar por rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="comercial">Comercial</SelectItem>
                                <SelectItem value="diseno">Diseño</SelectItem>
                                <SelectItem value="produccion">Producción</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="financiero">Financiero</SelectItem>
                                <SelectItem value="cliente">Cliente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-bold text-slate-600">Usuario</TableHead>
                                <TableHead className="font-bold text-slate-600">Rol</TableHead>
                                <TableHead className="font-bold text-slate-600">Empresa</TableHead>
                                <TableHead className="font-bold text-slate-600">Registro</TableHead>
                                <TableHead className="font-bold text-slate-600">Estado</TableHead>
                                <TableHead className="font-bold text-slate-600 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <UsersIcon className="w-12 h-12 opacity-30" />
                                            <p className="text-lg font-medium">No se encontraron usuarios</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/80 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#13ec5b] flex items-center justify-center text-[#102216] font-bold text-sm flex-shrink-0">
                                                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#102216]">{user.full_name || 'Sin nombre'}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={user.role} onValueChange={(val) => changeRole(user.id, val)}>
                                                <SelectTrigger className="w-36 h-8 rounded-lg text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                    <SelectItem value="comercial">Comercial</SelectItem>
                                                    <SelectItem value="diseno">Diseño</SelectItem>
                                                    <SelectItem value="produccion">Producción</SelectItem>
                                                    <SelectItem value="marketing">Marketing</SelectItem>
                                                    <SelectItem value="financiero">Financiero</SelectItem>
                                                    <SelectItem value="cliente">Cliente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{user.company || '—'}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {new Date(user.created_at).toLocaleDateString('es-CO')}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleUserActive(user.id, user.is_active)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                    user.is_active
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                            >
                                                {user.is_active ? (
                                                    <><UserCheck className="w-3 h-3" /> Activo</>
                                                ) : (
                                                    <><UserX className="w-3 h-3" /> Inactivo</>
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
