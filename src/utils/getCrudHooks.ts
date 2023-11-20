import { useEffect } from 'react'
import { stringify } from 'qs'
import { useAlert } from '@/hooks/app'

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

type CrudOperationsArgs = {
  useGetObjectQuery: (id: string, options: Options) => any,
  useGetObjectsQuery: (args: any, options: Options) => any,
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
  const useGetObject = (id: string, options: Options = {}) => {
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

    const { showAlert } = useAlert()
    const {
      showAlertOnSuccess,
      successMessage,
      showAlertOnError,
      errorMessage,
    } = { ...defaultOptions, ...options }

    useEffect(() => {
      showAlertOnSuccess && isSuccess && showAlert({ successMessage })
    }, [isSuccess])

    useEffect(() => {
      showAlertOnError && error && showAlert(errorMessage ?
        { errorMessage } : { error })
    }, [error])

    return { data, isLoading, isSuccess, error }
  }

  const useGetObjects = (args: PrismaFindManyArgs, options: Options = {}) => {
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

    const { showAlert } = useAlert()
    const {
      showAlertOnSuccess,
      successMessage,
      showAlertOnError,
      errorMessage,
    } = { ...defaultOptions, ...options }

    useEffect(() => {
      showAlertOnSuccess && isSuccess && showAlert({ successMessage })
    }, [isSuccess])

    useEffect(() => {
      showAlertOnError && error && showAlert(errorMessage ?
        { errorMessage } : { error })
    }, [error])

    return { data, isLoading, isSuccess, error }
  }

  const useAddObject = (options: Options = {}) => {
    const [addObject, {
      isLoading,
      isSuccess,
      error
    }]: [(obj: Partial<Object>) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useAddObjectMutation()

    const { showAlert } = useAlert()
    const {
      showAlertOnSuccess,
      successMessage,
      showAlertOnError,
      errorMessage,
    } = { ...defaultOptions, ...options }

    useEffect(() => {
      showAlertOnSuccess && isSuccess && showAlert({ successMessage })
    }, [isSuccess])

    useEffect(() => {
      showAlertOnError && error && showAlert(errorMessage ?
        { errorMessage } : { error })
    }, [error])

    return { addObject, isLoading, isSuccess, error }
  }

  const useUpdateObject = (options: Options = {}) => {
    const [updateObject, {
      isLoading,
      isSuccess,
      error
    }]: [(obj: Partial<Object>) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useUpdateObjectMutation()

    const { showAlert } = useAlert()
    const {
      showAlertOnSuccess,
      successMessage,
      showAlertOnError,
      errorMessage,
    } = { ...defaultOptions, ...options }

    useEffect(() => {
      showAlertOnSuccess && isSuccess && showAlert({ successMessage })
    }, [isSuccess])

    useEffect(() => {
      showAlertOnError && error && showAlert(errorMessage ?
        { errorMessage } : { error })
    }, [error])

    return { updateObject, isLoading, isSuccess, error }
  }

  const useDeleteObject = (options: Options = {}) => {
    const [deleteObject, {
      isLoading,
      isSuccess,
      error
    }]: [(obj: Partial<Object>) => Promise<Object>, {
      isLoading: boolean;
      isSuccess: boolean;
      error: any;
    }] = useDeleteObjectMutation()

    const { showAlert } = useAlert()
    const {
      showAlertOnSuccess,
      successMessage,
      showAlertOnError,
      errorMessage,
    } = { ...defaultOptions, ...options }

    useEffect(() => {
      showAlertOnSuccess && isSuccess && showAlert({ successMessage })
    }, [isSuccess])

    useEffect(() => {
      showAlertOnError && error && showAlert(errorMessage ?
        { errorMessage } : { error })
    }, [error])

    return { deleteObject, isLoading, isSuccess, error }
  }

  return { useGetObject, useGetObjects, useAddObject, useUpdateObject, useDeleteObject }
}
