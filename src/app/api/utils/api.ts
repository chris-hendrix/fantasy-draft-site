/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/lib/auth'
import { NextURL } from 'next/dist/server/web/next-url'
import { parse } from 'qs'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
// @ts-ignore
import QueryTypes from 'query-types'

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
    return NextResponse.json({ error: response }, { status: error.statusCode })
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
  const searchParams: any = nextUrl.searchParams.toString()
  const paramObject: any = parse(searchParams)
  return QueryTypes.parseObject(paramObject)
}

export const sanitizeUserSelect = () => {
  const fields = Object.keys(Prisma.UserScalarFieldEnum)
  return Object.fromEntries(fields.map((k) => [k, k !== 'password']))
}

export const checkUserBody = async (body: any, id: string | null = null) => {
  const usernameExists = async (username: string) => {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!id) return Boolean(user)
    return Boolean(user && user.id !== id)
  }
  const emailExists = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!id) return Boolean(user)
    return Boolean(user && user.id !== id)
  }

  const hasIllegalFields = () => {
    // TODO probably a better way to do this
    const legalFields = ['email', 'username', 'name', 'image', 'bucketImage', 'info', 'password']
    const illegalFields = Object.keys(body).filter((field) => !legalFields.includes(field))
    return illegalFields.length > 0
  }

  if (!body) throw new ApiError('Request must have body', 400)
  const { username, email } = body
  if (username && await usernameExists(username)) throw new ApiError('Username exists', 400)
  if (email && await emailExists(email)) throw new ApiError('Email exists', 400)
  if (hasIllegalFields()) throw new ApiError('Illegal fields in body', 400)
}
