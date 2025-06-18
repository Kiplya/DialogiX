import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'

import path from 'path'

dotenv.config()
const sharedPath = process.env.SHARED_PATH
const port = process.env.PORT

if (!sharedPath) {
  throw new Error('SHARED_PATH is undefined')
}

if (!port) {
  throw new Error('PORT is undefined')
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, sharedPath),
    },
  },
  server: {
    port: parseInt(port),
  },
})
