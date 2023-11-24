import { useEffect } from 'react'
import { stringify } from 'qs'
import { useAlert } from '@/hooks/app'

interface CrudHookOptions {
  skip?: boolean
  showAlertOnSuccess?: boolean;
  successMessage?: string;
  showAlertOnError?: boolean;
  errorMessage?: string | null;
}

interface UseAlertEffectOptions extends CrudHookOptions {
  isSuccess: boolean;
  error: any;
}

const defaultQueryOptions: CrudHookOptions = {
  skip: false,
  showAlertOnSuccess: false,
  successMessage: 'Success',
  showAlertOnError: true,
  errorMessage: null
}

const defaultMutationOptions: CrudHookOptions = {
  skip: false,
  showAlertOnSuccess: true,
  successMessage: 'Success',
  showAlertOnError: true,
  errorMessage: null
}

const useAlertEffect = (
  useAlertEffectOptions: UseAlertEffectOptions,
  mutation: boolean = false
) => {
  const {
    isSuccess,
    error,
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...(mutation ? defaultMutationOptions : defaultQueryOptions), ...useAlertEffectOptions }

  const { showAlert } = useAlert()

  useEffect(() => {
    showAlertOnSuccess && isSuccess && showAlert({ successMessage })
  }, [isSuccess])

  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ? { errorMessage } : { error })
  }, [error])
}

interface CrudOperationsArgs {
  useGetObjectQuery: (args: { id: string, queryParams: string }, options: CrudHookOptions) => any,
  useGetObjectsQuery: (queryParams: string, options: CrudHookOptions) => any,
  useAddObjectMutation: () => any,
  useUpdateObjectMutation: () => any,
  useDeleteObjectMutation: () => any,
}

export const getCrudHooks = <Object, PrismaFindManyArgs>({
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,
}: CrudOperationsArgs) => {
  const useGetObject = (
    { id, queryParams }: { id: string, queryParams?: PrismaFindManyArgs },
    options: CrudHookOptions = {}
  ) => {
    const { data, isLoading, isSuccess, error, refetch, }: {
      data: Object,
      isLoading: boolean,
      isSuccess: boolean,
      error: any,
      refetch: () => void
    } = useGetObjectQuery({ id, queryParams: stringify(queryParams) }, { skip: options.skip })

    useAlertEffect({ isSuccess, error, ...options })

    return { data, isLoading, isSuccess, error, refetch }
  }

  const useGetObjects = (queryParams: PrismaFindManyArgs, options: CrudHookOptions = {}) => {
    const { data, isLoading, isSuccess, error, refetch }: {
      data: Object[];
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
      refetch: () => void;
    } = useGetObjectsQuery(stringify(queryParams), { skip: options.skip })

    useAlertEffect({ isSuccess, error, ...options })

    return { data, isLoading, isSuccess, error, refetch }
  }

  const useAddObject = (options: CrudHookOptions = {}) => {
    const [addObject, { isLoading, isSuccess, error }]: [
      (obj: Partial<Object>) => Promise<Object>, {
        isLoading: boolean;
        isSuccess: boolean;
        error: any;
      }] = useAddObjectMutation()

    useAlertEffect({ isSuccess, error, ...options }, true)

    return { addObject, isLoading, isSuccess, error }
  }

  const useUpdateObject = (options: CrudHookOptions = {}) => {
    const [updateObject, { isLoading, isSuccess, error }]: [
      (obj: Partial<Object>) => Promise<Object>, {
        isLoading: boolean;
        isSuccess: boolean;
        error: any;
      }] = useUpdateObjectMutation()

    useAlertEffect({ isSuccess, error, ...options }, true)

    return { updateObject, isLoading, isSuccess, error }
  }

  const useDeleteObject = (options: CrudHookOptions = {}) => {
    const [deleteObject, { isLoading, isSuccess, error }]: [
      (id: string) => Promise<Object>, {
        isLoading: boolean;
        isSuccess: boolean;
        error: any;
      }] = useDeleteObjectMutation()

    useAlertEffect({ isSuccess, error, ...options }, true)

    return { deleteObject, isLoading, isSuccess, error }
  }

  return { useGetObject, useGetObjects, useAddObject, useUpdateObject, useDeleteObject }
}
