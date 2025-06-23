import { FC, PropsWithChildren, useEffect } from 'react'

import Loader from './ui/Loader'

import { useRefreshTokensMutation } from '../api/userApi'
import cl from '../styles/pages/authController/authController.module.css'

const AuthController: FC<PropsWithChildren> = ({ children }) => {
  const [refreshTokensMutation, { isLoading, isUninitialized }] = useRefreshTokensMutation()

  useEffect(() => {
    refreshTokensMutation()

    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark')
    } else if (localStorage.getItem('theme') === 'light') {
      document.body.classList.toggle('light-theme')
    }

    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'ru')
    }
  }, [refreshTokensMutation])

  return (
    <>
      {isLoading || isUninitialized ? (
        <div className={cl.loaderDiv}>
          <Loader />
        </div>
      ) : (
        children
      )}
    </>
  )
}

export default AuthController
