import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfyaxodigcwtbukaqfyz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeWF4b2RpZ2N3dGJ1a2FxZnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODMxMjMsImV4cCI6MjA2ODc1OTEyM30.RpiaXcqvzHZnXAza4oy0RX4lBVIhJHR3NcR5Uj1bgPM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)