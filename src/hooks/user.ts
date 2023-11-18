import { useEffect } from 'react'
import { useGetSessionQuery, useGetUserQuery, useUpdateUserMutation } from '@/store'
import { User, Commissioner, League } from '@prisma/client'
import { useAlert } from './app'

interface CommissionerWithRelationships extends Commissioner {
  league: League
}

interface UserWithRelationships extends User {
  commissioners: CommissionerWithRelationships[];
}

export const useSessionUser = () => {
  const { data: session, isLoading: isSessionLoading } = useGetSessionQuery()
  const userId = session?.user?.id
  const { data: user, isLoading } = useGetUserQuery(userId || '', { skip: isSessionLoading || !userId })
  return { user: user as UserWithRelationships, isLoading }
}

export const useUpdateUser = () => {
  const [updateUser, { isSuccess, error, isLoading }] = useUpdateUserMutation()
  const { showAlert } = useAlert()

  useEffect(() => { isSuccess && showAlert({ successMessage: 'Changes saved' }) }, [isSuccess])
  useEffect(() => { error && showAlert({ error }) }, [error])

  return { updateUser, isLoading, isSuccess, error }
}
