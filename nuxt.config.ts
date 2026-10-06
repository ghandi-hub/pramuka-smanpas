// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  site: {
    url: process.env.BASE_URL,
    name: "Pramuka SMA Negeri 1 Pasawahan",
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    mongodbDatabase: process.env.MONGODB_DATABASE || "pramuka_db",
    emailUser: process.env.EMAIL_SMTP_USER,
    emailPassword: process.env.EMAIL_SMTP_PASS,
    emailHost: process.env.EMAIL_SMTP_HOST,
    emailPort: process.env.EMAIL_SMTP_PORT,
    emailSecure: process.env.EMAIL_SMTP_SECURE,
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioPort: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined,
    minioUseSsl: process.env.MINIO_USE_SSL === "true",
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioBucket: process.env.MINIO_BUCKET,
    minioPublicUrl: process.env.MINIO_PUBLIC_URL,
    public: {
      siteUrl: process.env.BASE_URL,
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@panzoom/panzoom",
        "@vueuse/core",
        "lucide-vue-next",
        "class-variance-authority",
        "reka-ui",
        "clsx",
        "tailwind-merge",
        "@tanstack/vue-table",
      ],
    },
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    preset: "bun",
  },
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: ["shadcn-nuxt", "@nuxtjs/i18n", "@nuxtjs/sitemap"],
  i18n: {
    locales: [
      { code: "en", language: "en-US", file: "en.json" },
      { code: "id", language: "id-ID", file: "id.json" },
    ],
    defaultLocale: "id",
  },
  app: {
    head: {
      htmlAttrs: { lang: "id" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "%s - Pramuka SMA Negeri 1 Pasawahan",
      meta: [
        { name: "theme-color", content: "#1a1a2e" },
        { name: "author", content: "Pramuka SMA Negeri 1 Pasawahan" },
        { property: "og:site_name", content: "Pramuka SMA Negeri 1 Pasawahan" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "id_ID" },
        { property: "og:locale:alternate", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [
        { rel: "canonical", href: process.env.BASE_URL },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Outfit:wght@100..900&display=swap",
        },
      ],
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
});
