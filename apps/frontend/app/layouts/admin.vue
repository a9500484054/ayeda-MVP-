<template>
  <div class="flex flex-1">
    <!-- Официальный компонент Sidebar из Nuxt UI -->
    <USidebar
      v-model:open="open"
      collapsible="icon"
      rail
      close
      title="АуЕда - Admin"
      description="Панель управления"
      :ui="{
        header: 'px-4 py-3',
        body: 'p-2',
        footer: 'p-2',
      }"
    >
      <!-- Верхняя часть сайдбара (можно добавить дополнительные элементы) -->
      <template #header>
        <NuxtLink to="/cabinet" class="block">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-4 h-4 text-emerald-600" />
            </div>
            <div v-if="open" class="flex flex-col">
              <span class="font-semibold">АуЕда - Admin</span>
              <span class="text-xs text-muted">Панель управления</span>
            </div>
          </div>
        </NuxtLink>
      </template>

      <!-- Основная навигация -->
      <UNavigationMenu
        :items="navigationItems"
        orientation="vertical"
        :ui="{
          link: 'p-2 rounded-md data-[active=true]:bg-primary-50 dark:data-[active=true]:bg-primary-950/50 data-[active=true]:text-primary-600 dark:data-[active=true]:text-primary-400',
          label: 'text-sm',
          icon: 'size-5',
        }"
      />
    </USidebar>

    <!-- Основная область контента -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Верхняя панель с бургером и заголовком -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 dark:bg-gray-900/95 dark:border-gray-800">
        <div class="flex items-center justify-between px-4 sm:px-6 py-3">
          <!-- Левая часть: бургер + заголовок -->
          <div class="flex items-center gap-3">
            <!-- Кнопка бургер-меню (только на мобильных) -->
            <button
              type="button"
              class="lg:hidden relative z-50 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
              @click="toggleMobileMenu"
            >
              <div class="relative w-5 h-4 flex flex-col justify-between">
                <span
                  class="block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all duration-300"
                  :class="{
                    'rotate-45 translate-y-1.5': isMobileMenuOpen,
                    'w-5': !isMobileMenuOpen
                  }"
                />
                <span
                  class="block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all duration-300"
                  :class="{
                    'opacity-0': isMobileMenuOpen,
                    'w-5': !isMobileMenuOpen
                  }"
                />
                <span
                  class="block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all duration-300"
                  :class="{
                    '-rotate-45 -translate-y-1.5': isMobileMenuOpen,
                    'w-5': !isMobileMenuOpen
                  }"
                />
              </div>
            </button>

            <!-- Заголовок страницы -->
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Правая часть: пользователь -->
          <div class="flex items-center gap-3">
            <!-- Кнопка выхода (десктоп) -->
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-log-out"
              class="hidden sm:flex"
              @click="handleLogout"
            >
              Выйти
            </UButton>

            <!-- Аватар пользователя -->
            <UDropdownMenu :items="userMenuItems">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-user"
                class="!rounded-full"
              />
            </UDropdownMenu>
          </div>
        </div>

        <!-- Мобильное меню (overlay) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <div
            v-if="isMobileMenuOpen"
            class="lg:hidden fixed inset-x-0 top-[57px] bg-white/98 backdrop-blur-xl border-b border-gray-100 shadow-lg dark:bg-gray-900/98 dark:border-gray-800 max-h-[calc(100vh-57px)] overflow-y-auto"
          >
            <nav class="p-4 space-y-1">
              <!-- Пункты навигации -->
              <NuxtLink
                v-for="item in adminNavigation"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :class="{ 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400': $route.path === item.to || $route.path.startsWith(item.to + '/') }"
                @click="closeMobileMenu"
              >
                <UIcon :name="item.icon" class="w-5 h-5" />
                {{ item.label }}
              </NuxtLink>

              <!-- Разделитель -->
              <div class="border-t border-gray-200 dark:border-gray-700 my-3"></div>

              <!-- Кнопка выхода в мобильном меню -->
              <button
                class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                @click="handleLogout"
              >
                <UIcon name="i-lucide-log-out" class="w-5 h-5" />
                Выйти
              </button>
            </nav>
          </div>
        </Transition>
      </header>

      <!-- Контент страницы -->
      <UContainer class="py-6 flex-1">
        <slot />
      </UContainer>
    </div>
  </div>
</template>

<!-- apps/frontend/layouts/admin.vue -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useLocalStorage } from '@vueuse/core';
import { adminNavigation } from '~/shared/constants/navigation';

// --- Состояние сайдбара с сохранением в localStorage ---
const open = useLocalStorage('admin-sidebar-open', true);
const isMobileMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();

// --- Функции (объявляем ДО использования) ---
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

const handleLogout = () => {
  // Логика выхода
  closeMobileMenu();
  // router.push('/login');
};

// --- Заголовок страницы ---
const pageTitle = computed(() => {
  // Находим текущий пункт меню
  const findItem = (items: typeof adminNavigation, path: string): string | null => {
    for (const item of items) {
      if (item.to === path) return item.label;
      if (item.children) {
        const found = findItem(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const title = findItem(adminNavigation, route.path);
  return title || 'Админ панель';
});

// --- Преобразуем навигацию в формат для UNavigationMenu ---
const navigationItems = computed<NavigationMenuItem[]>(() => {
  return adminNavigation.map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    active: route.path === item.to,
    defaultOpen: item.defaultOpen,
    children: item.children,
  }));
});

// --- Меню пользователя (после объявления handleLogout) ---
const userMenuItems = [
  {
    label: 'Профиль',
    icon: 'i-lucide-user',
    to: '/cabinet/profile'
  },
  {
    label: 'Настройки',
    icon: 'i-lucide-settings',
    to: '/cabinet/settings'
  },
  {
    label: 'Выйти',
    icon: 'i-lucide-log-out',
    onSelect: handleLogout // ✅ handleLogout уже объявлен
  }
];

// Закрываем меню при изменении маршрута
watch(() => route.path, () => {
  closeMobileMenu();
});

// Cleanup
onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Анимация для плавного появления контента */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Анимация бургера */
button .w-5 {
  transition: all 0.3s ease;
}

/* Мобильные улучшения */
@media (max-width: 1024px) {
  .lg\:hidden {
    display: flex !important;
  }
}

/* Для iOS - предотвращаем зум */
@media (max-width: 640px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}
</style>
