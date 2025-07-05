import { LoginRes } from '@shared/index'

import { socket } from './index'

import { AppDispatch } from '../store'
import { setIsAuth, setIsAdmin, setUserId } from '../store/reducers/authSlice'

export const handleAuthSuccess = (data: LoginRes, dispatch: AppDispatch) => {
  localStorage.setItem('accessToken', data.accessToken)
  socket.disconnect()

  socket.auth = { accessToken: localStorage.getItem('accessToken') }
  socket.connect()
  socket.emit('join_user')

  dispatch(setUserId(data.userId))
  dispatch(setIsAuth(true))
  dispatch(setIsAdmin(data.isAdmin))
}

export const handleAuthFailure = (dispatch: AppDispatch) => {
  localStorage.removeItem('accessToken')
  socket.disconnect()

  dispatch(setUserId(''))
  dispatch(setIsAuth(false))
  dispatch(setIsAdmin(false))
}
