import { LoginRes } from '@shared/index'

import { AppDispatch } from '../store'
import { setIsAuth, setIsAdmin } from '../store/reducers/authSlice'

export const handleAuthSuccess = (data: LoginRes, dispatch: AppDispatch) => {
  localStorage.setItem('accessToken', data.accessToken)
  dispatch(setIsAuth(true))
  dispatch(setIsAdmin(data.isAdmin))
}

export const handleAuthFailure = (dispatch: AppDispatch) => {
  localStorage.removeItem('accessToken')
  dispatch(setIsAuth(false))
  dispatch(setIsAdmin(false))
}
