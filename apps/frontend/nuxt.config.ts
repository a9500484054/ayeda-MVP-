// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-03-06",
  ssr: true,

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vee-validate/nuxt",
  ],

  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false,
  },

  pwa: {
    manifest: {
      name: "Ayeda",
      short_name: "Ayeda",
      description: "Сервис планирования питания",
      theme_color: "#ffffff",
    },
  },

  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET || "",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1",
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || "",
      yandexMetricaId: process.env.NUXT_PUBLIC_YANDEX_METRICA_ID || "",
    },
  },

  routeRules: {
    "/": { prerender: true },
    "/recipes/**": { ssr: true, swr: 3600 },
    "/blog/**": { ssr: true, swr: 3600 },
    "/about": { ssr: true },
    "/policy": { ssr: true },
    "/offer": { ssr: true },
    "/cabinet/**": { ssr: false },
    "/admin/**": { ssr: false },
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
