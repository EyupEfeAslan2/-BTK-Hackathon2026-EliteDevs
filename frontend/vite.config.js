import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setupTests.js',
    include: ['src/tests/**/*.{test,spec}.{js,jsx}'],
    restoreMocks: true,
  },
})
