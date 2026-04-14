'use client'

import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { hasPermission } from '@/types/database'

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles?: UserRole[]
    requiredPermission?: string
    fallback?: React.ReactNode
}

export function RoleGuard({
    children,
    allowedRoles,
    requiredPermission,
    fallback = null,
}: RoleGuardProps) {
    const { user } = useAuth()

    if (!user) {
        return <>{fallback}</>
    }

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <>{fallback}</>
    }

    // Check permission-based access
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
