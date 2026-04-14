
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
    console.log('Creating product-images bucket...')
    const { data, error } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 5, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    })

    if (error) {
        console.error('Error creating bucket:', error)
    } else {
        console.log('Bucket created successfully:', data)
    }
}

createBucket()
