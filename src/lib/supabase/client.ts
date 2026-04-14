import { createBrowserClient } from '@supabase/ssr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null

export function createClient() {
    if (client) return client

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Missing Supabase environment variables');
        }
    }

    client = createBrowserClient(supabaseUrl || 'https://dummy.supabase.co', supabaseAnonKey || 'dummy_anon_key')

    return client
}

export const supabase = createClient()

