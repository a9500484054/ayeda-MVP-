import { defineNuxtPlugin } from '#app'
import { addCollection } from '@iconify/vue'
import lucide from '@iconify-json/lucide/icons.json'

export default defineNuxtPlugin((nuxtApp) => {
  addCollection(lucide)
})
