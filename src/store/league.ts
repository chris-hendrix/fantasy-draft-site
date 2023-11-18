import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { League } from '@prisma/client'

const url: 'leagues' = 'leagues'
const reducerPath = 'leagueApi'
type Object = League

export const objectApi = createApi({
  reducerPath,
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: [url],
  endpoints: (build) => ({
    getObject: build.query<Object, string>({
      query: (id) => `${url}/${id}`,
      providesTags: (_result, _err, id) => [{ type: url, id }],
    }),
    getObjects: build.query<Object[], string>({
      query: (searchParams) => `${url}/?${searchParams}`,
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
      }),
      invalidatesTags: (league) => [{ type: url, id: league?.id }],
    }),
    updateObject: build.mutation({
      query: (data) => ({
        url: `${url}/${data?.id}`,
        method: 'PUT',
        body: { ...data, id: undefined },
      }),
      invalidatesTags: (league) => [{ type: url, id: league?.id }],
    })
  })
})

export const {
  useGetObjectQuery,
  useGetObjectsQuery,
  useAddObjectMutation,
  useUpdateObjectMutation
} = objectApi
