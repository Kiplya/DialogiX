import { FC } from 'react'

import Avatar from './Avatar'

import cl from '../../styles/ui/dialogContainer/dialogContainer.module.css'

const DialogContainer: FC<{ userId: string; username: string; lastMessage?: string; lastMessageTime?: Date }> = ({
  userId,
  username,
  lastMessage,
  lastMessageTime,
}) => (
  <div className={cl.dialogDiv} data-user-id={userId}>
    <div>
      <Avatar userId={userId} />
    </div>

    <div>
      <span>
        <b>{username}</b>
      </span>
      <span className={cl.lastMessage}>{lastMessage}</span>
    </div>
  </div>
)

export default DialogContainer
