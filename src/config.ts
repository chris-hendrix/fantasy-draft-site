export const NODE_ENV = process.env.NODE_ENV || 'development'
export const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')

export const VERCEL_ENV = process.env.VERCEL_ENV || 'local'

export const API_URL = '/api'
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || NODE_ENV
