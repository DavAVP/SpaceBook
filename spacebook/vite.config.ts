import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: ".",
      filename: "servicesWorker.js",
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest:{
        name: 'SpaceBook',
        short_name: 'MyApp',
        description: 'Spacebook',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome'
          }
        ]
      }
    })
  ],
<<<<<<< HEAD
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts'
=======
  // @ts-expect-error - Vitest config is valid but TypeScript doesn't recognize it
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    env: true,            
>>>>>>> 5ef04a4db080e9f245fa97e828b31512bdc65211
  }
})
