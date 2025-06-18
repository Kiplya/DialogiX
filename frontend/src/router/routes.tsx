import { ReactElement } from 'react'

import AuthorizationPage from '../pages/AuthorizationPage'
import MessagesPage from '../pages/MessagesPage'
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

export const privateRoutes: AppRoute[] = [{ path: '/messages', element: <MessagesPage /> }]

export const adminRoutes: AppRoute[] = []
