<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50">
      <!-- Спиннер -->
      <div class="relative mb-6">
        <div class="w-20 h-20 rounded-full border-4 border-gray-200"></div>
        <div class="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <UIcon name="i-lucide-utensils" class="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <!-- Текст -->
      <p class="text-gray-600 font-medium mb-2">{{ loadingText }}</p>

      <!-- Прогресс -->
      <div class="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <!-- Советы -->
      <p class="text-xs text-gray-400 mt-6 max-w-xs text-center">
        💡 {{ tips[currentTip] }}
      </p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const isLoading = ref(false)
const progress = ref(0)
const currentTip = ref(0)
let progressInterval: NodeJS.Timeout

const tips = [
  'Планируйте меню на неделю всего за 10 минут',
  'Экономьте до 35% бюджета на продукты',
  '15,000+ пользователей уже с нами',
  'Добавляйте свои рецепты в один клик',
  'Синхронизируйте список покупок с семьей'
]

// Смена советов
let tipInterval: NodeJS.Timeout

const startLoading = () => {
  isLoading.value = true
  progress.value = 0

  // Анимация прогресса
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 150)

  // Смена советов
  currentTip.value = Math.floor(Math.random() * tips.length)
  tipInterval = setInterval(() => {
    currentTip.value = (currentTip.value + 1) % tips.length
  }, 3000)
}

const finishLoading = () => {
  clearInterval(progressInterval)
  clearInterval(tipInterval)
  progress.value = 100

  setTimeout(() => {
    isLoading.value = false
    progress.value = 0
  }, 400)
}

onNuxtReady(() => {
  window.addEventListener('nuxt:beforeNavigate', startLoading)
  window.addEventListener('nuxt:afterNavigate', finishLoading)

  // При клике на ссылки
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href')?.startsWith('/') && !link.getAttribute('target')) {
        startLoading()
      }
    })
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
