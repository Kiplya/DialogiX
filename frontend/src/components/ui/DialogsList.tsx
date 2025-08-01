import { GetManyUsersRes, GetChatsByUserIdRes } from '@shared/index'
import i18n from 'i18next'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Outlet, useParams, useNavigate } from 'react-router'

import DialogContainer from './DialogContainer'
import DropdownMenu, { DropdownMenuOption } from './DropdownMenu'
import Loader from './Loader'
import Modal from './Modal'

import { useGetManyUsersByUsernameQuery, useGetChatsByUserIdQuery } from '../../api/chatApi'
import { useLogoutMutation } from '../../api/userApi'
import useAppSelector from '../../hooks/useAppSelector'
import useDebounce from '../../hooks/useDebounce'
import dialogCl from '../../styles/ui/dialog/dialog.module.css'
import cl from '../../styles/ui/dialogsList/dialogsList.module.css'
import messageCl from '../../styles/ui/message/message.module.css'
import { socket } from '../../utils'

const DialogsList: FC = () => {
  const { t } = useTranslation('msg')
  const navigate = useNavigate()
  const { username } = useParams()
  const userId = useAppSelector((state) => state.authSlice.userId)

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

  const {
    data: chatsDataQuery,
    isFetching: isFetchingChatsQuery,
    isSuccess: isSuccessChatsQuery,
  } = useGetChatsByUserIdQuery(undefined, { refetchOnMountOrArgChange: true })

  const [chats, setChats] = useState<typeof chatsDataQuery>()

  useEffect(() => {
    if (!isSuccessChatsQuery) return
    setChats((prev) => [...(prev || []), ...chatsDataQuery])
  }, [isSuccessChatsQuery, chatsDataQuery])

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
      return {
        hasMore: searchUsersData.hasMore,
        users: [...(prev?.users ?? []), ...searchUsersData.users],
      }
    })
  }, [searchIsSuccess, searchUsersData])

  useEffect(() => {
    if (!searchIsError) return

    setSearchQuery('')
    setFoundUsers(undefined)
    setPage(1)
  }, [searchIsError])

  useEffect(() => {
    const userOnlineHandler = (id: string) => {
      setChats((prev) => prev?.map((chat) => (chat.userId === id ? { ...chat, isOnline: true } : chat)))
    }

    const userOfflineHandler = (id: string) => {
      setChats((prev) => prev?.map((chat) => (chat.userId === id ? { ...chat, isOnline: false } : chat)))
    }

    const deleteChatHandler = (chatId: string) => {
      setChats((prev) => prev?.filter((chat) => chat.chatId !== chatId))
    }

    const joinChatHandler = (chatInfo: GetChatsByUserIdRes[number]) => {
      setChats((prev) => prev?.map((chat) => (chat.chatId === chatInfo.chatId ? chatInfo : chat)))
    }

    const receiveMessageHandler = (chatInfo: GetChatsByUserIdRes[number]) => {
      setChats((prev) => [chatInfo, ...(prev?.filter((chat) => chat.chatId !== chatInfo.chatId) || [])])
    }

    const editMessageHandler = (chatInfo: GetChatsByUserIdRes[number]) => {
      setChats((prev) => prev?.map((chat) => (chat.chatId === chatInfo.chatId ? chatInfo : chat)))
    }

    const deleteMessageHandler = (chatInfo: GetChatsByUserIdRes[number]) => {
      setChats((prev) =>
        [chatInfo, ...(prev?.filter((chat) => chat.chatId !== chatInfo.chatId) || [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
    }

    socket.on('user_online', userOnlineHandler)
    socket.on('user_offline', userOfflineHandler)
    socket.on('dialogs_delete_chat', deleteChatHandler)
    socket.on('dialogs_join_chat', joinChatHandler)
    socket.on('dialogs_receive_message', receiveMessageHandler)
    socket.on('dialogs_edit_message', editMessageHandler)
    socket.on('dialogs_delete_message', deleteMessageHandler)

    return () => {
      socket.off('user_online', userOnlineHandler)
      socket.off('user_offline', userOfflineHandler)
      socket.off('dialogs_delete_chat', deleteChatHandler)
      socket.off('dialogs_join_chat', joinChatHandler)
      socket.off('dialogs_receive_message', receiveMessageHandler)
      socket.off('dialogs_edit_message', editMessageHandler)
      socket.off('dialogs_delete_message', deleteMessageHandler)
    }
  }, [])

  return (
    <>
      <div className={cl.pageDiv}>
        <div className={`${cl.layoutDiv} ${username ? cl.selected : ''}`}>
          <header>
            <DropdownMenu options={dropdownMenuOptions} label='&#8801;' />
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
                  <DialogContainer key={user.id} userId={user.id} username={user.username} isOnline={user.isOnline} />
                ))}
                <div ref={ref} style={{ height: '1px', width: '1px' }} />
              </>
            )}

            {debouncedUsername && searchIsFetching && (
              <div className={cl.loaderDiv}>
                <Loader />
              </div>
            )}

            {!debouncedUsername && !chats && isFetchingChatsQuery && (
              <div className={cl.loaderDiv}>
                <Loader />
              </div>
            )}

            {!debouncedUsername && chats && chats.length === 0 && (
              <span className={cl.notFounded}>{t('notFounedDialogsText')}</span>
            )}

            {!debouncedUsername &&
              chats &&
              chats.length > 0 &&
              chats.map((chat) => (
                <DialogContainer
                  key={chat.userId}
                  userId={chat.userId}
                  username={chat.username}
                  isOnline={chat.isOnline}
                  lastMessage={chat.lastMessage}
                  isSelfLastSender={chat.lastSenderId === userId}
                  lastMessageTime={chat.createdAt}
                  isNotReadedBySelf={chat.isNotReadedBySelf}
                  isNotReadedByRecepient={chat.isNotReadedByRecepient}
                />
              ))}
          </main>
        </div>

        {username ? (
          <Outlet key={username} />
        ) : (
          <div style={{ flexDirection: 'column-reverse' }} className={dialogCl.layoutDiv}>
            <div className={`${messageCl.message} ${messageCl.previewMessage}`}>
              <p>{t('nonSelectedDialogText')}</p>
            </div>
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

export default DialogsList
