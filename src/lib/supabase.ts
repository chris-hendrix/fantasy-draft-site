import { createClient } from '@supabase/supabase-js'
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_BUCKET,
  PRIVATE_SUPABASE_BUCKET
} from '@/config'

const createSupabaseClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const getSupabaseClient = () => {
  if (process.env.NODE_ENV === 'production') return createSupabaseClient()
  if (!global.supabase) global.supabase = createSupabaseClient()
  return global.supabase
}

const supabase = getSupabaseClient()

export const uploadFile = async (file: File, directory: string, asPublic: boolean = false) => {
  if (!supabase) throw new Error('Supabase client not running')
  const bucket = asPublic ? PUBLIC_SUPABASE_BUCKET : PRIVATE_SUPABASE_BUCKET
  const storageApi = supabase.storage.from(bucket)
  const path = `${directory}/${file.name}`

  // upload new file
  const { data, error: uploadError } = await storageApi.upload(path, file, {
    contentType: file.type, upsert: true
  })
  if (uploadError) throw new Error(uploadError.message)

  return {
    path: data.path,
    publicUrl: asPublic
      ? storageApi.getPublicUrl(path).data.publicUrl
      : null,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

export const getSignedUrl = async (path: string, expiresIn: number = 60) => {
  if (!supabase) throw new Error('Supabase client not running')
  const bucket = PRIVATE_SUPABASE_BUCKET
  const storageApi = supabase.storage.from(bucket)

  const { data, error } = await storageApi.createSignedUrl(path, expiresIn)
  if (error) throw new Error(error.message)

  return data.signedUrl
}

export const getSignedUploadUrlDirectly = async (file: File) => {
  if (!supabase) throw new Error('Supabase client not running')
  const bucket = PRIVATE_SUPABASE_BUCKET
  const storageApi = supabase.storage.from(bucket)

  const { data, error } = await storageApi.createSignedUploadUrl(file.name, { upsert: true })
  if (error) throw new Error(error.message)

  return data.signedUrl
}

export const getSignedUploadUrl = async (file: File) => {
  const res = await fetch('/api/leagueFiles/signedUrl', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error('Failed to get signed upload url')
  const data = await res.json()
  return data.signedUrl
}

export default supabase
