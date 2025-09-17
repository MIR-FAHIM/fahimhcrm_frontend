import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
// base: '/hcrm/', // Important: matches your URL path
  plugins: [react()],
})