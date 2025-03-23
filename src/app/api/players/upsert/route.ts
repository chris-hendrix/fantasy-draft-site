import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper, ApiError } from '@/app/api/utils/api'
import { PlayerData } from '@/types'
import { Prisma, PrismaPromise } from '@prisma/client'
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
  type ResultItems = { [key: string]: string }[]
  type Results = { created: ResultItems, updated: ResultItems, deleted: ResultItems }
  const results: Results = { created: [], updated: [], deleted: [] }

  const existingPlayers = await prisma.player.findMany({
    where: { draftId },
    select: { name: true, id: true },
  })

  // get transaction types
  type PlayerUpdate = PrismaPromise<Prisma.PromiseReturnType<typeof prisma.player.update>>
  type PlayerCreate = PrismaPromise<Prisma.PromiseReturnType<typeof prisma.player.create>>
  type PlayerDelete = PrismaPromise<Prisma.PromiseReturnType<typeof prisma.player.delete>>

  const createTransactions: PlayerCreate[] = []

  // update and/or delete existing players
  if (!overwrite) {
    const updateTransactions: PlayerUpdate[] = []
    const deleteTransactions: PlayerDelete[] = []

    existingPlayers.forEach((p) => {
      // pop matching playerData if it exists
      const match = playerData.find((pd) => pd.name === p.name)

      if (match) {
        updateTransactions.push(prisma.player.update({
          where: { id: p.id },
          data: match,
        }))
        // remove from playerData to avoid creating it again
        playerData.splice(playerData.indexOf(match), 1)
      } else if (!overwrite) {
        deleteTransactions.push(prisma.player.delete({ where: { id: p.id } }))
      }
    })
    const updatedPlayers = await prisma.$transaction(updateTransactions)
    const deletedPlayers = await prisma.$transaction(deleteTransactions)
    results.updated.push(...updatedPlayers.map((p) => ({ [p.id]: p.name })))
    results.deleted.push(...deletedPlayers.map((p) => ({ [p.id]: p.name })))
  } else {
    await prisma.player.deleteMany({ where: { draftId } })
    results.deleted.push(...existingPlayers.map((p) => ({ [p.id]: p.name })))
  }

  // create new players
  playerData.forEach((pd) => {
    createTransactions.push(prisma.player.create({
      data: { draftId, name: pd.name, data: pd.data },
    }))
  })
  const createdPlayers = await prisma.$transaction(createTransactions)
  results.created.push(...createdPlayers.map((p) => ({ [p.id]: p.name })))

  return NextResponse.json(results)
})
