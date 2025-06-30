import { combineReducers, configureStore } from '@reduxjs/toolkit'

import authSlice from './reducers/authSlice'

import { chatApi } from '../api/chatApi'
import { userApi } from '../api/userApi'

const rootReducer = combineReducers({
  authSlice,
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE === 'development',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware).concat(chatApi.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']
