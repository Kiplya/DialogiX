import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react'
import { Fragment, FC, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'

import Avatar from './Avatar'
import ContextMenu, { ContextMenuOption } from './ContextMenu'
import DropdownMenu, { DropdownMenuOption } from './DropdownMenu'
import Loader from './Loader'
import Modal from './Modal'

import { useLazyGetMessagesByUsersQuery } from '../../api/chatApi'
import { useGetUserByUsernameQuery } from '../../api/userApi'
import useAppSelector from '../../hooks/useAppSelector'

import cl from '../../styles/ui/dialog/dialog.module.css'
import messageCl from '../../styles/ui/message/message.module.css'

import { socket } from '../../utils'
import { socketControllers } from '../../utils/socket'

const cleanText = (input: string) => {
  const lines = input.split('\n').map((line) => line.trim())

  const cleanedLines: string[] = []
  let emptyCount = 0

  for (const line of lines) {
    if (line.length === 0) {
      emptyCount++
      if (emptyCount <= 3) {
        cleanedLines.push('')
      }
    } else {
      emptyCount = 0
      cleanedLines.push(line)
    }
  }

  return cleanedLines.join('\n').trim()
}

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g

  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a key={index} href={part} target='_blank' rel='noopener noreferrer'>
          {part}
        </a>
      )
    }
    return part
  })
}

const isDifferentDate = (date1: Date, date2: Date) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  return d1.getFullYear() !== d2.getFullYear() || d1.getMonth() !== d2.getMonth() || d1.getDate() !== d2.getDate()
}

type MessageType = {
  text: string
  userId: string
  id: string
  isReaded: boolean
  isEdited: boolean
  createdAt: Date
}

