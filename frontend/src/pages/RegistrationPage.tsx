import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import validator from 'validator'

import { useEmailExistQuery, useRegistrationMutation, useUsernameExistQuery } from '../api/userApi'
import LanguageButton from '../components/ui/LanguageButton'
import ThemeButton from '../components/ui/ThemeButton'
import useDebounce from '../hooks/useDebounce'
import cl from '../styles/pages/authorizationPage/authorizationPage.module.css'
import { isErrorMessage } from '../utils/assertions'

const RegistrationPage: FC = () => {
  const { t } = useTranslation('reg')
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const debouncedEmail = useDebounce(email, 500)
  const debouncedUsername = useDebounce(username, 500)

  const { isError: isErrorUsername } = useUsernameExistQuery(debouncedUsername!, {
    skip: !debouncedUsername || debouncedUsername.length < 6,
    refetchOnMountOrArgChange: true,
  })

  const { isError: isErrorEmail } = useEmailExistQuery(debouncedEmail!, {
    skip: !debouncedEmail || !validator.isEmail(debouncedEmail),
    refetchOnMountOrArgChange: true,
  })

  const [isValidEmail, setIsValidEmail] = useState(true)
  const [isValidUsername, setIsValidUsername] = useState(true)
  const [isValidPassword, setIsValidPassword] = useState(true)

  const [isEmailExist, setIsEmailExist] = useState(false)
  const [isUsernameExist, setIsUsernameExist] = useState(false)

  const [registrationMutation, { isSuccess, isLoading, isError, error }] = useRegistrationMutation()

  const isFormFilled = email && username && password ? true : false
  const isButtonNotDisabled =
    isFormFilled &&
    isValidEmail &&
    isValidUsername &&
    isValidPassword &&
    !isEmailExist &&
    !isUsernameExist &&
    !isLoading

  useEffect(() => {
    if (!isErrorEmail) return
    setIsEmailExist(true)
  }, [isErrorEmail])

  useEffect(() => {
    if (!isErrorUsername) return
    setIsUsernameExist(true)
  }, [isErrorUsername])

  useEffect(() => {
    if (!isSuccess) return
    toast.success(t('successRegText'))
    navigate('/login')
  }, [isSuccess, t, navigate])

  useEffect(() => {
    if (!isError) return
    toast.error(isErrorMessage(error) ? error.data.message : 'Unknown error')
  }, [isError, error])

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
            registrationMutation({ email, username, password })
          }}
        >
          <p>{t('regText')}</p>

          <div>
            <div>
              <input
                className={!isValidEmail || isEmailExist ? cl.invalidInput : ''}
                type='text'
                placeholder='Email'
                value={email}
                onChange={(event) => {
                  const value = event.currentTarget.value.replace(/\s+/g, '')
                  setIsEmailExist(false)

                  setEmail(value)
                  setIsValidEmail(validator.isEmail(value) || !value)
                }}
              />

              {isValidEmail || <p>{t('invalidEmailText')}</p>}
              {!isEmailExist || <p>{t('emailExistText')}</p>}
            </div>

            <div>
              <input
                className={!isValidUsername || isUsernameExist ? cl.invalidInput : ''}
                type='text'
                placeholder={t('usernameText')}
                value={username}
                onChange={(event) => {
                  const value = event.currentTarget.value.replace(/\s+/g, '')
                  setIsUsernameExist(false)

                  setUsername(value)
                  setIsValidUsername((value.length >= 6 && value.length <= 16) || !value)
                }}
              />

              {isValidUsername || <p>{t('invalidUsernameText')}</p>}
              {!isUsernameExist || <p>{t('usernameExistText')}</p>}
            </div>

            <div>
              <input
                className={!isValidPassword ? cl.invalidInput : ''}
                type='password'
                placeholder={t('passwordText')}
                value={password}
                onChange={(event) => {
                  const value = event.currentTarget.value.replace(/\s+/g, '')

                  setPassword(value)
                  setIsValidPassword((value.length >= 8 && value.length <= 32) || !value)
                }}
              />

              {isValidPassword || <p>{t('invalidPasswordText')}</p>}
            </div>
          </div>

          <button type='submit' disabled={!isButtonNotDisabled}>
            {t('regButtonText')}
          </button>
          <p>
            {t('accountText')} <Link to='/login'>{t('hrefText')}</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default RegistrationPage
