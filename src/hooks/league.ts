import { useEffect } from 'react'
import { stringify } from 'qs'
import {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation
} from '@/store/league'
import { Prisma } from '@prisma/client'
import { useParams } from 'next/navigation'
import { useAlert } from './app'
import { useSessionUser } from './user'

interface Options {
  skip?: boolean
  showAlertOnSuccess?: boolean;
  successMessage?: string;
  showAlertOnError?: boolean;
  errorMessage?: string | null;
}

const defaultOptions: Options = {
  skip: false,
  showAlertOnSuccess: false,
  successMessage: 'Success',
  showAlertOnError: false,
  errorMessage: null
}

export const useGetLeague = (id: string, options: Options = {}) => {
  const { data, isLoading, isSuccess, error } = useGetObjectQuery(id, { skip: options.skip })
  const { showAlert } = useAlert()

  const {
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultOptions, ...options }

  useEffect(() => { showAlertOnSuccess && isSuccess && showAlert({ successMessage }) }, [isSuccess])
  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ?
      { errorMessage } : { error })
  }, [error])
  return { data, isLoading, isSuccess, error }
}

export const useGetLeagues = (args: Prisma.LeagueFindManyArgs, options: Options = {}) => {
  const { data, isLoading, isSuccess, error } = useGetObjectsQuery(stringify(args))
  const { showAlert } = useAlert()

  const {
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultOptions, ...options }

  useEffect(() => { showAlertOnSuccess && isSuccess && showAlert({ successMessage }) }, [isSuccess])
  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ?
      { errorMessage } : { error })
  }, [error])
  return { data, isLoading, isSuccess, error }
}

export const useAddLeague = (options: Options = {}) => {
  const [addObject, { isSuccess, error, isLoading }] = useAddObjectMutation()
  const { showAlert } = useAlert()

  const {
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultOptions, ...options }

  useEffect(() => { showAlertOnSuccess && isSuccess && showAlert({ successMessage }) }, [isSuccess])
  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ?
      { errorMessage } : { error })
  }, [error])

  return { addLeague: addObject, isLoading, isSuccess, error }
}

export const useUpdateLeague = (options: Options = {}) => {
  const [updateObject, { isSuccess, error, isLoading }] = useUpdateObjectMutation()
  const { showAlert } = useAlert()

  const {
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultOptions, ...options }

  useEffect(() => { showAlertOnSuccess && isSuccess && showAlert({ successMessage }) }, [isSuccess])
  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ?
      { errorMessage } : { error })
  }, [error])

  return { updateLeague: updateObject, isLoading, isSuccess, error }
}

export const useDeleteLeague = (options: Options = {}) => {
  const [deleteObject, { isSuccess, error, isLoading }] = useDeleteObjectMutation()
  const { showAlert } = useAlert()

  const {
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultOptions, ...options }

  useEffect(() => { showAlertOnSuccess && isSuccess && showAlert({ successMessage }) }, [isSuccess])
  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ?
      { errorMessage } : { error })
  }, [error])

  return { deleteLeague: deleteObject, isLoading, isSuccess, error }
}

export const useUserLeagues = (leagueId: string | null = null) => {
  const { user } = useSessionUser()
  const { id } = useParams()
  const userId = user?.id
  const { data: commissionerLeagues, isLoading: isCommissionerLeaguesLoading } = useGetLeagues({
    where: { commissioners: { some: { userId } } }
  }, { skip: !userId })

  const isLoading = isCommissionerLeaguesLoading
  const leagues = [...(commissionerLeagues || [])]
  const defaultLeague = leagues?.[0] || null

  const isCommissioner = commissionerLeagues?.find((league) => league.id === (leagueId || id))
  const isMember = leagues?.find((league) => league.id === leagueId)

  return { leagues, commissionerLeagues, isCommissioner, isMember, defaultLeague, isLoading }
}
