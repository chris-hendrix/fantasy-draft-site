import { GET as getLeagues, POST as postLeague } from '@/app/api/leagues/route'
import { GET as getLeague } from '@/app/api/users/[id]/route'
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
})
