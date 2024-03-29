import { useEffect, useState } from 'react'
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
  useInvalidateObject: () => { invalidateObject: (id: string) => any },
  useInvalidateObjects: () => { invalidateObjects: () => any },
}

export const getCrudHooks = <Object, FindManyArgs, UpdateInput>({
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,
  useInvalidateObject,
  useInvalidateObjects
}: CrudOperationsArgs) => {
  const useGetObject = (
    { id, queryParams }: { id: string, queryParams?: FindManyArgs },
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

  const useGetObjects = (queryParams: FindManyArgs, options: CrudHookOptions = {}) => {
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
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<any>(null)
    const [updateObjectBase]: [
      (updateInput: UpdateInput) => Promise<Object>, {
        isLoading: boolean;
        isSuccess: boolean;
        error: any;
        isError: boolean
      }] = useUpdateObjectMutation()

    const updateObject = async (updateInput: UpdateInput) => {
      setIsLoading(true)
      const { data }: any = await updateObjectBase(updateInput)
      if ('error' in data) {
        setError(data.error)
      } else {
        setIsSuccess(true)
      }
      setIsLoading(false)
      return data
    }

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

  return {
    useGetObject,
    useGetObjects,
    useAddObject,
    useUpdateObject,
    useDeleteObject,
    useInvalidateObject,
    useInvalidateObjects
  }
}
