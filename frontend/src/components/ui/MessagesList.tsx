import { GetManyUsersRes } from '@shared/index'
import i18n from 'i18next'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Outlet, useParams, useNavigate } from 'react-router'

import DialogContainer from './DialogContainer'
import DropdownMenu, { DropdownMenuOption } from './DropdownMenu'
import Loader from './Loader'
import Message from './Message'
import Modal from './Modal'

import { useGetManyUsersByUsernameQuery } from '../../api/messageApi'
import { useLogoutMutation } from '../../api/userApi'
import useDebounce from '../../hooks/useDebounce'
import dialogCl from '../../styles/ui/dialog/dialog.module.css'
import messageCl from '../../styles/ui/message/message.module.css'
import cl from '../../styles/ui/messagesList/messagesList.module.css'

const MessagesList: FC = () => {
  const { t } = useTranslation('msg')
  const navigate = useNavigate()
  const { username } = useParams()
  const [logoutMutation, { isLoading: isLoadingLogout }] = useLogoutMutation()
  const [isShowModal, setIsShowModal] = useState(false)

  const dropdownMenuOptions: DropdownMenuOption[] = useMemo(
    () => [
      {
        label: t('profileText'),
        onClick: () => navigate('/profile'),
      },
      {
        label: t('currentThemeText'),
        onClick: () => {
          const newTheme = localStorage.getItem('theme') === 'light' ? 'dark' : 'light'
          localStorage.setItem('theme', newTheme)
          document.body.classList.toggle('light-theme')
        },
      },
      {
        label: t('currentLanguageText'),
        onClick: () => {
          const newLanguage = localStorage.getItem('language') === 'ru' ? 'en' : 'ru'
          i18n.changeLanguage(newLanguage)
          localStorage.setItem('language', newLanguage)
        },
      },
      {
        label: t('logoutText'),
        onClick: () => setIsShowModal(true),
      },
    ],
    [t, navigate],
  )

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedUsername = useDebounce(searchQuery, 500)
  const [page, setPage] = useState(1)
  const { ref, inView } = useInView()
  const [foundUsers, setFoundUsers] = useState<GetManyUsersRes>()

  const {
    data: searchUsersData,
    isFetching: searchIsFetching,
    isError: searchIsError,
    isSuccess: searchIsSuccess,
  } = useGetManyUsersByUsernameQuery(
    { username: debouncedUsername!, page, limit: 10 },
    {
      skip: !debouncedUsername || !(foundUsers?.hasMore ?? true),
      refetchOnMountOrArgChange: true,
    },
  )

  useEffect(() => {
    if (inView && !searchIsFetching && searchIsSuccess) {
      setPage((prev) => prev + 1)
    }
  }, [inView, searchIsFetching, searchIsSuccess])

  useEffect(() => {
    if (!debouncedUsername) return

    setFoundUsers(undefined)
    setPage(1)
  }, [debouncedUsername])

  useEffect(() => {
    if (!searchIsSuccess) return

    setFoundUsers((prev) => {
      const prevUsers = prev?.users ?? []
      const newUsers = searchUsersData?.users ?? []

      return {
        hasMore: searchUsersData.hasMore,
        users: [...prevUsers, ...newUsers],
      }
    })
  }, [searchIsSuccess, searchUsersData])

  useEffect(() => {
    if (!searchIsError) return

    setSearchQuery('')
    setFoundUsers(undefined)
    setPage(1)
  }, [searchIsError])

  return (
    <>
      <div className={cl.pageDiv}>
        <div className={cl.layoutDiv}>
          <header>
            <DropdownMenu className={cl.dropdownMenuLabel} options={dropdownMenuOptions} label='&#8801;' />
            <input
              placeholder={t('searchPlaceholderText')}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.currentTarget.value.replace(/\s+/g, ''))
              }}
            />
          </header>

          <main>
            {debouncedUsername && foundUsers?.users && foundUsers.users.length === 0 && (
              <span className={cl.notFounded}>{t('notFounedUsersText')}</span>
            )}

            {debouncedUsername && foundUsers?.users && foundUsers.users.length > 0 && (
              <>
                {foundUsers.users.map((user) => (
                  <DialogContainer userId={user.id} username={user.username} />
                ))}
                <div ref={ref} style={{ height: '1px', width: '1px' }} />
              </>
            )}

            {debouncedUsername && searchIsFetching && (
              <div className={cl.loaderDiv}>
                <Loader />
              </div>
            )}

            {!debouncedUsername}
          </main>
        </div>

        {username ? (
          <Outlet context={{ username }} />
        ) : (
          <div className={dialogCl.layoutDiv}>
            <Message className={messageCl.previewMessage} text={t('nonSelectedDialogText')} />
          </div>
        )}
      </div>

      <Modal
        isOpen={isShowModal}
        modalData={t('logoutConfirmText')}
        onClose={() => setIsShowModal(false)}
        onConfirm={() => {
          if (!isLoadingLogout) logoutMutation()
        }}
      />
    </>
  )
}

export default MessagesList
