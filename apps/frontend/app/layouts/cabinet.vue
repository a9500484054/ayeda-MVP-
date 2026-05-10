<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useUserStore } from "~/stores/userStore";
import { useAuth } from "~/composables/useAuth";

const userStore = useUserStore();
const { logout } = useAuth();
const router = useRouter();
const isMobileMenuOpen = ref(false);
const showLogoutModal = ref(false); // Добавляем состояние для модального окна

const isAuth = computed(() => !!userStore.user);

const toast = useToast();

// Изменяем handleLogout - теперь он только открывает модальное окно
const handleLogoutClick = () => {
  showLogoutModal.value = true;
};

// Подтверждение выхода
const confirmLogout = async () => {
  showLogoutModal.value = false;
  try {
    await logout();
    toast.add({
      title: 'Выход выполнен',
      description: 'Вы успешно вышли из аккаунта',
      color: 'success',
      icon: 'i-lucide-check-circle',
      timeout: 3000
    });
    router.push('/');
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось выполнить выход',
      color: 'error',
      icon: 'i-lucide-alert-circle',
      timeout: 3000
    });
  }
};

// Отмена выхода
const cancelLogout = () => {
  showLogoutModal.value = false;
};

const handleLogin = () => {
  router.push('/login');
};

// Элементы выпадающего меню
const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Настройки',
      icon: 'i-lucide-settings',
      to: '/cabinet/settings'
    }
  ],
  [
    {
      label: 'Выйти',
      icon: 'i-lucide-log-out text-red-600',
      onSelect: handleLogoutClick, // Изменено на handleLogoutClick
      class: 'text-red-600',
      iconClass: 'text-red-600'
    }
  ]
]);

// Основные ссылки (видны только авторизованным)
const mainLinks = [
  { to: '/cabinet/my-recipes', label: 'Мои рецепты', icon: 'i-lucide-book-open' },
  { to: '/in-development', label: 'Планировщик меню', icon: 'i-lucide-calendar-days' },
  { to: '/in-development', label: 'Список покупок', icon: 'i-lucide-shopping-cart' },
];
// const mainLinks = [
//   { to: '/cabinet/my-recipes', label: 'Мои рецепты', icon: 'i-lucide-book-open' },
//   { to: '/cabinet/planner', label: 'Планировщик меню', icon: 'i-lucide-calendar-days' },
//   { to: '/cabinet/shopping', label: 'Список покупок', icon: 'i-lucide-shopping-cart' },
// ];

// Общие ссылки (видны всем)
const exploreLinks = [
  { to: '/recipes', label: 'База рецептов', icon: 'i-lucide-lightbulb' },
  { to: '/blog', label: 'Блог', icon: 'i-lucide-newspaper' },
];

// Ссылки поддержки (видны всем)
const supportLinks = [
  { to: '/support', label: 'Помощь', icon: 'i-lucide-help-circle' },
];

// Добавьте после useUserStore и других импортов
const avatarPreview = computed(() => {
  const avatar = userStore.user?.avatar;
  if (!avatar) return null;

  // Если avatar уже содержит URL
  if (avatar.startsWith('http')) return avatar;

  // Если avatar содержит путь
  const API_BASE_URL = 'http://localhost:3001';
  return `${API_BASE_URL}${avatar}`;
});
</script>

<template>
  <div class="flex flex-1">
    <!-- Мобильная кнопка меню -->
    <button
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      class="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
    >
      <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5 text-emerald-600" />
    </button>

    <!-- Затемнение для мобильного меню -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/20 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Сайдбар с градиентом как на странице логина -->
    <aside
      :class="[
        'fixed lg:sticky top-0 left-0 z-40 h-screen transition-transform duration-300 overflow-hidden',
        'lg:translate-x-0 w-64',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Градиентный фон -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-800">
        <!-- Декоративные элементы -->
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div class="relative z-10 flex flex-col h-full text-white">
        <div class="flex flex-col h-full p-5">
          <!-- Логотип -->
          <div class="mb-8">
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
          <nav class="flex-1 -mx-2">
            <!-- Основные ссылки -->
            <div v-if="isAuth" class="space-y-1">
              <NuxtLink
                v-for="link in mainLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                active-class="!bg-white/20 !text-white"
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
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>

            <!-- Поддержка внизу -->
            <div class="">
              <div class="space-y-1">
                <NuxtLink
                  v-for="link in supportLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center gap-3 px-3 py-2 text-sm text-emerald-100 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  active-class="!bg-white/20 !text-white"
                >
                  <UIcon :name="link.icon" class="w-4 h-4" />
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </nav>

          <!-- Блок пользователя -->
          <div class="pt-4 mt-4 border-t border-white/20">
            <div v-if="isAuth">
              <UDropdownMenu
                :items="dropdownItems"
                :ui="{
                  content: 'w-48 bg-white cursor-pointer',
                  item: {
                    icon: 'w-4 h-4', // Базовый класс для иконок
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

            <button
              v-else
              @click="handleLogin"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-white rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <UIcon name="i-lucide-log-in" class="w-4 h-4" />
              Войти
            </button>
          </div>

          <!-- Футер -->
          <!-- <footer class="mt-6 pt-4 border-t border-white/20">
            <div class="text-center">
              <small class="text-[10px] text-emerald-200">© 2026 АуЕда</small>
            </div>
          </footer> -->
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="flex-1 flex flex-col min-h-screen">
      <div class="mx-auto">
        <slot />
      </div>
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

<style scoped>
/* Минималистичный скроллбар */
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

/* main {
  position: relative;
  top: -100vh;
}

@media (max-width: 1024px) {
  main {
    position: static;
    top: 0;
  }
} */

/* Стили для красной иконки в выпадающем меню */
:deep(.text-red-600) {
  color: #dc2626 !important;
}

:deep(.text-red-600 .icon) {
  color: #dc2626 !important;
}
</style>
