import { FC } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'

import { publicRoutes, privateRoutes, adminRoutes } from './routes'

import RouterLayout from '../components/RouterLayout'
import useAppSelector from '../hooks/useAppSelector'
import ErrorPage from '../pages/ErrorPage'

const AppRouter: FC = () => {
  let routes = publicRoutes
  const isAuth = useAppSelector((state) => state.authSlice.isAuth)
  const isAdmin = useAppSelector((state) => state.authSlice.isAdmin)

  if (isAuth) {
    routes = isAdmin ? [...privateRoutes, ...adminRoutes] : privateRoutes
  }

  const router = createBrowserRouter([
    {
      element: <RouterLayout />,
      children: [
        ...routes,
        {
          path: '*',
          element: <Navigate to={isAuth ? '/messages' : '/login'} replace />,
        },
      ],
      errorElement: <ErrorPage />,
    },
  ])

  return <RouterProvider router={router} />
}

export default AppRouter
