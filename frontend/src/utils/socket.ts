import { socket } from './index'

import { userApi } from '../api/userApi'
import { store } from '../store/index'

socket.on('disconnect', () => {
  store
    .dispatch(userApi.endpoints.refreshTokens.initiate())
    .unwrap()
    .then(() => {
      socketConnect()
      return
    })
    .catch(() => {
      console.error('Socket connection closed')
    })
})

export const socketConnect = () => {
  socket.auth = { accessToken: localStorage.getItem('accessToken') }
  socket.connect()
}
