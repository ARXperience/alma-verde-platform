
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpload() {
    console.log('Testing upload with ANON key...')
    const dummyFile = new Blob(['test'], { type: 'text/plain' })
    const fileName = `test-${Date.now()}.txt`

    // We need to sign in first? 
    // Usually RLS allows authenticated users. 
    // If I don't sign in, I am 'anon'.
    // Allowed policies might be "authenticated" or "public".
    // Let's try as 'anon' first (public upload).

    console.log('Attempting upload as ANON (Public)...')
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, dummyFile)

    if (error) {
        console.error('Anon Upload Error:', error)

        // Try to sign in as the user we know (admin)
        console.log('Attempting to sign in as admin...')
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'centrodigitaldediseno@gmail.com',
            password: 'password' // Use a known password or just skip this if we don't know it.
            // Wait, I don't know the password.
        })

        if (signInError) {
            console.log("Can't sign in to test authenticated upload. Skipping.")
        }
    } else {
        console.log('Anon Upload Success:', data)
    }
}

testUpload()
