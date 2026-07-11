// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-03-06',

  ssr: true,

  devtools: {
    enabled: process.env.NODE_ENV !== 'production'
  },

  sourcemap: false,

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@vite-pwa/nuxt'
  ],

  // ==================== ICONS ====================
  icon: {
    provider: 'iconify',
    serverBundle: {
      collections: ['lucide']
    }
  },

  ui: {
    colorMode: false,
    icons: {
      clientBundle: {
        scan: true,
        sizeLimitKb: 512
      },
      dynamic: true
    }
  },

  // ==================== APP ====================
  app: {
    baseURL: '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=1, viewport-fit=cover',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'description', content: 'Ayeda — сервис рецептов и планирования меню' },
        { name: 'og:site_name', content: 'Ayeda' },
        { name: 'og:type', content: 'website' },
        { name: 'og:title', content: 'Ayeda — Кулинарные рецепты и планирование меню' },
        { name: 'og:description', content: 'Ayeda — сервис рецептов и планирования меню' },
        { name: 'og:image', content: '/og-image.jpg' },
        { name: 'og:image:width', content: '1200' },
        { name: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Ayeda — Кулинарные рецепты и планирование меню' },
        { name: 'twitter:description', content: 'Ayeda — сервис рецептов и планирования меню' },
        { name: 'twitter:image', content: '/og-image.jpg' },
        { name: 'yandex-verification', content: '7f3f124077fe2229' },
        // PWA meta
        { name: 'theme-color', content: '#166534' },
        { name: 'msapplication-TileColor', content: '#166534' },
        { name: 'msapplication-TileImage', content: '/pwa-icons/pwa-144x144.png' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Ayeda' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        // Favicon
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        // PWA
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        // Preconnect для шрифтов
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
      ]
    }
  },

  // ==================== VITE ====================
  vite: {
    build: {
      sourcemap: false
    },
    css: {
      devSourcemap: false
    }
  },

  // ==================== NITRO ====================
  nitro: {
    preset: 'node-server',
    sourcemap: false,

    storage: {
      cache: {
        driver: 'fs',
        base: './.output/cache'
      }
    },

    experimental: {
      openAPI: true
    }
  },

  // ==================== ROUTE RULES ====================
  routeRules: {
    '/': { ssr: true },
    '/about': { prerender: true },
    '/offer': { prerender: true },
    '/policy': { prerender: true },
    '/support': { prerender: true },
    '/in-development': { prerender: true },

    '/recipes': { ssr: true },
    '/recipes/**': { ssr: true },
    '/blog': { ssr: true },
    '/blog/**': { ssr: true },

    '/cabinet/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/reset-password': { ssr: false },
    '/verify-email': { ssr: false },

    '/api/**': {
      proxy: {
        to: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      }
    },
  },

  // ==================== PWA ====================
  pwa: {
    registerType: 'autoUpdate',

    // Используем готовый manifest.webmanifest
    manifest: false,

    // Или можно закомментировать manifest: false и использовать встроенный:
    // manifest: {
    //   name: 'Ayeda',
    //   short_name: 'Ayeda',
    //   description: 'Кулинарные рецепты и списки покупок',
    //   theme_color: '#166534',
    //   background_color: '#ffffff',
    //   display: 'standalone',
    //   start_url: '/',
    //   scope: '/',
    //   orientation: 'portrait-primary',
    //   categories: ['food', 'lifestyle', 'utilities'],
    //   lang: 'ru',
    //   dir: 'ltr',
    //   icons: [
    //     {
    //       src: '/pwa-icons/pwa-72x72.png',
    //       sizes: '72x72',
    //       type: 'image/png',
    //       purpose: 'any'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-96x96.png',
    //       sizes: '96x96',
    //       type: 'image/png',
    //       purpose: 'any'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-128x128.png',
    //       sizes: '128x128',
    //       type: 'image/png',
    //       purpose: 'any'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-144x144.png',
    //       sizes: '144x144',
    //       type: 'image/png',
    //       purpose: 'any'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-152x152.png',
    //       sizes: '152x152',
    //       type: 'image/png',
    //       purpose: 'any'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-192x192.png',
    //       sizes: '192x192',
    //       type: 'image/png',
    //       purpose: 'any maskable'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-384x384.png',
    //       sizes: '384x384',
    //       type: 'image/png',
    //       purpose: 'any maskable'
    //     },
    //     {
    //       src: '/pwa-icons/pwa-512x512.png',
    //       sizes: '512x512',
    //       type: 'image/png',
    //       purpose: 'any maskable'
    //     }
    //   ],
    //   shortcuts: [
    //     {
    //       name: 'Рецепты',
    //       url: '/recipes',
    //       description: 'Просмотр рецептов'
    //     },
    //     {
    //       name: 'Мои рецепты',
    //       url: '/cabinet/my-recipes',
    //       description: 'Мои рецепты'
    //     },
    //     {
    //       name: 'Списки покупок',
    //       url: '/cabinet/shopping-lists',
    //       description: 'Мои списки покупок'
    //     },
    //     {
    //       name: 'Планировщик меню',
    //       url: '/cabinet/menu-planner',
    //       description: 'Планирование меню'
    //     }
    //   ]
    // },

    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webp,json,webmanifest}'],
      runtimeCaching: [
        {
          urlPattern: /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.ayeda\.ru\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 1 день
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
            }
          }
        }
      ]
    },

    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },

    devOptions: {
      enabled: process.env.NODE_ENV !== 'production',
      type: 'module'
    }
  },

  // ==================== RUNTIME CONFIG ====================
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,

    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE_URL || 'https://ayeda.ru/api/v1',
      apiUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://ayeda.ru'
    }
  },

  // ==================== TYPESCRIPT ====================
  typescript: {
    strict: true,
    typeCheck: false
  }
})
