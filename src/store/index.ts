import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { appSlice } from './app'
import { userApi } from './user'
import { sessionApi } from './session'
import { leagueApi } from './league'
import { teamApi } from './team'
import { draftApi } from './draft'
import { playerApi } from './player'
import { draftPickApi } from './draftPick'
import { keeperApi } from './keeper'

export const makeStore = () => configureStore({
  // @ts-ignore
  reducer: {
    [appSlice.name]: appSlice.reducer,
    [sessionApi.reducerPath]: sessionApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [leagueApi.reducerPath]: leagueApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [draftApi.reducerPath]: draftApi.reducer,
    [playerApi.reducerPath]: playerApi.reducer,
    [draftPickApi.reducerPath]: draftPickApi.reducer,
    [keeperApi.reducerPath]: keeperApi.reducer
  },
  // @ts-ignore
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([
    sessionApi.middleware,
    userApi.middleware,
    leagueApi.middleware,
    teamApi.middleware,
    draftApi.middleware,
    playerApi.middleware,
    draftPickApi.middleware,
    keeperApi.middleware
  ]),
  devTools: true // process.env.NODE_ENV !== 'production'
})

export const store = makeStore()

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { showAlertAsync } from './app'
export { useGetUserQuery, useGetUsersQuery, useAddUserMutation, useUpdateUserMutation } from './user'
export { useGetSessionQuery, useSignInMutation, useSignOutMutation } from './session'
