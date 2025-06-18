import { FC } from 'react'

import cl from '../styles/pages/errorPage/errorPage.module.css'

const ErrorPage: FC = () => {
  return (
    <div className={cl.pageDiv}>
      <h1>Something went wrong :{'('}</h1>
    </div>
  )
}

export default ErrorPage
