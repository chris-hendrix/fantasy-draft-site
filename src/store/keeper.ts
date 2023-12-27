import { createObjectApi } from '@/utils/createObjectApi'
import { Keeper, Prisma } from '@prisma/client'

export const keeperApi = createObjectApi<Keeper, Prisma.KeeperUpdateInput>(
  'keepers'
)

export const {
  useGetObjectsQuery,
  useUpdateObjectMutation,
} = keeperApi
