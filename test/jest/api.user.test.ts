import prisma from '@/lib/prisma'
import { GET as getUsers, POST as postUser } from '@/app/api/users/route'
import { POST as postPasswordReset } from '@/app/api/auth/password-reset/route'
import { PUT as putUser } from '@/app/api/users/[id]/route'
import { createNextRequest, generateUserBody, deleteTestUsers } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { validatePassword } from '../../src/app/api/utils/hash'

jest.mock('next-auth')

describe('/api/users', () => {
  afterAll(async () => {
    await deleteTestUsers()
  })

  test('users can be retrieved', async () => {
    const req = createNextRequest()
    const res = await getUsers(req)
    expect(res.status).toBe(200)
  })

  test('user can signup with email and password', async () => {
    const body = generateUserBody()
    const req = createNextRequest({ method: 'POST', body })
    const res = await postUser(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(
      expect.objectContaining({ email: body.email }),
    )
  })

  test('user can edit same user', async () => {
    const user = await createGetServerSessionMock()
    const body = { username: generateUserBody().username }
    const req = createNextRequest({ method: 'PUT', body })
    const res = await putUser(req, { params: { id: user.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(
      expect.objectContaining({ username: body.username }),
    )
  })

  test('user cannot edit different user', async () => {
    await createGetServerSessionMock()
    const body = { name: 'Put Adams' }
    const otherUser = await prisma.user.create({
      data: generateUserBody()
    })
    const req = createNextRequest({ method: 'PUT', body })
    const res = await putUser(req, { params: { id: otherUser.id } })
    expect(res.status).toBe(401)
  })

  test('user cannot edit illegal fields', async () => {
    const user = await createGetServerSessionMock()
    const body = { admin: true }
    const req = createNextRequest({ method: 'PUT', body })
    const res = await putUser(req, { params: { id: user.id } })
    expect(res.status).toBe(400)
  })

  test('user can change password', async () => {
    const user = await createGetServerSessionMock()
    const body = { currentPassword: 'Abcd1234!', password: 'Abcd1234!!!', confirmPassword: 'Abcd1234!!!' }
    const req = createNextRequest({ method: 'PUT', body })
    const res = await putUser(req, { params: { id: user.id } })
    expect(res.status).toBe(200)
  })

  test('admin can reset user password', async () => {
    const userBody = generateUserBody()
    const user = await prisma.user.create({ data: userBody })
    const admin = await prisma.user.create({
      data: generateUserBody({ admin: true, name: 'Admin' })
    })
    await createGetServerSessionMock(admin.id)

    const req = createNextRequest({ method: 'POST', body: { userId: user.id } })
    const res = await postPasswordReset(req)
    expect(res.status).toBe(200)

    // expect response to contain new password
    const data = await res.json()
    expect(data).toEqual(
      expect.objectContaining({ password: expect.any(String) }),
    )
    // expect new password to work
    const { password: hash } = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(await validatePassword(data.password, hash!)).toBe(true)
  })

  test('non-admin cannot reset user password', async () => {
    const user = await prisma.user.create({
      data: generateUserBody()
    })
    await createGetServerSessionMock()

    const req = createNextRequest({ method: 'POST', body: { userId: user.id } })
    const res = await postPasswordReset(req)
    expect(res.status).toBe(401)
  })
})
