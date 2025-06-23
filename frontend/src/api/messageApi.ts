import { createApi } from '@reduxjs/toolkit/query/react'

import { GetManyUsersRes } from '@shared/index'

import { baseQuery } from '../utils/fetchHandlers'

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery,

  endpoints: (builder) => ({
    getManyUsersByUsername: builder.query<GetManyUsersRes, { username: string; page: number; limit: number }>({
      query: (credentials) => ({
        url: '/auth/getManyUsersByUsername',
        method: 'GET',
        params: credentials,
      }),
    }),
  }),
})

export const { useGetManyUsersByUsernameQuery } = messageApi
