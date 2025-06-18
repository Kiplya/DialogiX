import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuth: boolean
  isAdmin: boolean
}

const initialState: AuthState = {
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
  },
})

export const { setIsAuth, setIsAdmin } = authSlice.actions

export default authSlice.reducer
