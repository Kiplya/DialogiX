import { createApi } from '@reduxjs/toolkit/query/react'

import { BaseRes, LoginReq, LoginRes, RegistrationReq } from '@shared/index'

import { handleAuthFailure, handleAuthSuccess } from '../utils/authHanlder'
import { baseQuery } from '../utils/fetchHandlers'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,

  endpoints: (builder) => ({
    refreshTokens: builder.mutation<LoginRes, void>({
      query: () => ({
        url: '/public/refreshTokens',
        method: 'POST',
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          handleAuthSuccess(data, dispatch)
        } catch {
          handleAuthFailure(dispatch)
        }
      },
    }),

    login: builder.mutation<LoginRes, LoginReq>({
      query: (credentials) => ({
        url: '/public/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          handleAuthSuccess(data, dispatch)
        } catch {
          handleAuthFailure(dispatch)
        }
      },
    }),

    logout: builder.mutation<BaseRes, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          handleAuthFailure(dispatch)
        }
      },
    }),

    registration: builder.mutation<BaseRes, RegistrationReq>({
      query: (credentials) => ({
        url: '/public/registration',
        method: 'POST',
        body: credentials,
      }),
    }),

    usernameExist: builder.query<BaseRes, string>({
      query: (username) => ({
        url: '/public/isUsernameExist',
        method: 'GET',
        params: {
          username,
        },
      }),
    }),

    emailExist: builder.query<BaseRes, string>({
      query: (email) => ({
        url: '/public/isEmailExist',
        method: 'GET',
        params: {
          email,
        },
      }),
    }),
  }),
})

export const {
  useUsernameExistQuery,
  useEmailExistQuery,
  useRefreshTokensMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegistrationMutation,
} = userApi
