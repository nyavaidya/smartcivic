const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

export { supabase }