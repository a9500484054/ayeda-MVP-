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
    '@nuxt/icon',        // ✅ FIX: нормальная поддержка iconify/lucide
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@vite-pwa/nuxt'
  ],

  // ==================== ICONS ====================
  icon: {
    provider: 'iconify',
    serverBundle: {
      collections: ['lucide'] // ✅ фикс для lucide:* иконок
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

  app: {
    baseURL: '/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'description', content: 'Ayeda — сервис рецептов и планирования меню' },
        { name: 'og:site_name', content: 'Ayeda' },
        { name: 'og:type', content: 'website' },
        { name: "yandex-verification", content: "7f3f124077fe2229" }

      ],
      link: [{ rel: 'icon', href: '/favicon.ico' }]
    }
  },

  vite: {
    build: {
      sourcemap: false
    },
    css: {
      devSourcemap: false // ✅ убирает Tailwind sourcemap warnings
    }
  },

  nitro: {
    preset: 'node-server',
    sourcemap: false,

    storage: {
      cache: {
        driver: 'fs',
        base: './.output/cache' // ✅ Добавьте базовую директорию
      }
    },

    experimental: {
      openAPI: true
    }
  },

  routeRules: {
    '/': { ssr: false },
    '/about': { prerender: true },
    '/offer': { prerender: true },
    '/policy': { prerender: true },
    '/support': { prerender: true },
    '/in-development': { prerender: true },

    '/recipes': { ssr: true },
    '/recipes/**': { ssr: true },
    '/blog': { ssr: true },
    '/blog/**': { ssr: true },

    // '/recipes/search': { swr: 600 },
    // '/blog/search': { swr: 600 },

    '/cabinet/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/reset-password': { ssr: false },
    '/verify-email': { ssr: false },

    '/api/**': {
      proxy: {
        to: process.env.NUXT_PUBLIC_API_BASE_URL || 'hhttp://localhost:3001/api/v1'
      }
    },

  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'АУеда',
      short_name: 'АУеда',
      description: 'Кулинарные рецепты и списки покупок',
      theme_color: '#166534',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },

    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webp}'],
      runtimeCaching: [
        {
          urlPattern: /\.(png|jpg|jpeg|svg|webp|gif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
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
              maxAgeSeconds: 60 * 60 * 24
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

  typescript: {
    strict: true,
    typeCheck: false
  }
})
