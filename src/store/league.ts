import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Prisma, League } from '@prisma/client'

const url: 'leagues' = 'leagues'
const reducerPath = 'leagueApi'
type Object = League
type FindManyArgs = Prisma.LeagueFindManyArgs

export const objectApi = createApi({
  reducerPath,
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: [url],
  endpoints: (build) => ({
    getObject: build.query<Object, string>({
      query: (id) => `${url}/${id}`,
      providesTags: (_result, _err, id) => [{ type: url, id }],
    }),
    getObjects: build.query<Object[], FindManyArgs | undefined>({
      query: (params) => ({
        url,
        params
      }),
      providesTags: (result) => [
        ...(result || []).map(({ id }) => ({ type: url, id })),
        { type: url, id: 'LIST' }
      ]
    }),
    addObject: build.mutation<Object, Partial<Object>>({
      query: (body) => ({
        url,
        method: 'POST',
        body,
      })
    }),
    updateObject: build.mutation({
      query: (data) => ({
        url: `users/${data?.id}`,
        method: 'PUT',
        body: { ...data, id: undefined },
      }),
      invalidatesTags: (user) => [{ type: url, id: user?.id }],
    })
  })
})

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation
} = objectApi
