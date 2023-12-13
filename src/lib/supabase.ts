import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET } from '@/config'

const createSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

const getSupabaseClient = () => {
  if (process.env.NODE_ENV === 'production') return createSupabaseClient()
  if (!global.supabase) global.supabase = createSupabaseClient()
  return global.supabase
}

const supabase = getSupabaseClient()

export const uploadFile = async (file: File, directory: string) => {
  if (!supabase) throw new Error('Supabase client not running')
  const storageApi = supabase.storage.from(SUPABASE_BUCKET)
  const path = `${directory}/${file.name}`

  // clear existing files
  const { data: list, error: listError } = await storageApi.list(`${directory}/`)
  if (listError) throw new Error(listError.message)
  if (list?.length) {
    const { error: removeError } = await storageApi.remove(list?.map((f) => `${directory}/${f.name}`) || [])
    if (removeError) throw new Error(removeError.message)
  }

  // upload new file
  const { error: uploadError } = await storageApi.upload(path, file, {
    contentType: file.type, upsert: true
  })
  if (uploadError) throw new Error(uploadError.message)

  // get public url
  const { data: { publicUrl } } = await storageApi.getPublicUrl(path)
  return publicUrl
}

export default supabase
