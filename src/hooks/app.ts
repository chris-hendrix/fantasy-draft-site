import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  showAlertAsync,
  AlertType,
  setCurrentHash as setCurrentHashAction,
  setCurrentDraftId as setCurrentDraftIdAction
} from '@/store/app'
import { RootState, AppDispatch } from '@/store'
import { getErrorMessage } from '@/utils/error'

interface ShowAlertOptions {
  message?: string | null
  successMessage?: string | null,
  errorMessage?: string,
  error?: any
  duration?: number
}

export const useCurrentHash = () => {
  const dispatch: AppDispatch = useDispatch()
  const currentHash = useSelector((state: RootState) => state.app.currentHash)
  const windowHash = typeof window !== 'undefined' ? window.location.hash.substring(1) : null

  const setCurrentHash = (hash: string | null) => {
    if (hash) {
      window.location.hash = hash
    } else {
      window.location.hash = ''
    }
    dispatch(setCurrentHashAction(hash))
  }

  useEffect(() => {
    if (!windowHash) return
    dispatch(setCurrentHashAction(windowHash))
  }, [windowHash])

  return { currentHash, setCurrentHash }
}

export const useCurrentDraftId = () => {
  const dispatch: AppDispatch = useDispatch()
  const currentDraftId = useSelector((state: RootState) => state.app.currentDraftId)
  const setCurrentDraftId = (draftId: string | null) => dispatch(setCurrentDraftIdAction(draftId))

  return { currentDraftId, setCurrentDraftId }
}

export const useAlert = () => {
  const dispatch: AppDispatch = useDispatch()
  const alertState = useSelector((state: RootState) => state.app.alert)

  const showAlert = (options: ShowAlertOptions | string) => {
    if (typeof options === 'string') {
      dispatch(showAlertAsync({ message: options, type: 'normal', duration: 3000 }))
      return
    }
    const {
      message = null,
      successMessage = null,
      errorMessage = null,
      error = null,
      duration = 5000
    } = options || {}
    const alertMessage = message || successMessage || errorMessage || getErrorMessage(error)
    let type: AlertType = 'normal'
    if (successMessage) type = 'success'
    if (error || errorMessage) type = 'error'
    if (!alertMessage) return
    dispatch(showAlertAsync({ message: alertMessage, type, duration }))
  }

  return { showAlert, ...alertState }
}

export default useAlert
