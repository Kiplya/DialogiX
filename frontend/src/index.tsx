import { createRoot } from 'react-dom/client'

import App from './App'
import './utils/translations'
import './styles/index/index.css'
import './styles/ui/button/button.css'
import './styles/ui/input/input.css'
import './styles/ui/textarea/textarea.css'
import './styles/ui/emojiPicker/emojiPicker.css'

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
