import { ReactElement } from 'react'

import Dialog from '../components/ui/Dialog'
import DialogsList from '../components/ui/DialogsList'
import AuthorizationPage from '../pages/AuthorizationPage'
import ProfilePage from '../pages/ProfilePage'
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
    element: <DialogsList />,
    children: [
      {
        path: ':username',
        element: <Dialog />,
      },
    ],
  },
  { path: '/profile', element: <ProfilePage /> },
]

export const adminRoutes: AppRoute[] = []
