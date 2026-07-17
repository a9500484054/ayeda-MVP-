<template>
  <div class="flex flex-1" :class="{ 'pwa-mode': isPwa }">
    <!-- Хедер для мобильных устройств -->
    <header
      class="fixed top-0 left-0 right-0 z-30 bg-gradient-to-br from-emerald-700 to-teal-800 shadow-md lg:hidden pwa-mobile-header"
      :class="{ 'pwa-mobile-header': isPwa }"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Логотип -->
        <NuxtLink to="/" class="block">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div class="text-lg font-semibold text-white">АуЕда</div>
              <div class="text-[10px] text-emerald-200 tracking-wide">Кулинарное пространство</div>
            </div>
          </div>
        </NuxtLink>

        <!-- Кнопка меню -->
        <Button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          color="white"
          size="md"
          variant="ghost"
          class="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5 text-white" />
        </Button>
      </div>
    </header>

    <!-- Затемнение для мобильного меню -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Сайдбар -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-screen transition-transform duration-300 overflow-hidden',
        'lg:sticky lg:translate-x-0 w-64',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        { 'pwa-sidebar': isPwa }
      ]"
      style="min-width: 256px;"
    >
      <!-- Градиентный фон -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-800">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div class="relative z-10 flex flex-col h-full text-white">
        <div class="flex flex-col h-full p-5">
          <!-- Логотип -->
          <div class="mb-8 sidebar-logo" :class="{ 'pwa-sidebar-logo': isPwa }">
            <NuxtLink to="/" class="block">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <UIcon name="i-lucide-utensils" class="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div class="text-lg font-semibold text-white">АуЕда</div>
                  <div class="text-[10px] text-emerald-200 tracking-wide">Кулинарное пространство</div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Навигация -->
          <nav class="flex-1 -mx-2 overflow-y-auto sidebar-nav" :class="{ 'pwa-sidebar-nav': isPwa }">
            <!-- Основные ссылки (для авторизованных) -->
            <div v-if="isAuth" class="space-y-1">
              <NuxtLink
                v-for="link in mainLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                active-class="!bg-white/20 !text-white"
                @click="isMobileMenuOpen = false"
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>

            <!-- Разделитель -->
            <div v-if="isAuth" class="h-px bg-white/20 my-4"></div>

            <!-- Общие ссылки -->
            <div class="space-y-1">
              <NuxtLink
                v-for="link in exploreLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                active-class="!bg-white/20 !text-white"
                @click="isMobileMenuOpen = false"
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>

            <!-- Админ панель (только для модераторов и админов) -->
            <div v-if="isAdminOrModerator" class="mt-4 space-y-1">
              <div class="text-xs font-semibold text-emerald-200 uppercase tracking-wider px-3 pt-2 pb-1">
                Управление
              </div>
              <NuxtLink
                v-for="link in adminLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                active-class="!bg-white/20 !text-white"
                @click="isMobileMenuOpen = false"
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>

            <!-- Демо стенд (только для модераторов и админов, скрыт в проде) -->
            <div v-if="isAdminOrModerator && isDevMode" class="mt-2 space-y-1">
              <button
                @click="isDemoOpen = !isDemoOpen"
                class="flex items-center justify-between w-full px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-flask-conical" class="w-4 h-4" />
                  <span>Демо стенд</span>
                  <span class="text-xs text-emerald-300">({{ totalDemoComponents }})</span>
                </div>
                <UIcon
                  :name="isDemoOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="w-4 h-4 transition-transform duration-200"
                />
              </button>

              <!-- Вложенное меню демо стенда -->
              <Transition name="slide-down">
                <div v-if="isDemoOpen" class="ml-6 space-y-3">
                  <!-- Базовые компоненты -->
                  <div>
                    <div class="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider px-3 pb-1">
                      Базовые компоненты
                    </div>
                    <div class="space-y-0.5">
                      <NuxtLink
                        v-for="link in baseComponents"
                        :key="link.to"
                        :to="link.to"
                        class="flex items-center gap-3 px-3 py-1.5 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        active-class="!bg-white/20 !text-white"
                        @click="isMobileMenuOpen = false"
                      >
                        <UIcon :name="link.icon" class="w-3.5 h-3.5 opacity-70" />
                        <span>{{ link.label }}</span>
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Составные компоненты -->
                  <div>
                    <div class="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider px-3 pb-1">
                      Составные компоненты
                    </div>
                    <div class="space-y-0.5">
                      <NuxtLink
                        v-for="link in complexComponents"
                        :key="link.to"
                        :to="link.to"
                        class="flex items-center gap-3 px-3 py-1.5 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        active-class="!bg-white/20 !text-white"
                        @click="isMobileMenuOpen = false"
                      >
                        <UIcon :name="link.icon" class="w-3.5 h-3.5 opacity-70" />
                        <span>{{ link.label }}</span>
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- UI элементы -->
                  <div>
                    <div class="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider px-3 pb-1">
                      UI элементы
                    </div>
                    <div class="space-y-0.5">
                      <NuxtLink
                        v-for="link in uiElements"
                        :key="link.to"
                        :to="link.to"
                        class="flex items-center gap-3 px-3 py-1.5 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        active-class="!bg-white/20 !text-white"
                        @click="isMobileMenuOpen = false"
                      >
                        <UIcon :name="link.icon" class="w-3.5 h-3.5 opacity-70" />
                        <span>{{ link.label }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Поддержка внизу -->
            <div class="mt-auto">
              <div class="space-y-1">
                <NuxtLink
                  v-for="link in supportLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  active-class="!bg-white/20 !text-white"
                  @click="isMobileMenuOpen = false"
                >
                  <UIcon :name="link.icon" class="w-4 h-4" />
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </nav>

          <!-- Блок пользователя -->
          <div class="pt-4 mt-4 border-t border-white/20 sidebar-user" :class="{ 'pwa-sidebar-user': isPwa }">
            <div v-if="isAuth">
              <UDropdownMenu
                :items="dropdownItems"
                :ui="{
                  content: 'w-48 bg-white cursor-pointer',
                  item: {
                    icon: 'w-4 h-4',
                  }
                }"
              >
                <div class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <UAvatar
                    :src="avatarPreview || undefined"
                    :alt="userStore.user?.username"
                    size="sm"
                    class="w-8 h-8"
                    :ui="{ fallback: 'bg-white/20 text-white text-sm font-medium' }"
                  >
                    <template #fallback>
                      {{ userStore.user?.username?.[0]?.toUpperCase() || 'П' }}
                    </template>
                  </UAvatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ userStore.user?.username || 'Пользователь' }}</p>
                    <p class="text-xs text-emerald-200 truncate">{{ userStore.user?.email || 'email@example.com' }}</p>
                  </div>
                </div>
              </UDropdownMenu>
            </div>

            <Button
              v-else
              color="white"
              variant="solid"
              size="md"
              :icon-only="false"
              icon="i-lucide-log-in"
              icon-position="left"
              text="Войти"
              @click="handleLogin"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="flex-1 flex flex-col min-h-screen cabinet-main" :class="{ 'pwa-cabinet-main': isPwa }">
      <div class="lg:mt-0 mt-16 cabinet-content" :class="{ 'pwa-cabinet-content': isPwa }">
        <slot />
      </div>
      <PwaInstallPrompt />
    </main>

    <!-- Модальное окно подтверждения выхода -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="cancelLogout">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all" @click.stop>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <UIcon name="i-lucide-log-out" class="w-5 h-5 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Выход из аккаунта</h3>
        </div>

        <p class="text-gray-600 mb-6">
          Вы уверены, что хотите выйти? Вы сможете войти снова в любое время.
        </p>

        <div class="flex gap-3 justify-end">
          <button
            @click="cancelLogout"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            @click="confirmLogout"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useUserStore } from "~/stores/userStore"
