import { KeeperArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { keeperApi } from '@/store/keeper'
import { getRound } from '@/utils/draft'
import { usePreviousDraftData } from './draft'

export const {
  useGetObjects: useGetKeepers,
  useUpdateObject: useUpdateKeeper,
  useInvalidateObjects: useInvalidateKeepers
} = getCrudHooks<KeeperArgs, Prisma.KeeperFindManyArgs, Prisma.KeeperUncheckedUpdateInput>(
  keeperApi
)

export const useCalculateKeeperRound = (draftId: string) => {
  const { draftPicks, teamsCount } = usePreviousDraftData(draftId)

  const calculateKeeperRound = (playerName: string) => {
    if (!draftPicks) return null
    const draftPick = draftPicks.find((dp) => dp.player.name === playerName)
    if (!draftPick) return null
    const previousRound = getRound(draftPick.overall, teamsCount)
    return previousRound - 1
  }

  return { calculateKeeperRound }
}
