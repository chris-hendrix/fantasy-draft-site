import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
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
  const router = useRouter() // Get the router object

  const setCurrentHash = (hash: string | null) => {
    // Set the hash in the browser URL
    if (hash) {
      router.push(`#${hash}`)
    } else {
      router.push('/')
    }
    // Dispatch action to set the hash in the state
    dispatch(setCurrentHashAction(hash))
  }

  useEffect(() => {
    // Update currentHash when URL changes
    const handleHashChange = () => {
      const hash = window.location.hash.substr(1)
      dispatch(setCurrentHashAction(hash || null))
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [dispatch])

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
