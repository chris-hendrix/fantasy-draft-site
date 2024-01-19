import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useDispatch } from 'react-redux'

interface BaseObject {
  id: string;
}

export const createObjectApi = <Object extends BaseObject, UpdateInput>(url: string) => {
  const reducerPath = `${url}Api`

  const api = createApi({
    reducerPath,
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: [url],
    endpoints: (build) => ({
      getObject: build.query<Object, { id: string, queryParams?: string }>({
        query: (params) => `${url}/${params.id}?${params.queryParams}`,
        providesTags: (_result, _err, params) => [{ type: url, id: params.id }],
      }),
      getObjects: build.query<Object[], string>({
        query: (searchParams) => `${url}/?${searchParams}`,
        providesTags: (result, error) => {
          if (error) {
            console.error(error)
            return [{ type: url, id: 'LIST' }]
          }
          return [
            ...(result?.map(({ id }) => ({ type: url, id })) || []),
            { type: url, id: 'LIST' },
          ]
        },
      }),
      addObject: build.mutation<Object, Partial<Object>>({
        query: (body) => ({
          url,
          method: 'POST',
          body,
        }),
        invalidatesTags: (item) => [{ type: url, id: item?.id }],
      }),
      updateObject: build.mutation<Object, { id: string, updateInput: UpdateInput }>({
        query: (data) => ({
          url: `${url}/${data?.id}`,
          method: 'PUT',
          body: { ...data, id: undefined },
        }),
        invalidatesTags: (item) => [{ type: url, id: item?.id }],
      }),
      deleteObject: build.mutation<void, string>({
        query: (id) => ({
          url: `${url}/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: [{ type: url, id: 'LIST' }],
      }),
    }),
  })

  const useInvalidateObject = () => {
    const dispatch = useDispatch()
    const invalidateObject = (id: string) => dispatch(
      api.util.invalidateTags([{ type: url, id }])
    )
    return { invalidateObject }
  }

  const useInvalidateObjects = () => {
    const dispatch = useDispatch()
    const invalidateObjects = () => dispatch(
      api.util.invalidateTags([url, { type: url, id: 'LIST' }])
    )
    return { invalidateObjects }
  }

  return { ...api, useInvalidateObject, useInvalidateObjects }
}
