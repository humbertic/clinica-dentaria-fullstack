import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})