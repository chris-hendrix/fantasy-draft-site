import { POST as postPlayerData } from '@/app/api/players/upsert/route'
import prisma from '@/lib/prisma'
import { PlayerData } from '@/types'
import { createNextRequest } from '../utils'
import { createGetServerSessionMock } from './mocks'
import { generateSeedData, generatePlayerData, SeedData } from '../../prisma/utils'

jest.mock('next-auth')

describe('/api/players/upsert', () => {
  let seedData: SeedData | null = null
  let playerData: PlayerData[] = []

  beforeAll(async () => {
    seedData = await generateSeedData()
    playerData = await generatePlayerData()
  })

  test('commissioner overwrite players', async () => {
    const { commissioner, drafts } = seedData!
    const draftId = drafts[0].id
    await createGetServerSessionMock(commissioner.id)
    const req = createNextRequest({
      method: 'POST',
      body: { playerData, overwrite: true, draftId },
    })
    const res = await postPlayerData(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.counts.created).toBe(playerData.length)

    // check db
    const players = await prisma.player.findMany({
      where: { draftId },
      select: { name: true, data: true }
    })
    expect(players.length).toBe(playerData.length)
  })

  test('commissioner can update players', async () => {
    const { commissioner, drafts } = seedData!
    const draftId = drafts[0].id
    await createGetServerSessionMock(commissioner.id)
    const modifiedPlayerData: PlayerData[] = [
      { ...playerData[0], data: { note: 'Update Player' } },
      { name: 'created-player', data: { note: 'Created Player' } }
    ]
    const req = createNextRequest({
      method: 'POST',
      body: { playerData: modifiedPlayerData, overwrite: false, draftId },
    })
    const res = await postPlayerData(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.counts.updated).toBe(1)
    expect(data.counts.created).toBe(1)
    expect(data.counts.deleted).toBeGreaterThan(1)

    // check db
    const players = await prisma.player.findMany({
      where: { draftId },
      select: { name: true, data: true }
    })
    expect(players.length).toBe(2)
    expect(players).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'created-player', data: { note: 'Created Player' } }),
      expect.objectContaining({ name: playerData[0].name, data: { note: 'Update Player' } }),
    ]))
  })

  test('non-commissioner cannot upsert players', async () => {
    const { drafts } = seedData!
    await createGetServerSessionMock()
    const req = createNextRequest({
      method: 'POST',
      body: { playerData, overwrite: true, draftId: drafts[0].id },
    })
    const res = await postPlayerData(req)
    expect(res.status).toBe(401)
  })
})
