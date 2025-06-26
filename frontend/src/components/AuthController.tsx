import { FC, PropsWithChildren, useEffect } from 'react'

import Loader from './ui/Loader'

import { useRefreshTokensMutation } from '../api/userApi'
import cl from '../styles/pages/authController/authController.module.css'

const AuthController: FC<PropsWithChildren> = ({ children }) => {
  const [refreshTokensMutation, { isLoading, isUninitialized }] = useRefreshTokensMutation()

  useEffect(() => {
    refreshTokensMutation()

    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.toggle('light-theme')
    }

    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', navigator.language.slice(0, 2))
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
