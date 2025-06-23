import { socket } from './index'

import { userApi } from '../api/userApi'
import { store } from '../store/index'

socket.on('unauthorized', (data: { controller: string; args?: any[] }) => {
  store
    .dispatch(userApi.endpoints.refreshTokens.initiate())
    .unwrap()
    .then(() => {
      socketControllers[data.controller](data.args)
    })
    .catch(() => {
      console.error('Socket connection closed')
    })
})

export const socketControllers: Record<string, (args?: any[], cb?: Function) => void> = {}
