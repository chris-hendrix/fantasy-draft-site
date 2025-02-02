import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { generateUserBody } from '../utils'
import { generateHash } from '../../src/app/api/utils/hash'

jest.mock('next-auth') // must be imported in test file as well

export const createGetServerSessionMock = async (userId?: string) => {
  const body = generateUserBody()
  const hash = await generateHash(body.password)
  const user = userId ?
    await prisma.user.findFirstOrThrow({ where: { id: userId } }) :
    await prisma.user.create({ data: { ...body, password: hash } })
  const mockGetServerSession = getServerSession as jest.Mock
  mockGetServerSession.mockReturnValueOnce(Promise.resolve({
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user
  }))
  return user
}

export default createGetServerSessionMock
