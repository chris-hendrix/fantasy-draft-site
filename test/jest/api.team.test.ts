import { GET as getTeams, POST as postTeam } from '@/app/api/teams/route'
import { GET as getTeam, PUT as putTeam, DELETE as deleteTeam } from '@/app/api/teams/[id]/route'
import prisma from '@/lib/prisma'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { createLeague, createTeam } from '../factories'

jest.mock('next-auth')

describe('/api/teams', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('user create team', async () => {
    await createGetServerSessionMock()
    const league = await createLeague()
    const body = { name: `Team ${new Date().getTime()}`, leagueId: league.id }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postTeam(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ name: body.name }))
    expect(data).toEqual(expect.objectContaining({ leagueId: league.id }))
  })

  test('teams can be retrieved', async () => {
    const req = createNextRequest()
    const res = await getTeams(req)
    expect(res.status).toBe(200)
  })

  test('team can be retrieved by id', async () => {
    const team = await createTeam()
    const req = createNextRequest()
    const res = await getTeam(req, { params: { id: team.id } })
    expect(res.status).toBe(200)
  })

  test('team user can update team', async () => {
    const user = await createGetServerSessionMock()
    const team = await createTeam({ teamUsers: { create: [{ userId: user.id }] } })
    const updatedName = `Updated Team ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name: updatedName } })
    const res = await putTeam(req, { params: { id: team.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test('team user cannot update different team', async () => {
    await createGetServerSessionMock()
    const otherTeam = await createTeam()
    const updatedName = `Updated Team ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name: updatedName } })
    const res = await putTeam(req, { params: { id: otherTeam.id } })
    expect(res.status).toBe(401)
  })

  test('commissioner can delete league', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const team = await createTeam({ leagueId: league.id })
    const req = await createNextRequest({ method: 'DELETE' })
    const res = await deleteTeam(req, { params: { id: team?.id as string } })
    expect(res.status).toBe(200)

    const foundLeague = await prisma.team.findFirst({ where: { id: team?.id } })
    expect(foundLeague).toBeNull()
  })
})
