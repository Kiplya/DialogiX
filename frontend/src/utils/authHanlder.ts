import { LoginRes } from '@shared/index'

import { socket } from './index'

import { AppDispatch } from '../store'
import { setIsAuth, setIsAdmin } from '../store/reducers/authSlice'

export const handleAuthSuccess = (data: LoginRes, dispatch: AppDispatch) => {
  localStorage.setItem('accessToken', data.accessToken)

  if (socket.connected) {
    socket.disconnect()
  }
  socket.auth = { accessToken: localStorage.getItem('accessToken') }
  socket.connect()

  dispatch(setIsAuth(true))
  dispatch(setIsAdmin(data.isAdmin))
}

export const handleAuthFailure = (dispatch: AppDispatch) => {
  localStorage.removeItem('accessToken')

  if (socket.connected) {
    socket.disconnect()
  }

  dispatch(setIsAuth(false))
  dispatch(setIsAdmin(false))
}
