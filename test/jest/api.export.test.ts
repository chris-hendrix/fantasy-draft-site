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

  test('commissioner can retrieve CSV data', async () => {
    const { league, commissioner } = seedData
    await createGetServerSessionMock(commissioner.id)
    const req = createNextRequest({
      method: 'POST',
      body: { leagueId: league.id },
    })
    const res = await postExport(req)
    expect(res.status).toBe(200)
    const csv = await res.text()

    expect(csv.split('\n').length).toBeGreaterThan(2)

    const expectedColumns = ['year', 'overall', 'team', 'player']
    const csvHeaders = csv.split('\n')[0]
    expectedColumns.forEach((column) => {
      expect(csvHeaders).toContain(column)
    })
  })

  test('non-commissioner cannot retrieve CSV data', async () => {
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
