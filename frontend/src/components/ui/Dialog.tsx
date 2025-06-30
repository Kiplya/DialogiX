import { FC, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import Avatar from './Avatar'
import DropdownMenu, { DropdownMenuOption } from './DropdownMenu'
import Loader from './Loader'
import Modal from './Modal'

import { useGetUserByUsernameQuery } from '../../api/userApi'

import cl from '../../styles/ui/dialog/dialog.module.css'

const Dialog: FC = () => {
  const { username } = useParams()
  const { t } = useTranslation('dialog')
  const navigate = useNavigate()
  const {
    data: user,
    isFetching: isFetchingUser,
    isError: isErrorUser,
  } = useGetUserByUsernameQuery(username!, { skip: !username })

  const [isShowModal, setIsShowModal] = useState(false)
  const dropdownMenuOptions: DropdownMenuOption[] = useMemo(
    () => [
      {
        label: t('deleteChatText'),
        onClick: () => setIsShowModal(true),
      },
    ],
    [t],
  )

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/messages')
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate])

  useEffect(() => {
    if (!isErrorUser) return
    navigate('/messages', { replace: true })
  }, [isErrorUser, navigate])

  return (
    <>
      <div className={`${cl.layoutDiv} ${username ? cl.selected : ''}`}>
        {isFetchingUser && (
          <div className={cl.loaderDiv}>
            <Loader />
          </div>
        )}

        {!isFetchingUser && user && (
          <header>
            <div>
              <span onClick={() => navigate('/messages')}>&#8592;</span>
              <Avatar userId={user.id} />
            </div>

            <div className={cl.userInfo}>
              <p>
                <b>{username}</b>
              </p>
              <p className={user.isOnline ? cl.userOnline : cl.userOffline}>
                {user.isOnline ? t('userOnlineText') : t('userOfflineText')}
              </p>
            </div>

            <DropdownMenu ulLeftDirection={true} options={dropdownMenuOptions} label='&#9432;' />
          </header>
        )}
      </div>

      <Modal
        isOpen={isShowModal}
        modalData={t('deleteChatConfirmText')}
        onClose={() => setIsShowModal(false)}
        onConfirm={() => {}}
      />
    </>
  )
}

export default Dialog