import { useAuth } from "~/composables/useAuth"
import Button from '~/shared/ui/button/Button.vue'
import PwaInstallPrompt from '~/components/PwaInstallPrompt.vue'

const userStore = useUserStore()
const { logout } = useAuth()
const router = useRouter()
const isMobileMenuOpen = ref(false)
const showLogoutModal = ref(false)
const isDemoOpen = ref(false)
const config = useRuntimeConfig()
const isPwa = ref(false)

// Проверка PWA
const checkPwa = () => {
  if (process.client) {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSPWA = window.navigator.standalone === true;
    isPwa.value = isStandalone || isIOSPWA;
  }
};

// Проверка на режим разработки
const isDevMode = computed(() => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV
})

// Проверка прав администратора/модератора
const isAdminOrModerator = computed(() => {
  const role = userStore.user?.role
  return role === 'admin' || role === 'moderator'
})

const isAuth = computed(() => !!userStore.user)

const toast = useToast()

const handleLogoutClick = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  showLogoutModal.value = false
  try {
    await logout()
    toast.add({
      title: 'Выход выполнен',
      description: 'Вы успешно вышли из аккаунта',
      color: 'success',
      icon: 'i-lucide-check-circle',
      timeout: 3000
    })
    router.push('/')
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось выполнить выход',
      color: 'error',
      icon: 'i-lucide-alert-circle',
      timeout: 3000
    })
  }
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const handleLogin = () => {
  router.push('/login')
}

