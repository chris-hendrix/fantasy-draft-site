import { createObjectApi } from '@/utils/createObjectApi'
import { Player, Prisma } from '@prisma/client'

export const playerApi = createObjectApi<Player, Prisma.PlayerUpdateInput>('players')

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,
  useInvalidateObjects
} = playerApi
