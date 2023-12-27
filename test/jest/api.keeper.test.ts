import { GET as getKeepers, } from '@/app/api/keepers/route'
import { PUT as putKeepers } from '@/app/api/keepers/[id]/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { createDraft, createDraftPick, createKeeper, createLeague, createPlayer, createTeam } from '../factories'

jest.mock('next-auth')

describe('/api/keepers', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('keepers can be retrieved', async () => {
    await createDraftPick()
    const req = createNextRequest()
    const res = await getKeepers(req)
    expect(res.status).toBe(200)
  })

  test('commissioner can update keeper', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const team = await createTeam({ leagueId: league.id })
    const keeper = await createKeeper({ draftId: draft.id, teamId: team.id })
    const player = await createPlayer({ draftId: draft.id })

    const body = { playerId: player.id, round: 1 }
    const req = createNextRequest({ method: 'PUT', body })
    const res = await putKeepers(req, { params: { id: keeper?.id as string } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining(body))
  })

  test('non-commissioner cannot update draft pick', async () => {
    await createGetServerSessionMock()
    const keeper = await createKeeper()
    const player = await createPlayer()
    const req = createNextRequest({ method: 'PUT', body: { playerId: player.id } })
    const res = await putKeepers(req, { params: { id: keeper?.id as string } })
    expect(res.status).toBe(401)
  })

  // TODO own team can update draft pick
})
