import { socket } from './index'

import { userApi } from '../api/userApi'
import { store } from '../store/index'

socket.on('unauthorized', (data: { controller: string; args?: any[] }) => {
  store
    .dispatch(userApi.endpoints.refreshTokens.initiate())
    .unwrap()
    .then(() => {
      socketControllers[data.controller](...(data.args || []))
    })
    .catch(() => {
      console.error('Socket connection closed')
    })
})

export const socketControllers: Record<string, (...args: any[]) => void> = {
  join_chat: (recepientId: string) => {
    socket.emit('join_chat', recepientId)
  },

  leave_chat: (recepientId: string) => {
    socket.emit('leave_chat', recepientId)
  },

  delete_chat: (recepientId: string) => {
    socket.emit('delete_chat', recepientId)
  },

  send_message: (text: string, recepientId: string) => {
    socket.emit('send_message', text, recepientId)
  },

  delete_message: (messageId: string, recepientId: string) => {
    socket.emit('delete_message', messageId, recepientId)
  },

  block_user: (recepientId: string) => {
    socket.emit('block_user', recepientId)
  },

  unblock_user: (recepientId: string) => {
    socket.emit('unblock_user', recepientId)
  },

  edit_message: (messageId: string, text: string, recepientId: string) => {
    socket.emit('edit_message', messageId, text, recepientId)
  },
}