const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Настройки',
      icon: 'i-lucide-settings',
      to: '/cabinet/settings'
    }
  ],
  ...(isAdminOrModerator.value ? [[
    {
      label: 'Админ панель',
      icon: 'i-lucide-shield',
      to: '/cabinet/admin',
      class: 'text-emerald-600',
      iconClass: 'text-emerald-600'
    }
  ]] : []),
  ...(isAdminOrModerator.value && isDevMode.value ? [[
    {
      label: 'Демо стенд',
      icon: 'i-lucide-flask-conical',
      to: '/demo',
      class: 'text-purple-600',
      iconClass: 'text-purple-600'
    }
  ]] : []),
  [
    {
      label: 'Выйти',
      icon: 'i-lucide-log-out',
      onSelect: handleLogoutClick,
      class: 'text-red-600',
      iconClass: 'text-red-600'
    }
  ]
])

// Основные ссылки для авторизованных пользователей
const mainLinks = [
  { to: '/cabinet/my-recipes', label: 'Мои рецепты', icon: 'i-lucide-book-open' },
  { to: '/cabinet/menu-planner', label: 'Планировщик меню', icon: 'i-lucide-calendar-days' },
  { to: '/cabinet/shopping-lists', label: 'Списки покупок', icon: 'i-lucide-shopping-cart' },
]

// Общие ссылки (доступны всем)
const exploreLinks = [
  { to: '/recipes', label: 'База рецептов', icon: 'i-lucide-lightbulb' },
  { to: '/blog', label: 'Блог', icon: 'i-lucide-newspaper' },
]

// Ссылки для администратора/модератора
const adminLinks = [
  { to: '/admin', label: 'Админ панель', icon: 'i-lucide-shield' },
  { to: '/ingredients', label: 'Ингридиенты', icon: 'i-lucide-utensils-crossed' },
]

// Группировка демо компонентов
const baseComponents = [
  { to: '/demo/button', label: 'Button', icon: 'i-lucide-square' },
  { to: '/demo/input', label: 'Input', icon: 'i-lucide-square' },
  { to: '/demo/textarea', label: 'Textarea', icon: 'i-lucide-square' },
  { to: '/demo/select', label: 'Select', icon: 'i-lucide-square' },
  { to: '/demo/checkbox', label: 'Checkbox', icon: 'i-lucide-square' },
  { to: '/demo/number-stepper', label: 'Number Stepper', icon: 'i-lucide-square' },
]

const complexComponents = [
  { to: '/demo/category-select', label: 'Category Select', icon: 'i-lucide-square' },
  { to: '/demo/ingredients-list', label: 'Ingredients List', icon: 'i-lucide-square' },
  { to: '/demo/steps-list', label: 'Steps List', icon: 'i-lucide-square' },
  { to: '/demo/image-uploader', label: 'Image Uploader', icon: 'i-lucide-square' },
]

