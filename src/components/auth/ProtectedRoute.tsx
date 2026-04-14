'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@/types/database'
import { hasPermission } from '@/types/database'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
    requiredPermission?: string
    fallbackUrl?: string
}

export function ProtectedRoute({
    children,
    allowedRoles,
    requiredPermission,
    fallbackUrl = '/auth/login',
}: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        if (!user) {
            router.push(fallbackUrl)
            return
        }

        // Check role-based access
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.push('/unauthorized')
            return
        }

        // Check permission-based access
        if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
            router.push('/unauthorized')
            return
        }
    }, [user, loading, allowedRoles, requiredPermission, router, fallbackUrl])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    // Check role access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null
    }

    // Check permission access
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        return null
    }

    return <>{children}</>
}
