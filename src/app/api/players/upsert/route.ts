import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, ApiError } from '@/app/api/utils/api'
import { PlayerData } from '@/types'
import { PrismaPromise } from '@prisma/client'
import { checkDraftCommissioner } from '../../utils/permissions'

export const POST = routeWrapper(async (req: NextRequest) => {
  const data: any = req.consumedBody || {}
  const { draftId, playerData, overwrite } : {
    draftId: string
    playerData: PlayerData[]
    overwrite: boolean
  } = data

  await checkDraftCommissioner(draftId)

  if (!draftId) throw new ApiError('Must have draft id', 400)
  if (!playerData) throw new ApiError('Must have player data', 400)

  // setup results
  const results = {
    counts: {
      created: 0,
      updated: 0,
      deleted: 0
    },
    names: {
      created: [] as string[],
      updated: [] as string[],
      deleted: [] as string[]
    }
  }

  const existingPlayers = await prisma.player.findMany({
    where: { draftId },
    select: { name: true, id: true },
  })

  const transactions: PrismaPromise<any>[] = []

  // update and/or delete existing players
  if (!overwrite) {
    existingPlayers.forEach((p) => {
      // pop matching playerData if it exists
      const match = playerData.find((pd) => pd.name === p.name)

      if (match) {
        transactions.push(prisma.player.update({
          where: { id: p.id },
          data: match,
        }))
        results.names.updated.push(p.name)
        results.counts.updated += 1

        // remove from playerData to avoid creating it again
        playerData.splice(playerData.indexOf(match), 1)
      } else {
        transactions.push(prisma.player.delete({ where: { id: p.id } }))
        results.names.deleted.push(p.name)
        results.counts.deleted += 1
      }
    })
  } else {
    await prisma.player.deleteMany({ where: { draftId } })
    results.names.deleted.push(...existingPlayers.map((p) => (p.name)))
    results.counts.deleted += existingPlayers.length
  }

  // create new players
  playerData.forEach((pd) => {
    transactions.push(prisma.player.create({
      data: { draftId, name: pd.name, data: pd.data },
    }))
    results.names.created.push(pd.name)
    results.counts.created += 1
  })

  // split into batch transactions
  const batchSize = 50
  const batchCount = Math.ceil(transactions.length / batchSize)
  const batchedTransactions: Promise<any>[] = []
  Array.from({ length: batchCount }).forEach((_, i) => {
    const start = i * batchSize
    const end = start + batchSize
    const batch = transactions.slice(start, end)
    batchedTransactions.push(prisma.$transaction(batch))
  })
  await Promise.all(batchedTransactions)

  return NextResponse.json(results)
})
