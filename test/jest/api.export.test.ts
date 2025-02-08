import { POST as postExport } from '../../src/app/api/export/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { generateSeedData } from '../../prisma/utils'

jest.mock('next-auth')

describe('/api/export', () => {
  let seedData: any = {}
  beforeAll(async () => {
    seedData = await generateSeedData()
  })

  test('commissioner can retrieve zip file with CSV data', async () => {
    const { league, commissioner } = seedData
    await createGetServerSessionMock(commissioner.id)
    const req = createNextRequest({
      method: 'POST',
      body: { leagueId: league.id },
    })
    const res = await postExport(req)

    // expect zip file to have 3 >1000 byte files
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/zip')
    const body = await res.arrayBuffer()
    expect(body.byteLength).toBeGreaterThan(3 * 3000)
  })

  test('non-commissioner cannot retrieve zip file with CSV data', async () => {
    const { league } = seedData
    await createGetServerSessionMock()
    const req = createNextRequest({
      method: 'POST',
      body: { leagueId: league.id },
    })
    const res = await postExport(req)
    expect(res.status).toBe(401)
  })
})
