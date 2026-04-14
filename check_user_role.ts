
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    console.log('Checking user 03c4c2dd-15d4-4205-ac45-98eb264d9c0e...')
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', '03c4c2dd-15d4-4205-ac45-98eb264d9c0e')
        .single()

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('User record:', user)
    }
}

checkUser()
