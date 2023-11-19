import { useEffect } from 'react'
import { stringify } from 'qs'
import {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation
} from '@/store/league'
import { Prisma } from '@prisma/client'
import { useAlert } from './app'

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

export const useUserLeagues = (userId: string | null | undefined) => {
  const { data: commissionerLeagues } = useGetLeagues({
    where: { commissioners: { some: { userId: userId || '' } } }
  }, { skip: !userId })

  const leagues = [...(commissionerLeagues || [])]

  const isInLeague = (leagueId: string) => Boolean(
    leagues.find((league) => league.id === leagueId)
  )
  const isCommissioner = (leagueId: string) => Boolean(
    commissionerLeagues?.find((league) => league.id === leagueId)
  )

  return { leagues, commissionerLeagues, isInLeague, isCommissioner }
}
