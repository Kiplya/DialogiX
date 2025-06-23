import { ResStatus } from '@shared/index'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import validator from 'validator'

import { useLoginMutation } from '../api/userApi'
import LanguageButton from '../components/ui/LanguageButton'
import ThemeButton from '../components/ui/ThemeButton'
import cl from '../styles/pages/authorizationPage/authorizationPage.module.css'
import { isErrorMessage, isErrorWithStatus } from '../utils/assertions'

const AuthorizationPage: FC = () => {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  const [isValidEmail, setIsValidEmail] = useState(true)
  const [isValidPassword, setIsValidPassword] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loginMutation, { isSuccess, isLoading, isError, error }] = useLoginMutation()

  const isFormFilled = email && password ? true : false
  const isButtonNotDisabled = isFormFilled && isValidEmail && isValidPassword && !isLoading

  useEffect(() => {
    if (!isSuccess) return
    navigate('/messages')
  }, [isSuccess, navigate])

  useEffect(() => {
    if (!isError) return

    const errorMessage = isErrorMessage(error) ? error.data.message : 'Unknown error'
    const errorStatus = isErrorWithStatus(error) ? error.status : ResStatus.INTERNAL_SERVER_ERROR

    if (errorStatus === ResStatus.INVALID_CREDENTIALS) {
      toast.error(t('failureLoginText'))
    } else {
      toast.error(errorMessage)
    }
  }, [error, isError, t])

  return (
    <div className={cl.pageDiv}>
      <LanguageButton />
      <ThemeButton />
      <header>
        <h1>Dialogi</h1>
        <img src='/img/logo.webp' alt=''></img>
      </header>

      <main>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            loginMutation({ email, password })
          }}
        >
          <p>{t('authText')}</p>

          <div>
            <div>
              <input
                className={!isValidEmail ? cl.invalidInput : ''}
                type='text'
                placeholder='Email'
                value={email}
                onChange={(event) => {
                  const value = event.currentTarget.value.trim()

                  setEmail(value)
                  setIsValidEmail(validator.isEmail(value) || !value)
                }}
              />
              {isValidEmail || <p>{t('invalidEmailText')}</p>}
            </div>

            <div>
              <input
                className={!isValidPassword ? cl.invalidInput : ''}
                type='password'
                placeholder={t('passwordText')}
                value={password}
                onChange={(event) => {
                  const value = event.currentTarget.value.trim()

                  setPassword(value)
                  setIsValidPassword((value.length >= 8 && value.length <= 32) || !value)
                }}
              />

              {isValidPassword || <p>{t('invalidPasswordText')}</p>}
            </div>
          </div>

          <button type='submit' disabled={!isButtonNotDisabled}>
            {t('loginButtonText')}
          </button>
          <p>
            {t('accountText')} <Link to='/registration'>{t('hrefText')}</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default AuthorizationPage
