import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      injectManifest:{
        swSrc: 'public/sw.js', // 👈 path absoluto
        swDest: 'public/sw.js',
      },
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
})
