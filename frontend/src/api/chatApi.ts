import { createApi } from '@reduxjs/toolkit/query/react'

import { GetChatsByUserIdRes, GetManyUsersRes, GetMessagesByChatIdRes } from '@shared/index'

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

      keepUnusedDataFor: 0,
    }),

    getChatsByUserId: builder.query<GetChatsByUserIdRes, void>({
      query: () => ({
        url: '/chat/getChatsByUserId',
        method: 'GET',
      }),

      keepUnusedDataFor: 0,
    }),

    getMessagesByUsers: builder.query<GetMessagesByChatIdRes, { recepientId: string; page: number; limit: number }>({
      query: (credentials) => ({
        url: '/chat/getMessagesByUsers',
        method: 'GET',
        params: credentials,
      }),

      keepUnusedDataFor: 0,
    }),
  }),
})

export const { useGetManyUsersByUsernameQuery, useGetChatsByUserIdQuery, useLazyGetMessagesByUsersQuery } = chatApi
