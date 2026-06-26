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
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@vite-pwa/nuxt'
  ],

  ui: {
    colorMode: false,
    icons: {
      clientBundle: {
      // Автоматически сканирует компоненты в проекте на наличие <UIcon name="...">
      scan: true,

      // Можно также указать явно, если автопоиск не сработает:
      // icons: ['lucide:menu', 'lucide:x', 'lucide:utensils'],

      // Размер бандла (опционально)
      sizeLimitKb: 256,
    }
    },
    // icons: {
    //   dynamic: true
    // }
  },
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: {
        lang: 'ru'
      }
    }
  },

  vite: {
    build: {
      sourcemap: false
    }
  },

  nitro: {
    sourceMap: false,
    compressPublicAssets: true,

    // ✅ ВКЛЮЧАЕМ CRAWLER PRERENDER
    prerender: {
      crawlLinks: true
    }
  },

  /**
   * ROUTE RULES
   */
  routeRules: {
    // SEO static pages
    '/': { prerender: true },
    '/about': { prerender: true },
    '/support': { prerender: true },
    '/policy': { prerender: true },
    '/offer': { prerender: true },

    // ⚠️ теперь blog и recipes тоже участвуют в prerender
    '/blog/**': { prerender: true },
    '/recipes/**': { prerender: true },

    '/terms': { ssr: true },
    '/privacy': { ssr: true },

    // auth SPA
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/reset-password': { ssr: false },
    '/verify-email': { ssr: false },

    // private areas SPA
    '/cabinet/**': { ssr: false },
    '/admin/**': { ssr: false }
  },

  pwa: {
    registerType: 'autoUpdate',

    manifest: {
      name: 'АУеда',
      short_name: 'АУеда',
      description: 'Кулинарные рецепты и списки покупок',

      theme_color: '#f97316',
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
      navigateFallback: undefined,

      cleanupOutdatedCaches: true,

      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webp}'],

      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.ayeda\.ru\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },

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
    apiSecret: process.env.NUXT_API_SECRET || '',

    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,

    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE_URL ||
        'https://ayeda.ru/api/v1',

      apiUrl:
        process.env.NUXT_PUBLIC_APP_URL ||
        'https://ayeda.ru'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
