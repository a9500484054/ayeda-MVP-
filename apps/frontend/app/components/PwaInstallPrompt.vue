<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
    <div class="rounded-xl bg-white shadow-xl border border-zinc-200 p-4 animate-in slide-in-from-bottom-2 duration-300">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <img src="/icons/icon-144x144.png" alt="АУеда" class="h-12 w-12 rounded-xl" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-zinc-900">Установить приложение</h3>
          <p class="text-sm text-zinc-600 mt-0.5">Быстрый доступ к рецептам на главном экране</p>
          <div class="flex gap-2 mt-3">
            <Button size="sm" @click="installApp">
              Установить
            </Button>
            <Button variant="ghost" size="sm" @click="dismissPrompt">
              Не сейчас
            </Button>
          </div>
        </div>
        <button
          @click="dismissPrompt"
          class="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showInstallPrompt = ref(false)
let deferredPrompt: any = null

// Слушаем событие beforeinstallprompt
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    // Показываем промпт только если пользователь не отклонил ранее
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (!dismissed) {
      showInstallPrompt.value = true
    }
  })
})

const installApp = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('PWA установлено')
    showInstallPrompt.value = false
  }

  deferredPrompt = null
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
}
</script>
