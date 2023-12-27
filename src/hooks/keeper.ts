import { KeeperArgs } from '@/types'
import { Prisma } from '@prisma/client'
import { getCrudHooks } from '@/utils/getCrudHooks'
import { keeperApi } from '@/store/keeper'

export const {
  useGetObjects: useGetKeepers,
  useUpdateObject: useUpdateKeeper,
  useInvalidateObject: useInvalidateKeeper
} = getCrudHooks<KeeperArgs, Prisma.KeeperFindManyArgs, Prisma.KeeperUncheckedUpdateInput>(
  keeperApi
)
