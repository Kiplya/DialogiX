import { FC } from 'react'
import { useNavigate, useParams } from 'react-router'

import Avatar from './Avatar'

import cl from '../../styles/ui/dialogContainer/dialogContainer.module.css'

const DialogContainer: FC<{
  userId: string
  username: string
  isOnline: boolean
  lastMessage?: string
  isSelfLastSender?: boolean
  lastMessageTime?: Date
  isNotReadedBySelf?: boolean
  isNotReadedByRecepient?: boolean
}> = ({
  userId,
  username,
  lastMessage,
  lastMessageTime,
  isOnline,
  isNotReadedBySelf,
  isNotReadedByRecepient,
  isSelfLastSender,
}) => {
  const { username: urlUsername } = useParams()
  const navigate = useNavigate()

  const timeFormat = new Intl.DateTimeFormat(localStorage.getItem('language') === 'ru' ? 'ru-RU' : 'en-EN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: localStorage.getItem('language') === 'ru' ? false : true,
  })

  return (
    <div
      className={`${cl.dialogDiv} ${urlUsername === username ? cl.selected : ''} `}
      onClick={() => {
        navigate(`/messages/${username}`)
      }}
    >
      <Avatar userId={userId} isOnline={isOnline} />

      <div>
        <span>
          <b>{username}</b>
        </span>
        <div>
          {lastMessage && <span>{lastMessage}</span>}
          {lastMessageTime && <span className={cl.messageTime}>{timeFormat.format(new Date(lastMessageTime))}</span>}
          {isNotReadedBySelf && <div className={cl.notReadedBySelf} />}

          {isSelfLastSender && !isNotReadedBySelf && isNotReadedByRecepient && (
            <span className={cl.notReadedByRecepient}>&#10004;</span>
          )}

          {isSelfLastSender && !isNotReadedBySelf && !isNotReadedByRecepient && (
            <span className={cl.readedByRecepient}>&#10004;</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DialogContainer
