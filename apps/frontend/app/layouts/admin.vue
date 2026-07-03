<!-- apps/frontend/layouts/admin.vue -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useLocalStorage } from '@vueuse/core';
import { adminNavigation } from '~/shared/constants/navigation';

// --- Состояние сайдбара с сохранением в localStorage ---
const open = useLocalStorage('admin-sidebar-open', true);

// --- Преобразуем навигацию в формат для UNavigationMenu ---
const navigationItems = computed<NavigationMenuItem[]>(() => {
  return adminNavigation.map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    // Активный пункт меню определяется по текущему пути
    active: useRoute().path === item.to,
    defaultOpen: item.defaultOpen, // Без этого children не будут показаны по умолчанию
    children: item.children,       // Без этого нет вложенных пунктов
  }));
});

</script>

<template>
  <div class="flex flex-1">
    <!-- Официальный компонент Sidebar из Nuxt UI -->
    <USidebar
      v-model:open="open"
      collapsible="icon"
      rail
      close
      title="AyEda - Admin"
      description="Панель управления"
      :ui="{
        header: 'px-4 py-3',
        body: 'p-2',
        footer: 'p-2',
      }"
    >
      <!-- Верхняя часть сайдбара (можно добавить дополнительные элементы) -->
      <template #header>
        <NuxtLink to="/" class="block">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-4 h-4 text-emerald-600" />
            </div>
            <div v-if="open" class="flex flex-col">
              <span class="font-semibold">AyEda - Admin</span>
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

    <!-- Основная область контента с хедером -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Верхняя панель с кнопкой переключения сайдбара и поиском -->


      <!-- Контент страницы -->
      <UContainer class="py-6 flex-1">
        <slot />
      </UContainer>
    </div>
  </div>
</template>

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
</style>
