import { GET as getDraftPicks, } from '@/app/api/draftPicks/route'
import { PUT as putDraftPick } from '@/app/api/draftPicks/[id]/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { createDraft, createDraftPick, createLeague, createPlayer } from '../factories'

jest.mock('next-auth')

describe('/api/draftPicks', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('draft picks can be retrieved', async () => {
    await createDraftPick()
    const req = createNextRequest()
    const res = await getDraftPicks(req)
    expect(res.status).toBe(200)
  })

  test('commissioner can update draft pick', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const draftPick = await createDraftPick({ draftId: draft.id })
    const player = await createPlayer()
    const req = createNextRequest({ method: 'PUT', body: { playerId: player.id } })
    const res = await putDraftPick(req, { params: { id: draftPick?.id as string } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ playerId: player.id }))
  })

  test('non-commissioner cannot update draft pick', async () => {
    await createGetServerSessionMock()
    const draftPick = await createDraftPick()
    const player = await createPlayer()
    const req = createNextRequest({ method: 'PUT', body: { playerId: player.id } })
    const res = await putDraftPick(req, { params: { id: draftPick?.id as string } })
    expect(res.status).toBe(401)
  })

  // TODO own team can update draft pick
})
