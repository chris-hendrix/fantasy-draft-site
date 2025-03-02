import { GET as getPlayers, POST as postPlayer } from '@/app/api/players/route'
import prisma from '@/lib/prisma'
import { GET as getPlayer, PUT as putPlayer, DELETE as deletePlayer } from '@/app/api/players/[id]/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { createDraft, createLeague, createPlayer } from '../factories'

jest.mock('next-auth')

const getPlayerBody: () => { name: string } = () => ({
  name: `Player ${new Date().getTime()}`,
})

describe('/api/players', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('commissioner can create a player', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const body = { draftId: draft.id, ...getPlayerBody() }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postPlayer(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ ...body }))
  })

  test('non-commissioner cannot create player', async () => {
    await createGetServerSessionMock()
    const league = await createLeague()
    const draft = await createDraft({ leagueId: league.id })
    const body = { draftId: draft.id, ...getPlayerBody() }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postPlayer(req)
    expect(res.status).toBe(401)
  })

  test('players can be retrieved', async () => {
    const league = await createLeague()
    const draft = await createDraft({ leagueId: league.id })
    const req = createNextRequest({
      method: 'GET',
      searchParams: { 'where[draftId]': draft.id }
    })
    const res = await getPlayers(req)
    expect(res.status).toBe(200)
  })

  test('player can be retrieved by id', async () => {
    const player = await createPlayer()
    const req = createNextRequest()
    const res = await getPlayer(req, { params: { id: player.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ name: player.name }))
  })

  test('commissioner can update player', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const player = await createPlayer({ draftId: draft.id })
    const updatedName = `Updated Name ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name: updatedName } })
    const res = await putPlayer(req, { params: { id: player.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test('non-commissioner cannot update player', async () => {
    await createGetServerSessionMock()
    const player = await createPlayer()
    const updatedName = `Updated Name ${new Date().getTime()}`
    const req = createNextRequest({ method: 'PUT', body: { name: updatedName } })
    const res = await putPlayer(req, { params: { id: player.id } })
    expect(res.status).toBe(401)
  })

  test('commissioner can delete player', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const player = await createPlayer({ draftId: draft.id })
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deletePlayer(req, { params: { id: player.id } })
    expect(res.status).toBe(200)

    const foundPlayer = await prisma.player.findFirst({ where: { id: player.id } })
    expect(foundPlayer).toBeNull()
  })

  test('non commissioner cannot delete player', async () => {
    await createGetServerSessionMock()
    const player = await createPlayer()
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deletePlayer(req, { params: { id: player.id } })
    expect(res.status).toBe(401)

    const foundPlayer = await prisma.player.findFirst({ where: { id: player.id } })
    expect(foundPlayer).not.toBe(null)
  })
})