const Dialog: FC = () => {
  const { username } = useParams()
  const { t } = useTranslation('dialog')
  const navigate = useNavigate()
  const userId = useAppSelector((state) => state.authSlice.userId)
  const dateFormat = localStorage.getItem('language') === 'ru' ? 'ru-RU' : 'en-EN'
  const timeFormat = new Intl.DateTimeFormat(localStorage.getItem('language') === 'ru' ? 'ru-RU' : 'en-EN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: localStorage.getItem('language') === 'ru' ? false : true,
  })

  const {
    data: user,
    isFetching: isFetchingUser,
    isSuccess: isSuccessUser,
    isError: isErrorUser,
  } = useGetUserByUsernameQuery(username!, { skip: !username, refetchOnMountOrArgChange: true })
  const [isRecepientOnline, setIsRecepientOnline] = useState(false)

  const [
    lazyGetMessagesQuery,
    {
      data: getMessages,
      isFetching: isFethcingGetMessages,
      isSuccess: isSuccessGetMessages,
      isError: isErrorGetMessages,
    },
  ] = useLazyGetMessagesByUsersQuery()

  const { ref, inView } = useInView()
  const [page, setPage] = useState(1)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [messageText, setMessageText] = useState('')

  const [isShowEmojiPicker, setIsShowEmojiPicker] = useState(false)
  const isButtonDisabled = (cleanText(messageText) ? false : true) || !user || user.block !== 'false'
  const footerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [editMessageId, setEditMessageId] = useState('')
  const sendMessageFn = () => {
    if (isButtonDisabled) return
    setIsShowEmojiPicker(false)

    if (footerRef.current) {
      footerRef.current.style.height = ''
    }

    if (editMessageId) {
      socketControllers['edit_message'](editMessageId, cleanText(messageText), user.id)
      setEditMessageId('')
    } else {
      socketControllers['send_message'](cleanText(messageText), user.id)
    }
    setMessageText('')
  }

  const [modalData, setModalData] = useState<string>('')
  const [onConfirmFn, setOnConfirmFn] = useState<Function>(() => {})
  const [isShowModal, setIsShowModal] = useState(false)

  const dropdownMenuOptions: DropdownMenuOption[] = useMemo(
    () => [
      {
        label: t('deleteChatText'),
        onClick: () => {
          setIsShowModal(true)
          setModalData(t('deleteChatConfirmText'))
          setOnConfirmFn(() => () => socketControllers['delete_chat'](user?.id))
        },
      },

      user?.block === 'blocker'
        ? {
            label: t('unblockUserText'),
            onClick: () => {
              setIsShowModal(true)
              setModalData(`${t('unblockUserConfirmText')} ${user?.username}?`)
              setOnConfirmFn(() => () => {
                socketControllers['unblock_user'](user?.id)
                toast.success(`${t('unblockerText')} ${user?.username}`)
                navigate('/messages')
              })
            },
          }
        : {
            label: t('blockUserText'),
            onClick: () => {
              setIsShowModal(true)
              setModalData(`${t('blockUserConfirmText')} ${user?.username}?`)
              setOnConfirmFn(() => () => socketControllers['block_user'](user?.id))
            },
          },
    ],
    [t, user, navigate],
  )

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: t('copyMessageText'),
        onClick: ({ messageText }: { messageText: string }) => {
          navigator.clipboard.writeText(messageText)
        },
      },
      {
        label: t('editMessageText'),
        onClick: ({ messageText, messageId }: { messageText: string; messageId: string }) => {
          setMessageText(messageText)
          setEditMessageId(messageId)
          textareaRef.current?.focus()
        },
      },
      {
        label: t('deleteMessageText'),
        onClick: ({ messageId, recepientId }: { messageId: string; recepientId: string }) =>
          socketControllers['delete_message'](messageId, recepientId),
      },
    ],
    [t],
  )

  const [contextMenu, setContextMenu] = useState({
    options: [] as ContextMenuOption[],
    args: {} as Record<string, any>,
    leftDirection: false,
    posX: 0,
    posY: 0,
    isOpen: false,
  })

  useEffect(() => {
    if (!footerRef.current || !textareaRef.current) return

    footerRef.current.style.height = ''
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
    footerRef.current.style.height = textareaRef.current.scrollHeight + 'px'

    if (parseFloat(footerRef.current.style.height) > 10 * remInPx) {
      footerRef.current.style.height = 10 * remInPx + 'px'
    } else if (parseFloat(footerRef.current.style.height) < 5 * remInPx) {
      footerRef.current.style.height = 5 * remInPx + 'px'
    }
  }, [messageText])

  useEffect(() => {
    if (!user) return

    if (user.id === userId) {
      navigate('/messages', { replace: true })
    }

    setIsRecepientOnline(user.isOnline)

    if (user.block === 'blocker') {
      toast.warn(`${t('blockerText')} ${user.username}`)
    } else if (user.block === 'blocked') {
      toast.warn(`${t('blockedText')} ${user.username}`)
    }

    const receiveMessageHandler = (message: MessageType) => {
      setMessages((prev) => [message, ...prev])
    }

    const deleteChatHandler = () => {
      toast.warn(t('deletedChatText'))
      navigate('/messages', { replace: true })
    }

    const deleteMessageHandler = (messageId: string) => {
      setMessages((prev) => prev.filter((message) => message.id !== messageId))
    }

    const blockHandler = () => {
      toast.warn(t('terminateChatText'))
      navigate('/messages')
    }

    const editMessageHandler = (message: MessageType) => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? message : msg)))
    }

    const connectHandler = () => {
      socketControllers['join_chat'](user.id)
    }

    const userOnlineHandler = (id: string) => {
      if (user.id === id) setIsRecepientOnline(true)
    }

    const userOfflineHandler = (id: string) => {
      if (user.id === id) setIsRecepientOnline(false)
    }

    const joinChatHanlder = (messagesIds: string[]) => {
      setMessages((prev) =>
        prev.map((message) => (messagesIds.includes(message.id) ? { ...message, isReaded: true } : message)),
      )
    }

    socket.on('block_user', blockHandler)
    socket.on('receive_message', receiveMessageHandler)
    socket.on('edit_message', editMessageHandler)
    socket.on('delete_message', deleteMessageHandler)
    socket.on('delete_chat', deleteChatHandler)
    socket.on('user_online', userOnlineHandler)
    socket.on('user_offline', userOfflineHandler)
    socket.on('join_chat', joinChatHanlder)

    socket.on('connect', connectHandler)
    connectHandler()

    return () => {
      if (!user) return

      socketControllers['leave_chat'](user.id)
      socket.off('connect', connectHandler)

      socket.off('block_user', blockHandler)
      socket.off('receive_message', receiveMessageHandler)
      socket.off('edit_message', editMessageHandler)
      socket.off('delete_message', deleteMessageHandler)
      socket.off('delete_chat', deleteChatHandler)
      socket.off('user_online', userOnlineHandler)
      socket.off('user_offline', userOfflineHandler)
      socket.off('join_chat', joinChatHanlder)
    }
  }, [user, navigate, t, userId])

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

  useEffect(() => {
    if (inView && isSuccessGetMessages && !isFethcingGetMessages && getMessages.hasMore) {
      setPage((prev) => prev + 1)
    }
  }, [inView, isSuccessGetMessages, isFethcingGetMessages, getMessages])

  useEffect(() => {
    if (!isSuccessUser) return
    lazyGetMessagesQuery({ recepientId: user.id, page, limit: 10 })
  }, [isSuccessUser, user, lazyGetMessagesQuery, page])

  useEffect(() => {
    if (!isSuccessGetMessages) return
    setMessages((prev) => [...prev, ...getMessages.messages])
  }, [isSuccessGetMessages, getMessages])

  return (
    <>
      <div
        className={`${cl.layoutDiv} ${username ? cl.selected : ''}`}
        onClick={() => setContextMenu({ options: [], args: {}, leftDirection: false, posX: 0, posY: 0, isOpen: false })}
      >
        {isFetchingUser && (
          <div className={cl.loaderDiv}>
            <Loader />
          </div>
        )}

        {!isFetchingUser && user && (
          <>
            <header>
              <div>
                <span onClick={() => navigate('/messages')}>&#8592;</span>
                <Avatar userId={user.id} />
              </div>

              <div className={cl.userInfo}>
                <p>
                  <b>{username}</b>
                </p>
                <p className={isRecepientOnline ? cl.userOnline : cl.userOffline}>
                  {isRecepientOnline ? t('userOnlineText') : t('userOfflineText')}
                </p>
              </div>

              <DropdownMenu ulLeftDirection={true} options={dropdownMenuOptions} label='&#9432;' />
            </header>

            <main>
              {(isSuccessGetMessages || isErrorGetMessages) && !messages.length && (
                <p className={`${messageCl.message} ${messageCl.previewMessage}`}>{t('emptyDialogText')}</p>
              )}

              {messages && messages.length > 0 && (
                <>
                  {messages.map((message, index) => (
                    <Fragment key={message.id}>
                      <div
                        className={`${messageCl.message} ${userId === message.userId ? messageCl.myMessage : messageCl.recepientMessage}`}
                        onContextMenu={(event) => {
                          if (user.block !== 'false') return

                          event.preventDefault()
                          window.getSelection()?.removeAllRanges()

                          const isMyMessage = userId === message.userId

                          setContextMenu({
                            options: isMyMessage ? contextMenuOptions : [contextMenuOptions[0]],
                            args: {
                              messageId: message.id,
                              recepientId: user.id,
                              messageText: message.text,
                            },
                            leftDirection: isMyMessage,
                            posX: event.pageX,
                            posY: event.pageY,
                            isOpen: true,
                          })
                        }}
                      >
                        {editMessageId === message.id && (
                          <div className={messageCl.editButtonDiv}>
                            <span
                              onClick={() => {
                                setEditMessageId('')
                                setMessageText('')
                              }}
                            >
                              <b>&#10006;</b>
                            </span>
                          </div>
                        )}

                        <p>{linkify(message.text)}</p>

                        <div className={messageCl.infoDiv}>
                          {message.isEdited && (
                            <span>
                              <i>{t('editedMessageText')} </i>
                            </span>
                          )}

                          <span>{timeFormat.format(new Date(message.createdAt))} </span>
                          {message.userId === userId && (
                            <span className={message.isReaded ? `${messageCl.readedMessage}` : ''}>&#10004;</span>
                          )}
                        </div>
                      </div>

                      {index + 1 !== messages.length &&
                        isDifferentDate(message.createdAt, messages[index + 1].createdAt) && (
                          <div className={`${messageCl.message} ${messageCl.dateMessage}`}>
                            <p>{new Intl.DateTimeFormat(dateFormat).format(new Date(message.createdAt))}</p>
                          </div>
                        )}

                      {index + 1 === messages.length && (
                        <div className={`${messageCl.message} ${messageCl.dateMessage}`}>
                          <p>{new Intl.DateTimeFormat(dateFormat).format(new Date(message.createdAt))}</p>
                        </div>
                      )}
                    </Fragment>
                  ))}

                  <div ref={ref} style={{ height: '1px', width: '1px' }} />
                </>
              )}

              {isFethcingGetMessages && (
                <div className={cl.loaderDiv}>
                  <Loader />
                </div>
              )}
            </main>

            <footer ref={footerRef}>
              <img src='/img/emoji-button.webp' alt='' onClick={() => setIsShowEmojiPicker((prev) => !prev)} />

              <textarea
                ref={textareaRef}
                placeholder={t('messageTextareaPlaceholderText')}
                value={messageText}
                onChange={(event) => {
                  setMessageText(event.currentTarget.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && event.shiftKey) {
                    event.preventDefault()
                    sendMessageFn()
                  }
                }}
              />

              <img
                className={isButtonDisabled ? cl.disabled : ''}
                src='/img/send-message-button.webp'
                alt=''
                onClick={sendMessageFn}
              />

              <EmojiPicker
                className={cl.emojiPickerContainer}
                onEmojiClick={(event) => {
                  setMessageText((prev) => prev + event.emoji)
                  localStorage.removeItem('epr_suggested')
                }}
                previewConfig={{ showPreview: false }}
                theme={localStorage.getItem('theme') === 'dark' ? Theme.DARK : Theme.LIGHT}
                emojiStyle={EmojiStyle.NATIVE}
                searchDisabled={true}
                skinTonesDisabled={true}
                open={isShowEmojiPicker}
              />
            </footer>
          </>
        )}
      </div>

      <ContextMenu
        onClick={() => setContextMenu({ options: [], args: {}, leftDirection: false, posX: 0, posY: 0, isOpen: false })}
        args={contextMenu.args}
        leftDirection={contextMenu.leftDirection}
        posX={contextMenu.posX}
        posY={contextMenu.posY}
        isOpen={contextMenu.isOpen}
        options={contextMenu.options}
      />

      <Modal
        isOpen={isShowModal}
        modalData={modalData}
        onClose={() => setIsShowModal(false)}
        onConfirm={() => onConfirmFn()}
      />
    </>
  )
}

export default Dialog
