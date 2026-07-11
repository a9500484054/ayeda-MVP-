<template>
  <div class="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4 md:p-8">
    <!-- Декоративный фон -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-gradient-radial from-[#1e2a3a] to-[#0a0d12]"></div>
      <div class="absolute inset-0 opacity-[0.05] bg-pattern"></div>
      <div class="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-[rgba(13,15,20,0.7)] to-transparent"></div>
    </div>

    <!-- Основной контейнер -->
    <div class="relative z-10 w-full max-w-4xl bg-[#14181f]/90 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-10">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 bg-emerald-500/10 rounded-full px-4 py-2 mb-4 border border-emerald-500/20">
          <UIcon name="i-lucide-smartphone" class="w-4 h-4 text-emerald-400" />
          <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Установка приложения</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Добавьте <span class="text-emerald-400">AyEda</span> на главный экран
        </h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl mx-auto">
          Откройте приложение в один клик, как обычное приложение из App Store или Google Play
        </p>
      </div>

      <!-- Переключатель платформ -->
      <div class="flex justify-center gap-2 bg-white/5 p-1 rounded-xl max-w-xs mx-auto mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 justify-center"
          :class="activeTab === tab.id
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Список шагов -->
      <div class="space-y-4">
        <div
          v-for="(step, index) in currentSteps"
          :key="index"
          class="group flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
        >
          <!-- Номер шага -->
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/30">
            {{ index + 1 }}
          </div>

          <!-- Контент шага -->
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold text-sm md:text-base">
              {{ step.title }}
            </h3>
            <p class="text-gray-400 text-xs md:text-sm mt-0.5">
              {{ step.description }}
            </p>
          </div>

          <!-- Иконка-подсказка -->
          <div class="flex-shrink-0 text-gray-500 group-hover:text-emerald-400 transition-colors">
            <UIcon :name="step.icon || 'i-lucide-chevron-right'" class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Нижний блок с CTA и ссылками -->
      <div class="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-400" />
          <span>Работает на iOS 14+ и Android 8+</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            На главную
          </NuxtLink>
          <NuxtLink to="/cabinet/my-recipes" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 text-sm">
            Перейти в приложение
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Установка PWA | AyEda',
  meta: [
    { name: 'description', content: 'Добавьте AyEda на главный экран вашего телефона (iPhone или Android) и пользуйтесь как нативным приложением.' },
    { property: 'og:title', content: 'Установка PWA | AyEda' },
    { property: 'og:description', content: 'Инструкция по установке приложения AyEda на главный экран.' },
    { property: 'og:image', content: 'https://ayeda.ru/og-image.jpg' },
    { property: 'og:image:alt', content: 'Установка AyEda на телефон' },
    { property: 'og:url', content: 'https://ayeda.ru/pwa-install' },
    { name: 'robots', content: 'index, follow' },
  ],
})

const activeTab = ref<'ios' | 'android'>('ios')

const tabs = [
  { id: 'ios', label: 'iPhone', icon: 'i-lucide-apple' },
  { id: 'android', label: 'Android', icon: 'i-lucide-smartphone' },
]

const iosSteps = [
  {
    title: 'Откройте сайт в Safari',
    description: 'Перейдите на сайт AyEda в браузере Safari на вашем iPhone',
    icon: 'i-lucide-globe',
  },
  {
    title: 'Нажмите кнопку "Поделиться"',
    description: 'Нажмите на иконку "Поделиться" в нижней панели браузера (квадрат со стрелкой вверх)',
    icon: 'i-lucide-share-2',
  },
  {
    title: 'Выберите "На экран Домой"',
    description: 'Прокрутите меню вниз и выберите опцию "На экран Домой"',
    icon: 'i-lucide-arrow-down',
  },
  {
    title: 'Подтвердите добавление',
    description: 'Нажмите "Добавить" в правом верхнем углу. Иконка появится на главном экране!',
    icon: 'i-lucide-check',
  },
]

const androidSteps = [
  {
    title: 'Откройте сайт в Chrome',
    description: 'Перейдите на сайт AyEda в браузере Google Chrome на вашем Android-устройстве',
    icon: 'i-lucide-globe',
  },
  {
    title: 'Нажмите на меню браузера',
    description: 'Нажмите на три точки в правом верхнем углу браузера, чтобы открыть меню',
    icon: 'i-lucide-more-horizontal',
  },
  {
    title: 'Выберите "Установить приложение"',
    description: 'В меню выберите "Установить приложение" или "Добавить на главный экран"',
    icon: 'i-lucide-download',
  },
  {
    title: 'Подтвердите установку',
    description: 'Нажмите "Установить" в появившемся диалоговом окне',
    icon: 'i-lucide-check',
  },
]

const currentSteps = computed(() => {
  return activeTab.value === 'ios' ? iosSteps : androidSteps
})
</script>

<style scoped>
.bg-gradient-radial {
  background-image: radial-gradient(circle at 20% 30%, #1e2a3a, #0a0d12);
}

.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='20' cy='20' r='2' fill='white'/%3E%3Ccircle cx='80' cy='40' r='3' fill='white'/%3E%3Ccircle cx='50' cy='80' r='2' fill='white'/%3E%3Ccircle cx='10' cy='70' r='1.5' fill='white'/%3E%3Ccircle cx='90' cy='85' r='2.5' fill='white'/%3E%3Ccircle cx='40' cy='10' r='1.8' fill='white'/%3E%3C/svg%3E");
  background-size: 120px 120px;
}
</style>
