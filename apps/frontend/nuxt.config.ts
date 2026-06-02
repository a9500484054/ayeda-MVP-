// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-03-06",
  ssr: true,
  sourcemap: false,  // отключает генерацию sourcemap
  nitro: {
    sourceMap: false,
    prerender: {
      routes: [
       '/',
        '/about',
        '/support',
        '/policy',
        '/offer',
        '/verify-email',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ],
      crawlLinks: true
    }
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vee-validate/nuxt",
    '@vite-pwa/nuxt',
  ],

  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false,
  },

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'АУеда',
      short_name: 'АУеда',
      description: 'Кулинарные рецепты и списки покупок',
      theme_color: '#f97316',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
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
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.ayeda\.ru\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 24 часа
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\.(png|jpg|jpeg|svg|webp|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 50,
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
      enabled: process.env.NODE_ENV === 'production' ? false : true,
      type: 'module'
    }
  },

  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET || "",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1",
      apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://localhost:3001", // Добавьте эту строку
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || "",
      yandexMetricaId: process.env.NUXT_PUBLIC_YANDEX_METRICA_ID || "",
    },
  },

  routeRules: {
    "/": { prerender: true },
    "/about": { prerender: true },
    "/support": { prerender: true },
    "/policy": { prerender: true },
    "/offer": { prerender: true },
    "/verify-email": { prerender: true },
    "/login": { prerender: true },
    "/register": { prerender: true },
    "/recipes/**": { ssr: true },
    "/blog/**": { ssr: true },
    "/cabinet/**": { ssr: false },
    "/admin/**": { ssr: false }
  },

  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: true,
      },
    },
  },
});
