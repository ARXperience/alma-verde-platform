'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { User, UserRole } from '@/types/database'

interface AuthContextType {
    user: User | null
    supabaseUser: SupabaseUser | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<void>
    updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSupabaseUser(session?.user ?? null)
            if (session?.user) {
                fetchUserProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSupabaseUser(session?.user ?? null)
            if (session?.user) {
                await fetchUserProfile(session.user.id)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchUserProfile(userId: string) {
        try {
            console.log('🔍 Fetching profile for userId:', userId)

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // Ignore AbortError and known benign errors
                if (error.code === 'PGRST116') { // Not found - acceptable for new users
                    console.warn('User profile not found yet.')
                    return
                }
                throw error
            }

            if (!data) return

            console.log('User profile loaded:', data)
            setUser(data as unknown as User)
        } catch (error: any) {
            // Ignore AbortError often caused by navigation
            if (error?.message?.includes('AbortError') || error?.name === 'AbortError') {
                return
            }

            console.error('❌ Error fetching profile:', error)
            // If the error is an object, try to stringify it for more details
            if (typeof error === 'object' && error !== null) {
                try {
                    console.error('Error details JSON:', JSON.stringify(error, null, 2))
                } catch (e) {
                    console.error('Could not stringify error object')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
    }

    async function signUp(email: string, password: string, userData: Partial<User>) {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('No user returned from signup')

        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email,
            full_name: userData.full_name || '',
            role: userData.role || 'cliente',
            phone: userData.phone,
            company: userData.company,
            business_unit: userData.business_unit || 'alma_verde',
        })

        if (profileError) throw profileError
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
    }

    async function resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) throw error
    }

    async function updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        })
        if (error) throw error
    }

    const value = {
        user,
        supabaseUser,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
