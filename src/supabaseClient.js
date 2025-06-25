import { createClient } from '@supabase/supabase-js'

// Remplace par tes propres clés :
const supabaseUrl = 'https://lkjbwwgjaxbxltopefax.supabase.co'
// const supabaseKey =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxramJ3d2dqYXhieGx0b3BlZmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTgwMzIsImV4cCI6MjA2Mjc5NDAzMn0.g8t2OfOpz6irjCyOKpd1jNSPo6W5ypCRcdiWl4vAnWU'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
