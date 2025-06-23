import { combineReducers, configureStore } from '@reduxjs/toolkit'

import authSlice from './reducers/authSlice'

import { messageApi } from '../api/messageApi'
import { userApi } from '../api/userApi'

const rootReducer = combineReducers({
  authSlice,
  [userApi.reducerPath]: userApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE === 'development',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userApi.middleware).concat(messageApi.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']
