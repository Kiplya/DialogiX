import { FC } from 'react'

import cl from '../../styles/ui/message/message.module.css'

const Message: FC<{ text: string; className?: string }> = ({ text, className }) => (
  <p className={`${cl.message} ${className ?? ''}`}>{text}</p>
)

export default Message
