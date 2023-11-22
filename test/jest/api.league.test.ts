import { GET as getLeagues, POST as postLeague } from '@/app/api/leagues/route'
import { GET as getLeague, PUT as putLeague, DELETE as deleteLeague } from '@/app/api/leagues/[id]/route'
import prisma from '@/lib/prisma'
import { Sport } from '@prisma/client'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'

jest.mock('next-auth')

const getLeagueBody: () => { name: string; sport: Sport } = () => ({
  name: `League ${new Date().getTime()}`,
  sport: 'baseball'
})

describe('/api/leagues', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('user create league', async () => {
    const user = await createGetServerSessionMock()
    const body = getLeagueBody()
    const req = createNextRequest({ method: 'POST', body })
    const res = await postLeague(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data?.league).toEqual(expect.objectContaining({ name: body.name }))
    expect(data?.commissioner).toEqual(expect.objectContaining({ userId: user.id }))
  })

  test('leagues can be retrieved', async () => {
    const req = createNextRequest()
    const res = await getLeagues(req)
    expect(res.status).toBe(200)
  })

  test('league can be retrieved by id', async () => {
    const league = await prisma.league.create({ data: { ...getLeagueBody() } })
    const req = createNextRequest()
    const res = await getLeague(req, { params: { id: league.id } })
    expect(res.status).toBe(200)
  })

  test('commissioner can update league', async () => {
    const user = await createGetServerSessionMock()
    const league = await prisma.league.create({
      data: {
        ...getLeagueBody(),
        commissioners: { create: [{ userId: user.id }] }
      }
    })
    const name = `Updated League ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name } })
    const res = await putLeague(req, { params: { id: league.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ name }))
  })

  test('user can not update different league', async () => {
    await createGetServerSessionMock()
    const league = await prisma.league.create({ data: { ...getLeagueBody() } })
    const name = `Updated League ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name } })
    const res = await putLeague(req, { params: { id: league.id } })
    expect(res.status).toBe(401)
  })

  test('commissioner can delete league', async () => {
    const user = await createGetServerSessionMock()
    const league = await prisma.league.create({
      data: {
        ...getLeagueBody(),
        commissioners: { create: [{ userId: user.id }] }
      }
    })
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deleteLeague(req, { params: { id: league.id } })
    expect(res.status).toBe(200)

    const foundLeague = await prisma.league.findFirst({ where: { id: league.id } })
    expect(foundLeague).toBeNull()
  })

  test('non commissioner can not delete league', async () => {
    await createGetServerSessionMock()
    const league = await prisma.league.create({ data: { ...getLeagueBody() } })
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deleteLeague(req, { params: { id: league.id } })
    expect(res.status).toBe(401)

    const foundLeague = await prisma.league.findFirst({ where: { id: league.id } })
    expect(foundLeague).not.toBe(null)
  })
})
