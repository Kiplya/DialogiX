import { FC } from 'react'
import { useNavigate } from 'react-router'

import Avatar from './Avatar'

import cl from '../../styles/ui/dialogContainer/dialogContainer.module.css'

const DialogContainer: FC<{
  userId: string
  username: string
  lastMessage?: string
  lastMessageTime?: Date
  isOnline: boolean
}> = ({ userId, username, lastMessage, lastMessageTime, isOnline }) => {
  const navigate = useNavigate()

  return (
    <div className={cl.dialogDiv} onClick={() => navigate(`/messages/${username}`)}>
      <Avatar userId={userId} isOnline={isOnline} />

      <div>
        <span>
          <b>{username}</b>
        </span>
        <span className={cl.lastMessage}>{lastMessage}</span>
      </div>
    </div>
  )
}

export default DialogContainer
