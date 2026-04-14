
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4OTY5MiwiZXhwIjoyMDg1NjY1NjkyfQ.8YA7qbfv4zn-XBcXMkIQOOpxbA9cUabXUZBNC6Vc75U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectTable() {
    console.log('Inspecting products table...')

    // We can't easily query information_schema via JS client without RLS blocking or RPC.
    // But we can try to select a single row and see keys, or try to insert a dummy and see error.

    // Better yet, let's try to just select * from products limit 1 and print the keys.
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting from products:', error)
    } else {
        if (data && data.length > 0) {
            console.log('Columns found in existing row:', Object.keys(data[0]))
        } else {
            console.log('No rows found. Can\'t infer columns from data.')
            // Fallback: Try to verify if 'in_stock' exists by selecting ONLY that column
            const { error: colError } = await supabase.from('products').select('in_stock').limit(1)
            if (colError) {
                console.log('Column "in_stock" likely MISSING. Error:', colError.message)
            } else {
                console.log('Column "in_stock" EXISTS.')
            }
        }
    }
}

inspectTable()
