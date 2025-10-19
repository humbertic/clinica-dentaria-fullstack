import { defineNuxtConfig } from "nuxt/config";
import { resolve } from "path";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  app: {
    head: {
      title: "Clinica ProDente",
      meta: [{ name: "description", content: "Clinica ProDente" }],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
    pageTransition: {
      name: "fade",
      mode: "out-in",
    },
  },

  logLevel: "silent",
  devtools: {
    enabled: false,

    timeline: {
      enabled: false,
    },
  },

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  vite: {
    resolve: {
      alias: {
        "@": resolve(new URL(".", import.meta.url).pathname),
      },
    },
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE_URL || "http://localhost:8000/",
    },
  },
});
