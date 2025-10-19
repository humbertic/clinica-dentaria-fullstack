import type { DefineComponent } from 'vue'

declare module 'vue-cal/dist/vue-cal.es.js' {
  const VueCal: DefineComponent<{}, {}, any>
  export default VueCal
}