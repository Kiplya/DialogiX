import { ReactElement } from 'react'

import Dialog from '../components/ui/Dialog'
import MessagesList from '../components/ui/MessagesList'
import AuthorizationPage from '../pages/AuthorizationPage'
import RegistrationPage from '../pages/RegistrationPage'

type AppRoute = {
  path: string
  element: ReactElement
  children?: AppRoute[]
}

export const publicRoutes: AppRoute[] = [
  { path: '/login', element: <AuthorizationPage /> },
  { path: '/registration', element: <RegistrationPage /> },
]

export const privateRoutes: AppRoute[] = [
  {
    path: '/messages',
    element: <MessagesList />,
    children: [
      {
        path: ':username',
        element: <Dialog />,
      },
    ],
  },
]

export const adminRoutes: AppRoute[] = []
