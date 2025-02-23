import { createClient } from '@supabase/supabase-js'
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_BUCKET
} from '@/config'

const createSupabaseClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const getSupabaseClient = () => {
  if (process.env.NODE_ENV === 'production') return createSupabaseClient()
  if (!global.supabase) global.supabase = createSupabaseClient()
  return global.supabase
}

const supabase = getSupabaseClient()

export const uploadPublicFile = async (file: File, directory: string) => {
  if (!supabase) throw new Error('Supabase client not running')
  const bucket = PUBLIC_SUPABASE_BUCKET
  const storageApi = supabase.storage.from(bucket)
  const path = `${directory}/${file.name}`

  // upload new file
  const { data, error: uploadError } = await storageApi.upload(path, file, {
    contentType: file.type, upsert: true
  })
  if (uploadError) throw new Error(uploadError.message)

  return {
    path: data.path,
    publicUrl: storageApi.getPublicUrl(path).data.publicUrl,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

export default supabase
