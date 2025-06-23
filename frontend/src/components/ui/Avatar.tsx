import { FC } from 'react'

import cl from '../../styles/ui/avatar/avatar.module.css'

const Avatar: FC<{ userId: string }> = (userId) => <img className={cl.avatar} src='img/default-avatar.webp' alt='' />

export default Avatar
