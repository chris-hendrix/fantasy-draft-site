export const NODE_ENV = process.env.NODE_ENV || 'development'
export const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')

export const API_URL = '/api'
export const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
)
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
)
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const PUBLIC_SUPABASE_BUCKET = process.env.PUBLIC_SUPABASE_BUCKET || NODE_ENV
export const PRIVATE_SUPABASE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || `${NODE_ENV}-private`
export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || 'local'
