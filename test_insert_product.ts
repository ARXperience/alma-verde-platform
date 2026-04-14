
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4OTY5MiwiZXhwIjoyMDg1NjY1NjkyfQ.8YA7qbfv4zn-XBcXMkIQOOpxbA9cUabXUZBNC6Vc75U'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
    console.log('Testing minimal insert...')

    // Minimal Insert
    const { data, error } = await supabase.from('products').insert({
        name: 'Test Product ' + Date.now(),
        price: 100,
        description: 'Test Description',
        category: 'Test Category',
        business_unit: 'alma_home',
        stock_quantity: 10,
        images: []
    }).select()

    if (error) {
        console.error('Insert Error:', error)
    } else {
        console.log('Insert Success:', data)
    }
}

testInsert()
