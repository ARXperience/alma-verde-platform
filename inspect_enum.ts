
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectEnum() {
    console.log('Inspecting users table to infer role enum...')
    const { data: users, error } = await supabase
        .from('users')
        .select('role')
        .limit(10)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Sample roles:', users.map(u => u.role))
    }
}

inspectEnum()
