import { FC, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import {
  useComparePasswordMutation,
  useDeleteAllTokensMutation,
  useDeleteSelfUserMutation,
  useGetSelfQuery,
  useUpdatePasswordMutation,
} from '../api/userApi'
import Avatar from '../components/ui/Avatar'
import Loader from '../components/ui/Loader'
import Modal from '../components/ui/Modal'
import useDebounce from '../hooks/useDebounce'
import cl from '../styles/pages/profilePage/profilePage.module.css'
import { isErrorMessage } from '../utils/assertions'

const ProfilePage: FC = () => {
  const { t } = useTranslation('profile')
  const { data, isFetching } = useGetSelfQuery(undefined, { refetchOnMountOrArgChange: true })
  const navigate = useNavigate()
  const dateFormat = localStorage.getItem('language') === 'ru' ? 'ru-RU' : 'en-EN'

  const [password, setPassword] = useState('')
  const debouncedPassword = useDebounce(password, 500)

  const [comparePassword, { isSuccess: isPasswordCorrect, isError: isPasswordError, error: passwordError }] =
    useComparePasswordMutation()
  const [deleteAllTokens, { isSuccess: isSuccessDeleteAllTokens }] = useDeleteAllTokensMutation()
  const [deleteSelfUser, { isSuccess: isSuccessDeleteSelfUser }] = useDeleteSelfUserMutation()
  const [updatePassword, { isSuccess: isSuccessUpdatePassword }] = useUpdatePasswordMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<string>('')
  const [onConfirmFn, setOnConfirmFn] = useState<Function>(() => {})

  const [newPassword, setNewPassword] = useState('')
  const [isPasswordChange, setIsPasswordChange] = useState(false)

  useEffect(() => {
    if (!debouncedPassword || debouncedPassword.length < 8 || debouncedPassword.length > 32) return
    comparePassword({ password: debouncedPassword })
  }, [comparePassword, debouncedPassword])

  useEffect(() => {
    if (!isPasswordCorrect) return
    toast.success(t('successPasswordCompareText'))
  }, [isPasswordCorrect, t])

  useEffect(() => {
    if (!isPasswordError) return
    toast.error(isErrorMessage(passwordError) ? passwordError.data.message : 'Unknown error')
  }, [isPasswordError, passwordError])

  useEffect(() => {
    if (!isSuccessDeleteAllTokens && !isSuccessDeleteSelfUser && !isSuccessUpdatePassword) return
    window.location.reload()
  }, [isSuccessDeleteAllTokens, isSuccessDeleteSelfUser, isSuccessUpdatePassword])

  return (
    <>
      <div className={cl.pageDiv}>
        {isFetching && (
          <div className={cl.loaderDiv}>
            <Loader />
          </div>
        )}
        {!isFetching && data && (
          <>
            <header>
              <span onClick={() => navigate('/messages')}>&#8592;</span>
              <Avatar userId={data.id} />
              <button>{t('change')}</button>
              <h1>
                {t('profileText')} {data.username}
              </h1>
            </header>

            <main>
              <div>
                <span>
                  <b>{t('usernameText')}:</b> {data.username}
                </span>
                <button>{t('change')}</button>
              </div>

              <p>
                <b>Email:</b> {data.email}
              </p>

              <p>
                <b>{t('registredAtText')}:</b> {new Intl.DateTimeFormat(dateFormat).format(new Date(data.registredAt))}
              </p>

              <p>
                <b>{t('roleText')}:</b> {data.isAdmin ? t('adminRoleText') : t('userRoleText')}
              </p>
            </main>

            <footer>
              <h1>{t('dangerZoneText')}</h1>
              <input
                placeholder={t('inputPasswordText')}
                type='password'
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value.replace(/\s+/g, ''))}
              />

              <button
                disabled={!isPasswordCorrect}
                onClick={() => {
                  setModalData(t('sessionsLogoutConfirmText'))
                  setOnConfirmFn(() => deleteAllTokens)
                  setIsModalOpen(true)
                }}
              >
                {t('sessionsLogoutText')}
              </button>

              {isPasswordChange ? (
                <div className={cl.entityChangeDiv}>
                  <input
                    className={
                      (newPassword.length < 8 || newPassword.length > 32) && newPassword ? cl.invalidInput : ''
                    }
                    placeholder={t('changePasswordPlaceholderText')}
                    type='password'
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.currentTarget.value.replace(/\s+/g, ''))}
                  />

                  <div>
                    <button
                      disabled={newPassword.length < 8 || newPassword.length > 32}
                      onClick={() => updatePassword({ password: newPassword })}
                    >
                      &#10004;
                    </button>

                    <button
                      onClick={() => {
                        setIsPasswordChange(false)
                        setNewPassword('')
                      }}
                    >
                      &#10006;
                    </button>
                  </div>
                </div>
              ) : (
                <button disabled={!isPasswordCorrect} onClick={() => setIsPasswordChange(true)}>
                  {t('changePasswordText')}
                </button>
              )}

              <button
                disabled={!isPasswordCorrect}
                onClick={() => {
                  setModalData(t('deleteAccountConfirmText'))
                  setOnConfirmFn(() => deleteSelfUser)
                  setIsModalOpen(true)
                }}
              >
                {t('deleteAccountText')}
              </button>
            </footer>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => onConfirmFn()}
        modalData={modalData}
      />
    </>
  )
}

export default ProfilePage
