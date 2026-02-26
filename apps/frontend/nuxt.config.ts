// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vee-validate/nuxt",
  ],

  // Алиасы (по умолчанию уже работают)
  alias: {
    "~": "/",
    "@": "/",
  },

  devtools: { enabled: true },

  pwa: {
    manifest: {
      name: "Ayeda",
      short_name: "Ayeda",
      description: "Сервис планирования питания",
      theme_color: "#ffffff",
    },
  },

  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
    },
  },
});
