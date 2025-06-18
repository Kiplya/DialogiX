import { FC } from 'react'

import { useLogoutMutation } from '../api/userApi'
import cl from '../styles/pages/messagesPage/messagesPage.module.css'

const MessagesPage: FC = () => {
  const [logoutMutation] = useLogoutMutation()
  return (
    <div className={cl.pageDiv}>
      <button
        onClick={(event) => {
          event.preventDefault()
          logoutMutation()
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default MessagesPage
