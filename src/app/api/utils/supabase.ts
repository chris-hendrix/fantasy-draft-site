import { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from '@/app/api/utils/api'

import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  PRIVATE_SUPABASE_BUCKET,
} from '@/config'

export const getSignedUploadUrl = async (filePath: string) => {
  const client = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const storageApi = client.storage.from(PRIVATE_SUPABASE_BUCKET)
  const data = await storageApi.createSignedUploadUrl(filePath, { upsert: true })

  if (data.error) {
    throw new ApiError(data.error.message, 500)
  }

  return { signedUrl: data.data?.signedUrl }
}

export const getSignedDownloadUrl = async (filePath: string) => {
  const client = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const storageApi = client.storage.from(PRIVATE_SUPABASE_BUCKET)
  const data = await storageApi.createSignedUrl(filePath, 60)

  if (data.error) {
    throw new ApiError(data.error.message, 500)
  }

  return { signedUrl: data.data?.signedUrl }
}

export const deleteObject = async (filePath: string) => {
  const client = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const storageApi = client.storage.from(PRIVATE_SUPABASE_BUCKET)
  const data = await storageApi.remove([filePath])
  if (data.error) {
    throw new ApiError(data.error.message, 500)
  }
  return data
}
