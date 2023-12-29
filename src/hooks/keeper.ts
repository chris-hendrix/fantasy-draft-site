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

export const useCalculatePreviousKeeper = (draftId: string) => {
  const result = usePreviousDraftData(draftId)

  const calculatePreviousKeeper = (playerName: string) => {
    const { draftPicks, teamsCount } = result
    const draftPick = draftPicks?.find((dp) => dp.player.name === playerName)
    const round = draftPick && (getRound(draftPick.overall, teamsCount) - 1)
    return { round, team: draftPick?.team }
  }

  return { calculatePreviousKeeper }
}
