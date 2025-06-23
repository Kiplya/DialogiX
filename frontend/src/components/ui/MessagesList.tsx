import { GetManyUsersRes } from '@shared/index'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Outlet, useParams } from 'react-router'

import DialogContainer from './DialogContainer'
import Loader from './Loader'
import Message from './Message'

import { useGetManyUsersByUsernameQuery } from '../../api/messageApi'
import useDebounce from '../../hooks/useDebounce'
import dialogCl from '../../styles/ui/dialog/dialog.module.css'
import messageCl from '../../styles/ui/message/message.module.css'
import cl from '../../styles/ui/messagesList/messagesList.module.css'

const MessagesList: FC = () => {
  const { t } = useTranslation('msg')
  const { username } = useParams()

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
    <div className={cl.pageDiv}>
      <div className={cl.layoutDiv}>
        <header>
          <span>&#8801;</span>
          <input
            placeholder={t('searchPlaceholderText')}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.currentTarget.value.trim())
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
  )
}

export default MessagesList
