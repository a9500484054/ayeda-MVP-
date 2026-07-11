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
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
  ],

  // ==================== SITE CONFIG (для sitemap) ====================
  site: {
    url: process.env.NUXT_PUBLIC_APP_URL || 'https://ayeda.ru'
  },

  // ==================== SITEMAP ====================
  sitemap: {
    hostname: process.env.NUXT_PUBLIC_APP_URL || 'https://ayeda.ru',

    exclude: [
      '/admin/**',
      '/cabinet/**',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/demo/**',
      '/pwa-install',
      '/in-development',
      '/offline',
      '/shared/**',
    ],

    defaults: {
      changefreq: 'daily',
      priority: 0.5,
      lastmod: () => new Date().toISOString(),
    },

    autoLastmod: true,
    trailingSlash: false,
    gzip: true,
    cacheMaxAgeSeconds: 60 * 60 * 24,

    include: [
      '/',
      '/about',
      '/recipes',
      '/ingredients',
      '/blog',
      '/support',
      '/policy',
      '/offer',
    ],

    // ==================== ДИНАМИЧЕСКИЕ URL ИЗ API ====================
    urls: async () => {
      console.log('🚀 Sitemap: Начинаем генерацию динамических URL...')

      const dynamicUrls: any[] = []
      const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      const appUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3001'

      console.log(`📍 APP URL: ${appUrl}`)
      console.log(`📍 API URL: ${apiBaseUrl}`)

      const now = new Date().toISOString()

      // ============================================================
      // 1. РЕЦЕПТЫ
      // ============================================================
      try {
        console.log('📡 Запрашиваем рецепты...')
        let allRecipes: any[] = []
        let page = 1
        const limit = 100
        let hasNext = true

        while (hasNext) {
          const url = `${apiBaseUrl}/recipes?status=public&page=${page}&limit=${limit}`
          console.log(`📡 Запрос: ${url}`)

          const response = await fetch(url)

          if (!response.ok) {
            console.error(`❌ Ошибка получения рецептов: ${response.status}`)
            break
          }

          const data = await response.json()
          const items = data?.data || []

          if (items.length === 0) break

          allRecipes = allRecipes.concat(items)

          // Проверяем наличие следующей страницы
          hasNext = data?.hasNext === true

          // Альтернативная проверка через pages
          if (!hasNext && data?.pages && page >= data.pages) {
            hasNext = false
          }

          page++

          // Защита от бесконечного цикла
          if (page > 100) {
            console.warn('⚠️ Достигнут лимит страниц (100) для рецептов')
            break
          }
        }

        console.log(`✅ Найдено рецептов: ${allRecipes.length}`)

        dynamicUrls.push(
          ...allRecipes.map((recipe: any) => ({
            loc: `/recipes/${recipe.srcPath}`,
            lastmod: recipe.updatedAt?.split('T')[0] || now,
            changefreq: 'weekly',
            priority: 0.8,
            images: recipe.photo?.src ? [{ loc: recipe.photo.src }] : undefined,
          }))
        )
      } catch (error) {
        console.error('❌ Ошибка при получении рецептов:', error)
      }

      // ============================================================
      // 2. СТАТЬИ БЛОГА
      // ============================================================
      try {
        console.log('📡 Запрашиваем статьи...')
        let allArticles: any[] = []
        let page = 1
        const limit = 100
        let hasNext = true

        while (hasNext) {
          const url = `${apiBaseUrl}/articles?status=published&page=${page}&limit=${limit}`
          console.log(`📡 Запрос: ${url}`)

          const response = await fetch(url)

          if (!response.ok) {
            console.error(`❌ Ошибка получения статей: ${response.status}`)
            break
          }

          const data = await response.json()
          const items = data?.items || []

          if (items.length === 0) break

          allArticles = allArticles.concat(items)

          // Проверяем наличие следующей страницы
          hasNext = data?.hasNext === true

          // Альтернативная проверка через pages
          if (!hasNext && data?.pages && page >= data.pages) {
            hasNext = false
          }

          page++

          // Защита от бесконечного цикла
          if (page > 100) {
            console.warn('⚠️ Достигнут лимит страниц (100) для статей')
            break
          }
        }

        console.log(`✅ Найдено статей: ${allArticles.length}`)

        dynamicUrls.push(
          ...allArticles.map((article: any) => ({
            loc: `/blog/${article.slug}`,
            lastmod: article.updated_at?.split('T')[0] || now,
            changefreq: 'weekly',
            priority: 0.7,
            images: article.featured_image ? [{ loc: article.featured_image }] : undefined,
          }))
        )
      } catch (error) {
        console.error('❌ Ошибка при получении статей:', error)
      }

      // ============================================================
      // 3. ИНГРЕДИЕНТЫ
      // ============================================================
      try {
        console.log('📡 Запрашиваем ингредиенты...')
        let allIngredients: any[] = []
        let page = 1
        const limit = 100
        let hasNext = true

        while (hasNext) {
          const url = `${apiBaseUrl}/ingredients?page=${page}&limit=${limit}`
          console.log(`📡 Запрос: ${url}`)

          const response = await fetch(url)

          if (!response.ok) {
            console.error(`❌ Ошибка получения ингредиентов: ${response.status}`)
            break
          }

          const data = await response.json()
          const items = data?.data || []

          if (items.length === 0) break

          allIngredients = allIngredients.concat(items)

          // Проверяем наличие следующей страницы
          hasNext = data?.hasNext === true

          // Альтернативная проверка через pages
          if (!hasNext && data?.pages && page >= data.pages) {
            hasNext = false
          }

          page++

          // Защита от бесконечного цикла
          if (page > 100) {
            console.warn('⚠️ Достигнут лимит страниц (100) для ингредиентов')
            break
          }
        }

        console.log(`✅ Найдено ингредиентов: ${allIngredients.length}`)

        dynamicUrls.push(
          ...allIngredients.map((ingredient: any) => ({
            loc: `/ingredients/${ingredient.srcPath}`,
            lastmod: ingredient.updatedAt?.split('T')[0] || now,
            changefreq: 'monthly',
            priority: 0.6,
            images: ingredient.photo ? [{ loc: ingredient.photo }] : undefined,
          }))
        )
      } catch (error) {
        console.error('❌ Ошибка при получении ингредиентов:', error)
      }

      console.log(`✅ Sitemap готов: ${dynamicUrls.length} динамических URL`)
      console.log(`📋 Всего URL в sitemap: ${dynamicUrls.length + 8} (включая статические)`)

      return dynamicUrls
    },
  },

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
        { name: 'theme-color', content: '#166534' },
        { name: 'msapplication-TileColor', content: '#166534' },
        { name: 'msapplication-TileImage', content: '/pwa-icons/pwa-144x144.png' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Ayeda' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
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
    '/sitemap.xml': { prerender: true },
    '/robots.txt': { prerender: true },
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
    manifest: false,

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
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30
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

  // ==================== RUNTIME CONFIG ====================
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHAT_ID,

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://ayeda.ru/api/v1',
      apiUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://ayeda.ru'
    }
  },

  // ==================== TYPESCRIPT ====================
  typescript: {
    strict: true,
    typeCheck: false
  }
})
