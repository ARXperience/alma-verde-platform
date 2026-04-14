
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4OTY5MiwiZXhwIjoyMDg1NjY1NjkyfQ.8YA7qbfv4zn-XBcXMkIQOOpxbA9cUabXUZBNC6Vc75U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectColumns() {
    console.log('Checking columns...')
    const columnsToCheck = ['is_rental', 'show_price', 'stock_quantity', 'short_desc', 'compare_price']

    for (const col of columnsToCheck) {
        const { error } = await supabase.from('products').select(col).limit(1)
        if (error) {
            console.log(`Column '${col}': MISSING (${error.message})`)
        } else {
            console.log(`Column '${col}': EXISTS`)
        }
    }
}

inspectColumns()
