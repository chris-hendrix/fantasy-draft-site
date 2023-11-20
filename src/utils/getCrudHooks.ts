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

const useAlertEffect = (useAlertEffectOptions: UseAlertEffectOptions) => {
  const {
    isSuccess,
    error,
    showAlertOnSuccess,
    successMessage,
    showAlertOnError,
    errorMessage,
  } = { ...defaultCrudHookOptions, ...useAlertEffectOptions }

  const { showAlert } = useAlert()

  useEffect(() => {
    showAlertOnSuccess && isSuccess && showAlert({ successMessage })
  }, [isSuccess])

  useEffect(() => {
    showAlertOnError && error && showAlert(errorMessage ? { errorMessage } : { error })
  }, [error])
}

const defaultCrudHookOptions: CrudHookOptions = {
  skip: false,
  showAlertOnSuccess: false,
  successMessage: 'Success',
  showAlertOnError: false,
  errorMessage: null
}

interface CrudOperationsArgs {
  useGetObjectQuery: (id: string, options: CrudHookOptions) => any,
  useGetObjectsQuery: (args: any, options: CrudHookOptions) => any,
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
  const useGetObject = (id: string, options: CrudHookOptions = {}) => {
    const {
      data,
      isLoading,
      isSuccess,
      error
    }: {
      data: Object,
      isLoading: boolean,
      isSuccess: boolean,
      error: any,
    } = useGetObjectQuery(id, { skip: options.skip })

    useAlertEffect({ isSuccess, error, ...options })

    return { data, isLoading, isSuccess, error }
  }

  const useGetObjects = (args: PrismaFindManyArgs, options: CrudHookOptions = {}) => {
    const {
      data,
      isLoading,
      isSuccess,
      error
    }: {
      data: Object[],
      isLoading: boolean,
      isSuccess: boolean,
      error: any,
    } = useGetObjectsQuery(stringify(args), { skip: options.skip })

    useAlertEffect({ isSuccess, error, ...options })

    return { data, isLoading, isSuccess, error }
  }

  const useAddObject = (options: CrudHookOptions = {}) => {
    const [addObject, {
      isLoading,
      isSuccess,
      error
    }]: [(obj: Partial<Object>) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useAddObjectMutation()

    useAlertEffect({ isSuccess, error, ...options })

    return { addObject, isLoading, isSuccess, error }
  }

  const useUpdateObject = (options: CrudHookOptions = {}) => {
    const [updateObject, {
      isLoading,
      isSuccess,
      error
    }]: [(obj: Partial<Object>) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useUpdateObjectMutation()

    useAlertEffect({ isSuccess, error, ...options })

    return { updateObject, isLoading, isSuccess, error }
  }

  const useDeleteObject = (options: CrudHookOptions = {}) => {
    const [deleteObject, {
      isLoading,
      isSuccess,
      error
    }]: [(id: string) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useDeleteObjectMutation()

    useAlertEffect({ isSuccess, error, ...options })

    return { deleteObject, isLoading, isSuccess, error }
  }

  return { useGetObject, useGetObjects, useAddObject, useUpdateObject, useDeleteObject }
}
