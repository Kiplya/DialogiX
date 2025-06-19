import { ReactElement } from 'react'

import AuthorizationPage from '../pages/AuthorizationPage'
import MessagesLayout from '../pages/MessagesLayout'
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

export const privateRoutes: AppRoute[] = [{ path: '/messages', element: <MessagesLayout /> }]

export const adminRoutes: AppRoute[] = []
