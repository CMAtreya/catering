import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png',
        'logo.webp',
        'logo-128.webp',
        'logo.svg',
        'logo.png',
        'admin.webmanifest'
      ],
      manifest: {
        name: 'TKS Iyengars Catering',
        short_name: 'TKS Catering',
        description: 'Royal Banquets & Elite Catering Experience. Handcrafted menus, authentic South Indian delicacies, and live feast calculations.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F7F8',
        theme_color: '#b60a06',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'My enquiries',
            short_name: 'Enquiries',
            description: 'View saved catering enquiries and past banquet estimates',
            url: '/enquiries',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', '**/hero-3d*.js', '**/models/**'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/admin\.webmanifest$/, /^\/api/],
        runtimeCaching: [
          // 1. CacheFirst for all images (cache 'images', max 150 entries, 30 days)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 2. StaleWhileRevalidate for catalogue API (cache 'catalogue')
          {
            urlPattern: ({ url }) => url.pathname.includes('/catalogue'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'catalogue',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 3. Never cache admin login, order, customer or invoice API responses with CacheFirst
          {
            urlPattern: ({ url }) => (
              url.pathname.includes('/admin') ||
              url.pathname.includes('/orders') ||
              url.pathname.includes('/customers') ||
              url.pathname.includes('/login') ||
              url.pathname.includes('/invoice')
            ),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'admin-dynamic-data',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        suppressWarnings: true
      }
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('detect-gpu')) {
              return 'hero-3d'
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('jspdf-autotable')) {
              return 'vendor-pdf'
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('motion')) {
              return 'vendor-motion'
            }
            if (id.includes('react-dom') || id.includes('react-router') || (id.includes('/react/') && !id.includes('lucide'))) {
              return 'vendor-react'
            }
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
