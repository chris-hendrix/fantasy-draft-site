/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export type AlertType = 'normal' | 'info' | 'success' | 'warning' | 'error'

interface AlertState {
  isVisible: boolean;
  message: string | null;
  duration: number | null;
  type: AlertType | null;
}

interface AppState {
  alert: AlertState;
  currentDraftId: string | null,
  currentHash: string | null
}

interface ShowAlertPayload {
  message: string | null;
  duration: number;
  type: AlertType | null
}

const initialState: AppState = {
  alert: { isVisible: false, message: null, type: null, duration: 5000 },
  currentDraftId: null,
  currentHash: null
}

export const showAlertAsync = createAsyncThunk<void, ShowAlertPayload>(
  'app/showAlert',
  async ({ duration }) => new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
)

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentHash: (state, action) => {
      state.currentHash = action.payload
    },
    setCurrentDraftId: (state, action) => {
      state.currentDraftId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(showAlertAsync.pending, (state, action) => {
      state.alert.isVisible = true
      state.alert.message = action.meta.arg.message
      state.alert.type = action.meta.arg.type
      state.alert.duration = action.meta.arg.duration
    })
    builder.addCase(showAlertAsync.fulfilled, (state) => {
      state.alert.isVisible = false
      state.alert.message = null
      state.alert.type = null
      state.alert.duration = null
    })
  },
})

export const { setCurrentHash, setCurrentDraftId } = appSlice.actions

export default appSlice
