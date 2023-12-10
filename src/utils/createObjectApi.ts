import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface BaseObject {
  id: string;
}

interface ApiOptions {
  extraInvalidates: string[]
}

export const createObjectApi = <Object extends BaseObject, UpdateInput>(
  url: string, options?: ApiOptions
) => {
  const reducerPath = `${url}Api`
  const { extraInvalidates } = {
    extraInvalidates: [],
    ...options
  }

  // TODO need to figure this out
  const invalidates = [...extraInvalidates, ...extraInvalidates.map((tag) => ({ type: tag, id: 'LIST' }))]

  return createApi({
    reducerPath,
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: [url, ...extraInvalidates],
    endpoints: (build) => ({
      getObject: build.query<Object, { id: string, queryParams?: string }>({
        query: (params) => `${url}/${params.id}?${params.queryParams}`,
        providesTags: (_result, _err, params) => [{ type: url, id: params.id }],
      }),
      getObjects: build.query<Object[], string>({
        query: (searchParams) => `${url}/?${searchParams}`,
        providesTags: (result) => [
          ...(result || []).map(({ id }) => ({ type: url, id })),
          { type: url, id: 'LIST' },
        ],
      }),
      addObject: build.mutation<Object, Partial<Object>>({
        query: (body) => ({
          url,
          method: 'POST',
          body,
        }),
        invalidatesTags: (item) => [{ type: url, id: item?.id }, ...extraInvalidates],
      }),
      updateObject: build.mutation<Object, { id: string, updateInput: UpdateInput }>({
        query: (data) => ({
          url: `${url}/${data?.id}`,
          method: 'PUT',
          body: { ...data, id: undefined },
        }),
        invalidatesTags: (item) => [{ type: url, id: item?.id }, ...invalidates],
      }),
      deleteObject: build.mutation<void, string>({
        query: (id) => ({
          url: `${url}/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: [{ type: url, id: 'LIST' }, ...extraInvalidates],
      }),
    }),
  })
}
