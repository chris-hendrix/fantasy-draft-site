import { useEffect } from 'react'
import { useGetObjectQuery, useGetObjectsQuery, useAddObjectMutation } from '@/store/league'
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
  const { data, isLoading, isSuccess, error } = useGetObjectsQuery(args)
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
