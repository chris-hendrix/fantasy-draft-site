import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface BaseObject {
  id: string;
}

export function createObjectApi<Object extends BaseObject>(url: string) {
  const reducerPath = `${url}Api`

  return createApi({
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
          { type: url, id: 'LIST' },
        ],
      }),
      addObject: build.mutation<Object, Partial<Object>>({
        query: (body) => ({
          url,
          method: 'POST',
          body,
        }),
        invalidatesTags: (item) => [{ type: url, id: item?.id }],
      }),
      updateObject: build.mutation({
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
}
