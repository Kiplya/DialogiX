import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string
  isAuth: boolean
  isAdmin: boolean
}

const initialState: AuthState = {
  userId: '',
  isAuth: false,
  isAdmin: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsAuth(state, action: PayloadAction<boolean>) {
      state.isAuth = action.payload
    },

    setIsAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload
    },

    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload
    },
  },
})

export const { setIsAuth, setIsAdmin, setUserId } = authSlice.actions

export default authSlice.reducer
