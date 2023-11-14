import { GET as getLeagues, POST as postLeague } from '@/app/api/leagues/route'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'

jest.mock('next-auth')

describe('/api/leagues', () => {
  afterAll(async () => {
    // await deleteTestUsers()
  })

  test('user create league', async () => {
    const user = await createGetServerSessionMock()
    const body = {
      name: `League ${new Date().getTime()}`,
      commissionerId: user.id
    }
    const req = createNextRequest({ method: 'POST', body })
    const res = await postLeague(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual(
      expect.objectContaining({ name: body.name }),
    )
  })

  test('leagues can be retrieved', async () => {
    const req = createNextRequest()
    const res = await getLeagues(req)
    expect(res.status).toBe(200)
  })
})
