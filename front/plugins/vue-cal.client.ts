import { defineNuxtPlugin } from 'nuxt/app'
import VueCal from 'vue-cal/dist/vue-cal.es.js'
import 'vue-cal/dist/vuecal.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueCal', VueCal)
})