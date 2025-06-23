import { FC } from 'react'

import { useOutletContext } from 'react-router'

import cl from '../../styles/ui/dialog/dialog.module.css'

const Dialog: FC = () => {
  const { username } = useOutletContext<{ username: string }>()

  return <div className={cl.layoutDiv}></div>
}

export default Dialog
