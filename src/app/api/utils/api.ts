/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { NextURL } from 'next/dist/server/web/next-url'
import { parse } from 'qs'

export class ApiError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

const sanitizeBody = (consumedBody: any) => {
  const sanitizedText = '*****'
  const sanitizedBody = { ...consumedBody }
  if ('password' in sanitizedBody) sanitizedBody.password = sanitizedText
  if ('confirmPassword' in sanitizedBody) sanitizedBody.confirmPassword = sanitizedText
  if ('currentPassword' in sanitizedBody) sanitizedBody.currentPassword = sanitizedText
  return sanitizedBody
}

const logRequest = (req: NextRequest) => {
  if (process.env.NODE_ENV === 'test') return
  const { method, url, consumedBody } = req
  console.info('---')
  method && console.info(`Method: ${method}`)
  url && console.info(`Path:   ${url}`)
  consumedBody && console.info(`Body:   ${JSON.stringify(sanitizeBody(consumedBody))}`)
  console.info('---')
}

const logError = (error: any) => {
  if (process.env.NODE_ENV === 'test' && error?.statusCode !== 500) return
  console.info(`Error:  ${JSON.stringify(error)}`)
  console.info('---')
}

export const routeWrapper = (
  routeHandler: (
    req: NextRequest, context?: any) => Promise<NextResponse>
) => async (req: NextRequest, context?: any) => {
  const setConsumedBody = async () => {
    const contentType = (typeof req.headers?.get === 'function') && req.headers.get('content-type')?.toLowerCase()
    if (contentType === 'application/json') req.consumedBody = await req?.json()
    if (contentType === 'multipart/form-data') req.consumedBody = await req?.formData()
  }
  try {
    await setConsumedBody()
    logRequest(req)
    const result = await routeHandler(req, context)
    return result
  } catch (error: any) {
    const response = {
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      message: error?.message || 'Server failure',
      statusCode: error?.statusCode || 500,
    }
    logError(response)
    return NextResponse.json(response, { status: error.statusCode })
  }
}

export const withSessionUser = async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw new ApiError('Unauthorized', 401)
  return session?.user
}

export const checkUserMatchesSession = async (userId: string | undefined) => {
  const session = await getServerSession(authOptions)
  if (session?.user?.id !== userId) throw new ApiError('Unauthorized', 401)
}

export const getParsedParams = (nextUrl: NextURL) => {
  const convertValues = (obj: any) => {
    const result = { ...obj }
    Object.entries(result).forEach(([key, value]) => {
      const trimmedKey = key.replace(/^\[|\]$/g, '') // Remove start and end brackets from the key
      if (Array.isArray(value)) {
        result[trimmedKey] = value.map((item) => convertValues(item))
      } else if (typeof value === 'object' && value !== null) {
        result[trimmedKey] = convertValues(value)
      } else if (typeof value === 'string') {
        if (!Number.isNaN(Number(value))) {
          result[trimmedKey] = parseFloat(value)
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          result[trimmedKey] = value.toLowerCase() === 'true'
        } else if (value === '') {
          result[trimmedKey] = null
        }
      }
      if (trimmedKey !== key) {
        delete result[key]
      }
    })
    return result
  }
  const searchParams: any = nextUrl.searchParams.toString()
  const findManyParams: any = parse(searchParams)
  return convertValues(findManyParams)
}
