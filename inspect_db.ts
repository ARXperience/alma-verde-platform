
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvtkhwfthushgpdtvwkk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtod2Z0aHVzaGdwZHR2d2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODk2OTIsImV4cCI6MjA4NTY2NTY5Mn0.Rrh8FtAJGnWOCszn7PYGQQT1BSRY4Yf3YuNv4YXOXIM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSchema() {
    console.log('Inspecting messages table...')
    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1)

    if (messagesError) {
        console.error('Error selecting from messages:', messagesError)
    } else {
        console.log('Messages table exists. Sample row:', messages)
    }

    console.log('Inspecting potential project_messages table...')
    const { data: projectMessages, error: projectMessagesError } = await supabase
        .from('project_messages')
        .select('*')
        .limit(1)

    if (projectMessagesError) {
        console.error('Error selecting from project_messages:', projectMessagesError)
    } else {
        console.log('project_messages table exists. Sample row:', projectMessages)
    }

    console.log('Inspecting products table...')
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1)

    if (productsError) {
        console.error('Error selecting from products:', productsError)
    } else {
        console.log('Products table exists. Sample row:', products)
    }

    console.log('Inspecting users table...')
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

    if (usersError) {
        console.error('Error selecting from users:', usersError)
    } else {
        console.log('Users table exists. Sample row:', users)
    }
}

inspectSchema()