const uiElements = [
  { to: '/demo/modal', label: 'Modal', icon: 'i-lucide-square' },
  { to: '/demo/slideover', label: 'Slideover', icon: 'i-lucide-square' },
  { to: '/demo/confirm-modal', label: 'Confirm Modal', icon: 'i-lucide-square' },
  { to: '/demo/empty-state', label: 'Empty State', icon: 'i-lucide-square' },
  { to: '/demo/skeleton', label: 'Skeleton', icon: 'i-lucide-square' },
  { to: '/demo/loader', label: 'Loader', icon: 'i-lucide-square' },
  { to: '/demo/view-toggle', label: 'View Toggle', icon: 'i-lucide-square' },
  { to: '/demo/search-input', label: 'Search Input', icon: 'i-lucide-square' },
  { to: '/demo/icons', label: 'Icons', icon: 'i-lucide-square' },
]

// Ссылки поддержки
const supportLinks = [
  { to: '/support', label: 'Помощь', icon: 'i-lucide-help-circle' },
]

// Подсчет общего количества демо-компонентов
const totalDemoComponents = computed(() => {
  return baseComponents.length + complexComponents.length + uiElements.length
})

const avatarPreview = computed(() => {
  const avatar = userStore.user?.avatar
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar
  const API_BASE_URL = config.public.apiUrl
  return `${API_BASE_URL}${avatar}`
})

onMounted(() => {
  checkPwa()

  const mediaQuery = window.matchMedia('(display-mode: standalone)')
  const handleChange = (e: MediaQueryListEvent) => {
    isPwa.value = e.matches
  }

  mediaQuery.addEventListener('change', handleChange)

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })
})
</script>

<style scoped>
aside ::-webkit-scrollbar {
  width: 3px;
}

aside ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

aside ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

aside ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

:deep(.text-red-600) {
  color: #dc2626 !important;
}

:deep(.text-red-600 .icon) {
  color: #dc2626 !important;
}

:deep(.text-emerald-600) {
  color: #059669 !important;
}

:deep(.text-purple-600) {
  color: #9333ea !important;
}

/* Анимация для раскрытия меню */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================ */
/* PWA и Safe Area поддержка для iOS */
/* ============================================ */

/* Мобильный хедер в PWA */
.pwa-mode .pwa-mobile-header {
  padding-top: env(safe-area-inset-top, 0px);
  min-height: calc(60px + env(safe-area-inset-top, 0px));
}

/* Сайдбар в PWA */
.pwa-mode .pwa-sidebar {
  padding-top: env(safe-area-inset-top, 0px);
}

.pwa-mode .pwa-sidebar-logo {
  margin-top: calc(env(safe-area-inset-top, 0px) / 2);
}

.pwa-mode .pwa-sidebar-nav {
  max-height: calc(100vh - 180px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
}

.pwa-mode .pwa-sidebar-user {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Основной контент в PWA */
.pwa-mode .pwa-cabinet-main {
  padding-top: env(safe-area-inset-top, 0px);
}

.pwa-mode .pwa-cabinet-content {
  margin-top: calc(4rem + env(safe-area-inset-top, 0px));
}

/* Для десктопной версии в PWA */
@media (min-width: 1024px) {
  .pwa-mode .pwa-cabinet-content {
    margin-top: 0;
  }

  .pwa-mode .pwa-sidebar {
    padding-top: env(safe-area-inset-top, 0px);
    height: 100vh;
    min-height: 100vh;
  }
}

/* iOS Safari специфичные фиксы */
@supports (-webkit-touch-callout: none) {
  .pwa-mode .pwa-mobile-header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .pwa-mode .pwa-sidebar {
    padding-top: env(safe-area-inset-top, 0px);
  }
}

/* Для старых iPhone без челки */
@supports not (padding-top: env(safe-area-inset-top)) {
  .pwa-mode .pwa-mobile-header {
    padding-top: 0;
  }

  .pwa-mode .pwa-sidebar {
    padding-top: 0;
  }

  .pwa-mode .pwa-cabinet-content {
    margin-top: 4rem;
  }
}
</style>
