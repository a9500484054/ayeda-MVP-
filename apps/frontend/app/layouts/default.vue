<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GlobalLoader from '~/components/GlobalLoader.vue';
import { publicNavigation } from "~/shared/constants/navigation";

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Глобальный лоадер -->
    <!-- <GlobalLoader /> -->

    <!-- НОВЫЙ ХЕДЕР с эффектом стекла -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300" :class="{ 'shadow-sm': scrolled }">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Логотип с анимацией -->
          <div class="flex items-center gap-3 group cursor-pointer" @click="navigateTo('/')">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition"></div>
              <div class="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2 shadow-lg">
                <div class="flex items-center gap-0.5">
                  <UIcon name="i-lucide-utensils" class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <span class="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">АуЕда</span>
          </div>

          <!-- Навигация -->
          <div class="hidden md:flex items-center gap-8">
            <a
              v-for="item in publicNavigation"
              :key="item.to"
              :href="item.to"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
            >
              {{ item.label }}
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <!-- Кнопки -->
          <div class="flex items-center gap-2">
            <!-- Кнопка Войти -->
            <ULink to="/login">
              <UButton
                variant="ghost"
                class="!rounded-full cursor-pointer hover:!bg-gray-100 transition-all duration-300 !px-4"
              >
                Войти
              </UButton>
            </ULink>

            <!-- Кнопка Регистрации -->
            <ULink to="/register">
              <UButton
                class="!rounded-full !bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 !px-5 cursor-pointer"
              >
                Начать →
              </UButton>
            </ULink>
          </div>
        </div>
      </div>
    </header>

    <main class="pt-20">
      <slot />
    </main>

    <!-- Футер -->
    <footer class="bg-gray-900 text-white">
      <div class="container-page py-12">
        <!-- Основная сетка -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Колонка 1: Бренд и описание -->
          <div class="space-y-4">
            <NuxtLink to="/" class="text-2xl font-black text-white">Ay<span class="text-emerald-400">Eda</span></NuxtLink>
            <p class="text-gray-400 text-sm leading-relaxed">
              Планируйте питание с умом. Экономьте время и деньги с нашим сервисом.
            </p>
            <div class="flex gap-3">
              <!-- Telegram -->
              <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-emerald-500 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.66-.35-1.02.22-1.61.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.11.03-1.85 1.17-5.22 3.45-.49.34-.94.5-1.34.49-.44-.01-1.29-.25-1.92-.46-.77-.25-1.38-.38-1.33-.81.03-.22.33-.45.92-.68 2.01-.87 4.99-1.85 6.97-2.6 1.92-.73 3.23-1.22 3.86-1.46.41-.16.75-.2 1.02-.12.29.08.42.29.38.63z"/>
                </svg>
              </a>

              <!-- YouTube -->
              <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <!-- VK -->
              <a href="#" class="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.9 14.5c-.2.2-.5.2-.8.1-1.3-.5-2.5-1.1-3.7-1.7-.3-.2-.6-.3-.8-.1-.3.2-.5.5-.7.8-.1.2-.3.2-.5.1-1.4-.5-2.6-1.3-3.7-2.2-.3-.2-.5-.5-.8-.8-1.2-1.2-2.1-2.6-2.7-4.2-.1-.2 0-.4.1-.6.1-.2.3-.3.5-.3h1.6c.2 0 .4.1.5.3.3.7.7 1.4 1.2 2 .1.2.3.3.5.3h.3c.4 0 .6-.3.5-.7-.2-1.1-.4-2.2-.4-3.2 0-.5.3-.9.8-1h.3c.6-.1 1.2.1 1.7.4.3.2.5.5.6.9.3 1.1.4 2.2.3 3.3 0 .4.3.6.6.6.3 0 .6-.2.8-.4.8-.9 1.4-1.9 1.8-3 .1-.3.3-.5.6-.5h1.5c.3 0 .6.2.6.5 0 .8-.4 2.1-1.2 3.3-.3.5-.7.9-1.1 1.3-.2.2-.2.5 0 .7.5.4 1 .8 1.4 1.3.6.7 1.1 1.5 1.4 2.4.1.3-.1.6-.4.7z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Колонка 2: Навигация -->
          <div>
            <h3 class="font-semibold mb-3 text-white">О сервисе</h3>
            <ul class="space-y-2">
              <li v-for="item in publicNavigation" :key="item.to">
                <NuxtLink :to="item.to" class="text-gray-400 hover:text-emerald-400 transition text-sm">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Колонка 3: Полезное -->
          <div>
            <h3 class="font-semibold mb-3 text-white">Полезное</h3>
            <ul class="space-y-2">
              <li><NuxtLink to="/in-development" class="text-gray-400 hover:text-emerald-400 transition text-sm">Блог</NuxtLink></li>
              <li><NuxtLink to="/recipes" class="text-gray-400 hover:text-emerald-400 transition text-sm">Рецепты</NuxtLink></li>
              <li><NuxtLink to="/in-development" class="text-gray-400 hover:text-emerald-400 transition text-sm">Вопросы и ответы</NuxtLink></li>
              <li><NuxtLink to="/support" class="text-gray-400 hover:text-emerald-400 transition text-sm">Поддержка</NuxtLink></li>
            </ul>
          </div>

          <!-- Колонка 4: Контакты и приложение -->
          <div>
            <h3 class="font-semibold mb-3 text-white">Контакты</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                <a href="mailto:ayedaru@yandex.ru" class="hover:text-emerald-400 transition">ayedaru@yandex.ru</a>
              </li>
            </ul>

            <!-- Бейдж приложения -->
            <div class="mt-4 flex gap-2">
              <NuxtLink to="/in-development">
                <div class="bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                  <UIcon name="i-lucide-apple" class="w-5 h-5" />
                  <span class="text-xs">App Store</span>
                </div>
              </NuxtLink>
              <NuxtLink to="/in-development">
                <div class="bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                  <UIcon name="i-lucide-play" class="w-5 h-5" />
                  <span class="text-xs">Google Play</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Нижняя часть -->
        <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>© 2026 AyEda. Все права защищены.</span>
          <div class="flex gap-6">
            <NuxtLink to="/policy" class="hover:text-emerald-400 transition">Политика конфиденциальности</NuxtLink>
            <NuxtLink to="/offer" class="hover:text-emerald-400 transition">Пользовательское соглашение</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Кастомный скроллбар */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981, #14b8a6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #059669, #0d9488);
}
</style>
