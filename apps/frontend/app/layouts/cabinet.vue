<script setup lang="ts">
import { cabinetNavigation } from "~/shared/constants/navigation";
import { useUserStore } from "~/stores/userStore";
import { useAuth } from "~/composables/useAuth";

const userStore = useUserStore();
const { logout } = useAuth();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const isAuth = computed(() => !!userStore.user);

const handleLogout = async () => {
  await logout();
  router.push('/');
};

// Основные ссылки
const mainLinks = [
  { to: '/cabinet/my-recipes', label: 'Мои рецепты', icon: 'i-lucide-book-open' },
  { to: '/cabinet/planner', label: 'Планировщик меню', icon: 'i-lucide-calendar-days' },
  { to: '/cabinet/shopping', label: 'Список покупок', icon: 'i-lucide-shopping-cart' },
];

// Общие ссылки
const exploreLinks = [
  { to: '/recipes', label: 'Идеи рецептов', icon: 'i-lucide-lightbulb' },
  { to: '/blog', label: 'Блог', icon: 'i-lucide-newspaper' },
];

// Ссылки поддержки
const supportLinks = [
  { to: '/support', label: 'Помощь', icon: 'i-lucide-help-circle' },
  { to: '/cabinet/settings', label: 'Настройки', icon: 'i-lucide-settings' },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <!-- Мобильная кнопка меню -->
    <button
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      class="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
    >
      <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-6 h-6 text-emerald-600" />
    </button>

    <!-- Затемнение для мобильного меню -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Сайдбар -->
    <aside
      :class="[
        'fixed lg:sticky top-0 left-0 z-40 h-screen transition-transform duration-300 bg-white shadow-xl',
        'lg:translate-x-0 w-72',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="side">
        <!-- Хедер с логотипом -->
        <header class="side__header">
          <NuxtLink to="/" class="side__logo group">
            <div class="flex items-center gap-2">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition"></div>
                <div class="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
                </div>
              </div>
              <span class="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">АуЕда</span>
            </div>
          </NuxtLink>
        </header>

        <!-- Информация о пользователе -->
        <section class="side__user">
          <div class="flex items-center gap-3 p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {{ userStore.user?.username?.[0]?.toUpperCase() || 'П' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 truncate">{{ userStore.user?.username || 'Пользователь' }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userStore.user?.email || 'email@example.com' }}</p>
            </div>
          </div>
        </section>

        <!-- Навигация -->
        <nav class="side__nav">
          <!-- Основные ссылки -->
          <div class="nav-section">
            <h3 class="nav-section__title">Основное</h3>
            <div class="nav-section__links">
              <NuxtLink
                v-for="link in mainLinks"
                :key="link.to"
                :to="link.to"
                class="nav-link"
                active-class="nav-link--active"
              >
                <UIcon :name="link.icon" class="nav-link__icon" />
                <span class="nav-link__label">{{ link.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Общие ссылки -->
          <div class="nav-section">
            <h3 class="nav-section__title">Общее</h3>
            <div class="nav-section__links">
              <NuxtLink
                v-for="link in exploreLinks"
                :key="link.to"
                :to="link.to"
                class="nav-link"
                active-class="nav-link--active"
              >
                <UIcon :name="link.icon" class="nav-link__icon" />
                <span class="nav-link__label">{{ link.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Поддержка (внизу) -->
          <div class="nav-section nav-section--support">
            <h3 class="nav-section__title">Поддержка</h3>
            <div class="nav-section__links">
              <NuxtLink
                v-for="link in supportLinks"
                :key="link.to"
                :to="link.to"
                class="nav-link"
                active-class="nav-link--active"
              >
                <UIcon :name="link.icon" class="nav-link__icon" />
                <span class="nav-link__label">{{ link.label }}</span>
              </NuxtLink>
              <button
                @click="handleLogout"
                class="nav-link w-full text-left mt-2 text-red-500 hover:bg-red-50"
              >
                <UIcon name="i-lucide-log-out" class="nav-link__icon" />
                <span class="nav-link__label">Выйти</span>
              </button>
            </div>
          </div>
        </nav>

        <!-- Футер -->
        <footer class="side__footer">
          <div class="flex gap-3">
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-emerald-500 transition flex items-center justify-center group">
              <svg class="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.66-.35-1.02.22-1.61.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.11.03-1.85 1.17-5.22 3.45-.49.34-.94.5-1.34.49-.44-.01-1.29-.25-1.92-.46-.77-.25-1.38-.38-1.33-.81.03-.22.33-.45.92-.68 2.01-.87 4.99-1.85 6.97-2.6 1.92-.73 3.23-1.22 3.86-1.46.41-.16.75-.2 1.02-.12.29.08.42.29.38.63z"/>
              </svg>
            </a>
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-600 transition flex items-center justify-center group">
              <svg class="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-600 transition flex items-center justify-center group">
              <svg class="w-4 h-4 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.9 14.5c-.2.2-.5.2-.8.1-1.3-.5-2.5-1.1-3.7-1.7-.3-.2-.6-.3-.8-.1-.3.2-.5.5-.7.8-.1.2-.3.2-.5.1-1.4-.5-2.6-1.3-3.7-2.2-.3-.2-.5-.5-.8-.8-1.2-1.2-2.1-2.6-2.7-4.2-.1-.2 0-.4.1-.6.1-.2.3-.3.5-.3h1.6c.2 0 .4.1.5.3.3.7.7 1.4 1.2 2 .1.2.3.3.5.3h.3c.4 0 .6-.3.5-.7-.2-1.1-.4-2.2-.4-3.2 0-.5.3-.9.8-1h.3c.6-.1 1.2.1 1.7.4.3.2.5.5.6.9.3 1.1.4 2.2.3 3.3 0 .4.3.6.6.6.3 0 .6-.2.8-.4.8-.9 1.4-1.9 1.8-3 .1-.3.3-.5.6-.5h1.5c.3 0 .6.2.6.5 0 .8-.4 2.1-1.2 3.3-.3.5-.7.9-1.1 1.3-.2.2-.2.5 0 .7.5.4 1 .8 1.4 1.3.6.7 1.1 1.5 1.4 2.4.1.3-.1.6-.4.7z"/>
              </svg>
            </a>
          </div>
          <small class="text-xs text-gray-400">© Все права защищены</small>
        </footer>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="lg:ml-72 p-6 lg:p-8">
      <div class="max-w-6xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 16px;
  height: 100%;
  overflow-y: auto;
}

/* Кастомный скроллбар для сайдбара */
.side::-webkit-scrollbar {
  width: 4px;
}

.side::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.side::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* Хедер */
.side__header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.side__logo {
  display: block;
}

/* Пользователь */
.side__user {
  padding: 4px 0 8px;
  border-bottom: 1px solid #e2e8f0;
}

/* Навигация */
.side__nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow: visible;
}

/* Секции навигации */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-section--support {
  margin-top: auto;
}

.nav-section__title {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  padding-left: 12px;
}

.nav-section__links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Ссылки навигации */
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #0f766e;
}

.nav-link--active {
  background: linear-gradient(135deg, #ecfdf5, #ccfbf1);
  color: #0f766e;
}

.nav-link__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-link__label {
  flex: 1;
}

/* Футер */
.side__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

main {
  animation: fadeIn 0.3s ease-out;
}
</style>
