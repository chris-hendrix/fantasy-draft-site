import { SupabaseClient } from '@supabase/supabase-js'
import { ApiError } from '@/app/api/utils/api'

import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} from '@/config'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  'x-upsert': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
})

// https://supabase.github.io/storage/#/object/post_object_upload_sign__bucketName___wildcard_
export const requestSignedUploadUrl = async (bucket: string, filePath: string) => {
  const url = `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${filePath}`
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({}),
    mode: 'cors'
  })

  if (!response.ok) {
    throw new Error(`Error requesting signed upload URL: ${response.statusText}`)
  }

  const data = await response.json()
  const signedUrl = `${SUPABASE_URL}/${data.url}`
  return { signedUrl }
}

// https://supabase.github.io/storage/#/object/post_object_sign__bucketName___wildcard_
export const requestSignedDownloadUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = 60
) => {
  const url = `${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${filePath}`
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ expiresIn })
  })

  if (!response.ok) {
    throw new Error(`Error requesting signed download URL: ${response.statusText}`)
  }

  const data = await response.json()
  return { signedUrl: data.signedURL }
}

export const getSignedUploadUrl = async (bucket: string, filePath: string) => {
  const client = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const storageApi = client.storage.from(bucket)
  const data = await storageApi.createSignedUploadUrl(filePath, { upsert: true })

  if (data.error) {
    throw new ApiError(data.error.message, 500)
  }

  return { signedUrl: data.data?.signedUrl }
}

export const getSignedDownloadUrl = async (bucket: string, filePath: string) => {
  const client = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const storageApi = client.storage.from(bucket)
  const data = await storageApi.createSignedUrl(filePath, 60)

  if (data.error) {
    throw new ApiError(data.error.message, 500)
  }

  return { signedUrl: data.data?.signedUrl }
}
