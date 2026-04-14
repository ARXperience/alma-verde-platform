import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Client component client
export const createBrowserClient = () => {
    return createClientComponentClient()
}

// Server-side client
export const createServerClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Types
export type Database = {
    public: {
        Tables: {
            // Add your table types here
        }
    }
}
