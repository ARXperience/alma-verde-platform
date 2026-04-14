
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function auditTables() {
    const tables = ['project_messages', 'quotations', 'orders', 'project_renders', 'project_files', 'products', 'portfolio_items']

    console.log('--- Database Table Audit ---')

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.log(`❌ ${table}: Missing or Error (${error.message})`)
        } else {
            console.log(`✅ ${table}: Exists`)

            // inspect columns if it exists
            const { data, error: colError } = await supabase.from(table).select().limit(1)
            if (data && data.length > 0) {
                console.log(`   Columns detected: ${Object.keys(data[0]).join(', ')}`)
            } else {
                console.log(`   (Table empty, cannot detect columns via select)`)
            }
        }
    }
}

auditTables()
