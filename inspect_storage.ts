
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuckets() {
    console.log('Listing storage buckets...')
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
        console.error('Error listing buckets:', error)
    } else {
        console.log('Buckets:', data)
        const productImagesBucket = data.find(b => b.name === 'product-images')
        if (productImagesBucket) {
            console.log('product-images bucket found:', productImagesBucket)
        } else {
            console.log('product-images bucket NOT found!')
            // Try to create it? Access token might not have permission, but worth a try or just knowing it's missing is enough.
        }
    }
}

checkBuckets()
