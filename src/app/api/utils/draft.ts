import prisma from '@/lib/prisma'
import { ApiError } from '@/app/api/utils/api'
import { getRound } from '@/utils/draft'
import { Player } from '@prisma/client'
import { PlayerData, ImportedDraftRecord } from '@/types'
import { getUnique } from '@/utils/array'

export const getAllDraftData = async (draftId: string) => {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      league: { include: { commissioners: true } },
      draftTeams: { include: { team: { include: { teamUsers: true } } } },
      keepers: { include: { player: true, team: true }, orderBy: { round: 'asc' } },
      draftPicks: { include: { player: true, team: true }, orderBy: { overall: 'asc' } },
      players: { include: { draftPicks: { include: { team: true } } } }
    }
  })

  if (!draft) throw new ApiError('Draft not found', 400)

  const previousDraft = await prisma.draft.findFirst({
    where: { leagueId: draft.leagueId, year: draft.year - 1 },
    include: {
      draftTeams: true,
      draftPicks: { include: { team: true, player: true } },
      keepers: { include: { player: true } }
    }
  })

  if (!previousDraft) return draft

  const { draftPicks, draftTeams, keepers } = previousDraft
  const teamsCount = draftTeams.length
  const playerData = draft.players.map((player: Player) => {
    const draftPick = draftPicks.find((dp) => dp.player && dp.player.name === player?.name)
    const keeper = keepers.find((k) => k.player && k.player.name === draftPick?.player?.name)
    const round = draftPick && getRound(draftPick.overall, teamsCount)
    const previousDraftInfo = draftPick && { round, draftPick, keeper }
    return { ...player, previousDraftInfo }
  })

  return { ...draft, players: playerData }
}

export const updateDraftPlayerData = async (draftId: string, playerData: PlayerData[]) => {
  const results: { [key: string]: 'added' | 'updated' } = {}

  await Promise.all(
    playerData.map(async (pd) => {
      const { count } = await prisma.player.updateMany({
        where: { draftId, name: pd.name },
        data: { data: pd.data },
      })

      // add player if no match
      if (count === 0) {
        await prisma.player.create({
          data: { draftId, name: pd.name, data: pd.data }
        })
      }

      results[pd.name] = count === 0 ? 'added' : 'updated'
    })
  )
  return results
}

export const getNextPick = async (draftId: string, overall: number) => {
  const picks = await prisma.draftPick.findMany({
    where: { draftId, overall: { gt: overall }, playerId: null }
  })
  return picks?.[0] || null
}

export const importDraftData = async (leagueId: string, data: ImportedDraftRecord[]) => {
  const years = getUnique<ImportedDraftRecord>(data, (r) => r.draftYear).map((r) => r.draftYear)
  const teams = await prisma.team.findMany({ where: { leagueId } })

  const createDraft = async (year: number) => {
    const draftData = data.filter((r) => r.draftYear === year)
    const draftTeams = getUnique<ImportedDraftRecord>(draftData, (r) => r.teamName)
      .filter((r) => Boolean(teams.find((t) => t.name === r.teamName)))
      .map((r) => teams.find((t) => t.name === r.teamName))
    const draftTeamData = draftTeams.map((t, i) => ({ teamId: String(t?.id), order: i + 1 }))
    const playerData = draftData.map((r) => ({ name: r.playerName, data: r.playerData }))
    const rounds = draftData.length / draftTeams.length

    // delete existing draft
    const existingDraft = await prisma.draft.findFirst({ where: { leagueId, year } })
    if (existingDraft) await prisma.draft.delete({ where: { id: existingDraft.id } })

    // create new draft
    const draft = await prisma.draft.create({
      data: {
        leagueId,
        year,
        rounds,
        keepersLockDate: new Date(),
        draftLockDate: new Date(),
        players: { createMany: { data: playerData } },
        draftTeams: { createMany: { data: draftTeamData } }
      },
      include: { players: true }
    })

    const draftPickData = draftData.map((r) => ({
      teamId: teams.find((t) => t.name === r.teamName)?.id || '',
      playerId: draft.players.find((p) => p.name === r.playerName)?.id || '',
      overall: r.overall
    }))

    const keeperData = draftData.filter((r) => r.keeps !== null).map((r) => ({
      teamId: teams.find((t) => t.name === r.teamName)?.id || '',
      playerId: draft.players.find((p) => p.name === r.playerName)?.id || '',
      round: getRound(r.overall, draftTeams.length),
      keeps: r.keeps
    }))

    // update draft with draft picks and keepers
    await prisma.draft.update({
      where: { id: draft.id },
      data: {
        draftPicks: { createMany: { data: draftPickData } },
        keepers: { createMany: { data: keeperData } },
      }
    })
    return draft
  }

  const result = await Promise.all(years.map((y) => createDraft(y)))
  return result
}
