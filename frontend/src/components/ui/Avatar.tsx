import { FC, useState } from 'react'

import cl from '../../styles/ui/avatar/avatar.module.css'

const Avatar: FC<{ userId: string }> = ({ userId }) => {
  const [src, setSrc] = useState(`${import.meta.env.VITE_API_URL}/uploads/avatars/avatar-${userId}.jpg`)
  return <img className={cl.avatar} src={src} alt='' onError={() => setSrc('img/default-avatar.webp')} />
}

export default Avatar
