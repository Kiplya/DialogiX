import { FC } from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AuthController from './components/AuthController'
import AppRouter from './router/AppRouter'
import { store } from './store/index'
import { socket } from './utils/index'

window.addEventListener('beforeunload', () => {
  if (socket.connected) {
    socket.disconnect()
  }
})

const App: FC = () => (
  <Provider store={store}>
    <AuthController>
      <AppRouter />
      <ToastContainer hideProgressBar={true} autoClose={2000} position='bottom-center' />
    </AuthController>
  </Provider>
)

export default App
