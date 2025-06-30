import { FC, useState } from 'react'

import cl from '../../styles/ui/avatar/avatar.module.css'

const Avatar: FC<{ userId: string; isOnline?: boolean }> = ({ userId, isOnline }) => {
  const [src, setSrc] = useState(`${import.meta.env.VITE_API_URL}/uploads/avatars/avatar-${userId}.jpg`)
  return (
    <div className={cl.avatarDiv}>
      <img src={src} alt='' onError={() => setSrc('/img/default-avatar.webp')} />
      {isOnline != null && <div className={isOnline ? cl.online : ''}></div>}
    </div>
  )
}

export default Avatar
