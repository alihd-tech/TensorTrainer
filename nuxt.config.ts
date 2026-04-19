export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: ["@nuxthub/core"], // Remove "nitro-cloudflare-dev"

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  nitro: {
    preset: "cloudflare-pages", // Try this instead of cloudflare_module
    
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
})