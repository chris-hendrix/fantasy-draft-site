import { createRequest, RequestMethod } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import prisma from '../src/lib/prisma'

export const TEST_EMAIL_DOMAIN = 'test.com'

type CreateNextRequest = {
  method?: RequestMethod | undefined
  body?: any | undefined
  searchParams?: { [key: string]: string | number } | undefined
}

const defaultOptions = {
  method: 'GET' as RequestMethod,
  body: undefined,
  searchParams: undefined
}

export const createNextRequest = (options: CreateNextRequest = defaultOptions) => {
  const { method, body, searchParams } = options
  const req: any = createRequest({ method })
  req.consumedBody = { ...body }
  req.headers = { 'content-type': '', ...req.headers }
  req.nextUrl = {
    searchParams: new URLSearchParams(
      Object.entries(searchParams || {}).map(([key, value]) => [key, value.toString()])
    )
  }
  return req as NextRequest
}

export const generateUserBody = (fields:any = {}) => {
  const datetime = new Date().getTime()
  const uniqueKey = `${datetime}-${Math.floor(Math.random() * 1000)}`
  return {
    name: `Patch Adams ${uniqueKey}`,
    username: `patch-adams-${uniqueKey}`,
    email: `patch-adams-${uniqueKey}@${TEST_EMAIL_DOMAIN}`,
    password: 'Abcd1234!',
    ...fields
  }
}

export const deleteTestUsers = async () => prisma.user.deleteMany({
  where: { username: { endsWith: `@${TEST_EMAIL_DOMAIN}` } }
})
