import { GET as getLeagueFiles, POST as postLeagueFile } from '@/app/api/leagueFiles/route'
import { POST as postLeagueFileSignedUrl } from '@/app/api/leagueFiles/signedUrl/route'
import prisma from '@/lib/prisma'
import { PUT as putLeagueFile, DELETE as deleteLeagueFile } from '@/app/api/leagueFiles/[id]/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { getSignedUploadUrl, getSignedDownloadUrl, deleteObject } from '../../src/app/api/utils/supabase'
import { generateSeedData, SeedData } from '../../prisma/utils'

jest.mock('next-auth')
jest.mock('../../src/app/api/utils/supabase', () => ({
  getSignedUploadUrl: jest.fn(),
  getSignedDownloadUrl: jest.fn(),
  deleteObject: jest.fn()
}))
const getSignedUploadUrlMock = getSignedUploadUrl as jest.Mock
const getSignedDownloadUrlMock = getSignedDownloadUrl as jest.Mock
const deleteObjectMock = deleteObject as jest.Mock

describe('/api/leagueFiles', () => {
  let seedData: SeedData = {} as SeedData
  let getLeagueFileBody: () => any
  let createLeagueFile: () => any

  beforeAll(async () => {
    seedData = await generateSeedData()
    const { league, commissioner } = seedData
    getLeagueFileBody = () => ({
      leagueId: league.id,
      name: `League File ${new Date().getTime()}`,
      category: 'keepers',
      type: 'application/json',
      size: 1000,
      bucketPath: `leagues/${league.id}/file.json`
    })
    createLeagueFile = async () => {
      const file = await prisma.file.create({
        data: {
          userId: commissioner.id,
          name: 'League File',
          bucketPath: `leagues/${league.id}/file.json`,
          type: 'application/json',
          size: 1000,
        }
      })
      return prisma.leagueFile.create({
        data: {
          leagueId: league.id,
          category: 'keepers',
          fileId: file.id
        }
      })
    }
  })

  test('commissioner can retrieve an upload signed url', async () => {
    const { commissioner, league } = seedData
    await createGetServerSessionMock(commissioner.id)
    const signedUrl = 'https://example.com/signed-url'
    getSignedUploadUrlMock.mockResolvedValue({ signedUrl })
    const req = createNextRequest({ method: 'POST',
      body: {
        leagueId: league.id,
        isUpload: true,
        bucketPath: `leagues/${league.id}/file.json`
      } })
    const res = await postLeagueFileSignedUrl(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ signedUrl }))
  })

  test('non-commissioner cannot retrieve an upload signed url', async () => {
    const { league } = seedData
    await createGetServerSessionMock()
    const req = createNextRequest({ method: 'POST',
      body: {
        leagueId: league.id,
        isUpload: true,
        bucketPath: `leagues/${league.id}/file.json`
      } })
    const res = await postLeagueFileSignedUrl(req)
    expect(res.status).toBe(401)
  })

  test('non-league user cannot retrieve a download signed url', async () => {
    await createGetServerSessionMock()
    const leagueFile = await createLeagueFile()
    const req = createNextRequest({ method: 'POST',
      body: {
        leagueId: leagueFile.leagueId,
        leagueFileId: leagueFile.id
      } })
    const res = await postLeagueFileSignedUrl(req)
    expect(res.status).toBe(401)
  })

  test('league user can retrieve a download signed url', async () => {
    const { teams, league } = seedData
    const userId = teams[0].teamUsers[0].userId as string
    await createGetServerSessionMock(userId)
    const leagueFile = await createLeagueFile()
    const signedUrl = 'https://example.com/signed-url'
    getSignedDownloadUrlMock.mockResolvedValue({ signedUrl })
    const req = createNextRequest({ method: 'POST',
      body: {
        leagueId: league.id,
        leagueFileId: leagueFile.id

      } })
    const res = await postLeagueFileSignedUrl(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ signedUrl }))
  })

  test('commissioner can create a league file', async () => {
    const { commissioner } = seedData
    await createGetServerSessionMock(commissioner.id)
    const req = createNextRequest({ method: 'POST', body: getLeagueFileBody() })
    const res = await postLeagueFile(req)
    expect(res.status).toBe(200)
  })

  test('non-commissioner cannot create a league file', async () => {
    const { users, commissioner } = seedData
    const user = users.find((u) => u.id !== commissioner.id)
    await createGetServerSessionMock(user!.id)
    const req = createNextRequest({ method: 'POST', body: getLeagueFileBody() })
    const res = await postLeagueFile(req)
    expect(res.status).toBe(401)
  })

  test('league user can retrieve league files', async () => {
    const { teams } = seedData
    const userId = teams[0].teamUsers[0].userId as string
    await createGetServerSessionMock(userId)
    const req = createNextRequest()
    const res = await getLeagueFiles(req)
    expect(res.status).toBe(200)
  })

  test('commissioner can update and delete a league file', async () => {
    const { commissioner } = seedData
    await createGetServerSessionMock(commissioner.id)
    const leagueFile = await createLeagueFile()
    const req = createNextRequest({ method: 'PUT', body: { category: 'other' } })
    const res = await putLeagueFile(req, { params: { id: leagueFile.id } })
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(expect.objectContaining({ category: 'other' }))

    deleteObjectMock.mockResolvedValue({ id: leagueFile.id })
    const deleteReq = createNextRequest({ method: 'DELETE' })
    const deleteRes = await deleteLeagueFile(deleteReq, { params: { id: leagueFile.id } })
    expect(deleteRes.status).toBe(200)
  })

  test('non-commissioner cannot update or delete a league file', async () => {
    const { users, commissioner } = seedData
    const user = users.find((u) => u.id !== commissioner.id)
    await createGetServerSessionMock(user!.id)
    const leagueFile = await createLeagueFile()
    const req = createNextRequest({ method: 'PUT', body: { category: 'other' } })
    const res = await putLeagueFile(req, { params: { id: leagueFile.id } })
    expect(res.status).toBe(401)

    deleteObjectMock.mockResolvedValue({ id: leagueFile.id })
    const deleteReq = createNextRequest({ method: 'DELETE' })
    const deleteRes = await deleteLeagueFile(deleteReq, { params: { id: leagueFile.id } })
    expect(deleteRes.status).toBe(401)
  })
})
