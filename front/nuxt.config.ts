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
    enabled: true,

    timeline: {
      enabled: true,
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
      apiBase: "http://localhost:8000/", // ajuste conforme seu backend
    },
  },
});
