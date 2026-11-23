import type { Pinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * Persistence lives in a client-only plugin: on the server there is no
 * localStorage, and Vue would otherwise warn about accessing it during SSR.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as Pinia | undefined
  if (!pinia) return
  pinia.use(piniaPluginPersistedstate)
})
