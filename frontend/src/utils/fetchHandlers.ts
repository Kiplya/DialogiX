import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { LoginRes } from '@shared/index'

import { handleAuthFailure, handleAuthSuccess } from './authHanlder'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery({ url: '/public/refreshTokens', method: 'POST' }, api, extraOptions)

    if (refreshResult.data && !refreshResult.error && typeof refreshResult.data === 'object') {
      handleAuthSuccess(refreshResult.data as LoginRes, api.dispatch)
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      handleAuthFailure(api.dispatch)
    }
  }

  return result
}
