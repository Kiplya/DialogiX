import { createApi } from '@reduxjs/toolkit/query/react'

import { GetChatsByUserIdRes, GetManyUsersRes } from '@shared/index'

import { baseQuery } from '../utils/fetchHandlers'

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,

  endpoints: (builder) => ({
    getManyUsersByUsername: builder.query<GetManyUsersRes, { username: string; page: number; limit: number }>({
      query: (credentials) => ({
        url: '/auth/getManyUsersByUsername',
        method: 'GET',
        params: credentials,
      }),
    }),

    getChatsByUserId: builder.query<GetChatsByUserIdRes, void>({
      query: () => ({
        url: 'chat/getChatsByUserId',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetManyUsersByUsernameQuery, useGetChatsByUserIdQuery } = chatApi
