import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/admin', '/dashboard', '/profile']
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Update session
    const response = await updateSession(request)

    // Check if user is authenticated
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const token = request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`)

    const isAuthenticated = !!token

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
