import { GET as getDrafts, POST as postDraft } from '@/app/api/drafts/route'
import prisma from '@/lib/prisma'
import { GET as getDraft, PUT as putDraft, DELETE as deleteDraft } from '@/app/api/drafts/[id]/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { createDraft, createLeague } from '../factories'

jest.mock('next-auth')

describe('/api/drafts', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('commissioner can create draft', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const body = { leagueId: league.id, year: 2010, rounds: 22 }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postDraft(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ leagueId: body.leagueId }))
  })

  test('non-commissioner cannot create draft', async () => {
    await createGetServerSessionMock()
    const league = await createLeague()
    const body = { leagueId: league.id, year: 2024 }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postDraft(req)
    expect(res.status).toBe(401)
  })

  test('drafts can be retrieved', async () => {
    const req = createNextRequest()
    const res = await getDrafts(req)
    expect(res.status).toBe(200)
  })

  test('draft can be retrieved by id', async () => {
    const draft = await createDraft()
    const req = createNextRequest()
    const res = await getDraft(req, { params: { id: draft.id } })
    expect(res.status).toBe(200)
  })

  test('commissioner can update draft', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const updatedYear = 2010
    const req = createNextRequest({ method: 'PUT', body: { year: updatedYear } })
    const res = await putDraft(req, { params: { id: draft.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ year: updatedYear }))
  })

  test('non-commissioner cannot update draft', async () => {
    await createGetServerSessionMock()
    const draft = await createDraft()
    const updatedYear = 2010
    const req = createNextRequest({ method: 'PUT', body: { year: updatedYear } })
    const res = await putDraft(req, { params: { id: draft.id } })
    expect(res.status).toBe(401)
  })

  test('commissioner can delete draft', async () => {
    const user = await createGetServerSessionMock()
    const league = await createLeague({ commissioners: { create: [{ userId: user.id }] } })
    const draft = await createDraft({ leagueId: league.id })
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deleteDraft(req, { params: { id: draft.id } })
    expect(res.status).toBe(200)

    const foundDraft = await prisma.draft.findFirst({ where: { id: draft.id } })
    expect(foundDraft).toBeNull()
  })

  test('non commissioner can not delete draft', async () => {
    await createGetServerSessionMock()
    const draft = await createDraft()
    const req = createNextRequest({ method: 'DELETE' })
    const res = await deleteDraft(req, { params: { id: draft.id } })
    expect(res.status).toBe(401)

    const foundDraft = await prisma.draft.findFirst({ where: { id: draft.id } })
    expect(foundDraft).not.toBe(null)
  })
})
