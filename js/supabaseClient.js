const supabaseUrl = "https://mqvcamtirxgupzcdlncx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xdmNhbXRpcnhndXB6Y2RsbmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjU2MjMsImV4cCI6MjA4OTI0MTYyM30.LXgpqplMAElmEiE9yn-Msai2rz4UbWIs0UR-K1T2xFs"

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

export { supabase }