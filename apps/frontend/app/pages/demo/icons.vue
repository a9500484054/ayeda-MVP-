<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Иконки</h1>
        <p class="text-gray-600">
          Все доступные иконки в проекте. Всего {{ filteredIcons.length }} из {{ allIcons.length }}
        </p>
      </div>

      <!-- Поиск -->
      <div class="mb-6">
        <Input
          v-model="searchQuery"
          label="Имя"
          placeholder="Поиск иконок..."
        />
      </div>

      <!-- Фильтры -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="category in categories"
          :key="category"
          class="px-3 py-1.5 text-sm rounded-full transition-colors"
          :class="activeCategory === category
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <!-- Сетка иконок -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        <div
          v-for="icon in filteredIcons"
          :key="icon.name"
          class="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
          @click="copyIconName(icon.name)"
        >
          <div class="flex flex-col items-center text-center">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-emerald-50 transition-colors">
              <UIcon :name="icon.name" class="h-6 w-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p class="mt-2 text-xs text-gray-500 truncate w-full">
              {{ icon.name }}
            </p>
            <p class="text-[10px] text-gray-400">
              {{ icon.category }}
            </p>
          </div>
        </div>
      </div>

      <!-- Нет результатов -->
      <EmptyState
        v-if="filteredIcons.length === 0"
        title="Иконки не найдены"
        :description="`По запросу «${searchQuery}» ничего не найдено`"
        icon="i-lucide-search"
        action-text="Очистить поиск"
        @action="clearSearch"
      />

      <!-- Информация о копировании -->
      <div
        v-if="copiedIcon"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
      >
        Скопировано: {{ copiedIcon }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import Input from '~/shared/ui/input/Input.vue'

// Все доступные иконки
const allIcons = [
  // Навигация
  { name: 'i-lucide-home', category: 'Навигация' },
  { name: 'i-lucide-menu', category: 'Навигация' },
  { name: 'i-lucide-arrow-left', category: 'Навигация' },
  { name: 'i-lucide-arrow-right', category: 'Навигация' },
  { name: 'i-lucide-arrow-up', category: 'Навигация' },
  { name: 'i-lucide-arrow-down', category: 'Навигация' },
  { name: 'i-lucide-chevron-left', category: 'Навигация' },
  { name: 'i-lucide-chevron-right', category: 'Навигация' },
  { name: 'i-lucide-chevron-up', category: 'Навигация' },
  { name: 'i-lucide-chevron-down', category: 'Навигация' },

  // Действия
  { name: 'i-lucide-plus', category: 'Действия' },
  { name: 'i-lucide-minus', category: 'Действия' },
  { name: 'i-lucide-x', category: 'Действия' },
  { name: 'i-lucide-check', category: 'Действия' },
  { name: 'i-lucide-search', category: 'Действия' },
  { name: 'i-lucide-edit', category: 'Действия' },
  { name: 'i-lucide-edit-2', category: 'Действия' },
  { name: 'i-lucide-trash', category: 'Действия' },
  { name: 'i-lucide-trash-2', category: 'Действия' },
  { name: 'i-lucide-copy', category: 'Действия' },
  { name: 'i-lucide-save', category: 'Действия' },
  { name: 'i-lucide-download', category: 'Действия' },
  { name: 'i-lucide-upload', category: 'Действия' },
  { name: 'i-lucide-share', category: 'Действия' },
  { name: 'i-lucide-share-2', category: 'Действия' },
  { name: 'i-lucide-send', category: 'Действия' },
  { name: 'i-lucide-refresh-cw', category: 'Действия' },
  { name: 'i-lucide-loader-2', category: 'Действия' },
  { name: 'i-lucide-settings', category: 'Действия' },

  // Пользователи
  { name: 'i-lucide-user', category: 'Пользователи' },
  { name: 'i-lucide-users', category: 'Пользователи' },
  { name: 'i-lucide-user-plus', category: 'Пользователи' },
  { name: 'i-lucide-user-minus', category: 'Пользователи' },
  { name: 'i-lucide-user-check', category: 'Пользователи' },
  { name: 'i-lucide-user-x', category: 'Пользователи' },
  { name: 'i-lucide-avatar', category: 'Пользователи' },
  { name: 'i-lucide-log-in', category: 'Пользователи' },
  { name: 'i-lucide-log-out', category: 'Пользователи' },

  // Рецепты и еда
  { name: 'i-lucide-cooking-pot', category: 'Рецепты' },
  { name: 'i-lucide-utensils', category: 'Рецепты' },
  { name: 'i-lucide-utensils-crossed', category: 'Рецепты' },
  { name: 'i-lucide-knife', category: 'Рецепты' },
  { name: 'i-lucide-chef-hat', category: 'Рецепты' },
  { name: 'i-lucide-coffee', category: 'Рецепты' },
  { name: 'i-lucide-beer', category: 'Рецепты' },
  { name: 'i-lucide-wine', category: 'Рецепты' },
  { name: 'i-lucide-cake', category: 'Рецепты' },
  { name: 'i-lucide-pizza', category: 'Рецепты' },
  { name: 'i-lucide-burger', category: 'Рецепты' },
  { name: 'i-lucide-egg', category: 'Рецепты' },
  { name: 'i-lucide-milk', category: 'Рецепты' },
  { name: 'i-lucide-apple', category: 'Рецепты' },
  { name: 'i-lucide-fish', category: 'Рецепты' },
  { name: 'i-lucide-drumstick', category: 'Рецепты' },

  // Время
  { name: 'i-lucide-clock', category: 'Время' },
  { name: 'i-lucide-clock-3', category: 'Время' },
  { name: 'i-lucide-calendar', category: 'Время' },
  { name: 'i-lucide-calendar-days', category: 'Время' },
  { name: 'i-lucide-alarm-clock', category: 'Время' },
  { name: 'i-lucide-timer', category: 'Время' },
  { name: 'i-lucide-hourglass', category: 'Время' },

  // Социальные сети
  { name: 'i-lucide-heart', category: 'Социальные' },
  { name: 'i-lucide-thumbs-up', category: 'Социальные' },
  { name: 'i-lucide-thumbs-down', category: 'Социальные' },
  { name: 'i-lucide-star', category: 'Социальные' },
  { name: 'i-lucide-star-half', category: 'Социальные' },
  { name: 'i-lucide-message-circle', category: 'Социальные' },
  { name: 'i-lucide-message-square', category: 'Социальные' },
  { name: 'i-lucide-mail', category: 'Социальные' },
  { name: 'i-lucide-bell', category: 'Социальные' },
  { name: 'i-lucide-bell-off', category: 'Социальные' },
  { name: 'i-lucide-flag', category: 'Социальные' },
  { name: 'i-lucide-gift', category: 'Социальные' },

  // Файлы и медиа
  { name: 'i-lucide-image', category: 'Медиа' },
  { name: 'i-lucide-image-plus', category: 'Медиа' },
  { name: 'i-lucide-camera', category: 'Медиа' },
  { name: 'i-lucide-video', category: 'Медиа' },
  { name: 'i-lucide-film', category: 'Медиа' },
  { name: 'i-lucide-music', category: 'Медиа' },
  { name: 'i-lucide-folder', category: 'Файлы' },
  { name: 'i-lucide-folder-open', category: 'Файлы' },
  { name: 'i-lucide-file', category: 'Файлы' },
  { name: 'i-lucide-file-text', category: 'Файлы' },
  { name: 'i-lucide-file-image', category: 'Файлы' },

  // Статусы
  { name: 'i-lucide-check-circle', category: 'Статусы' },
  { name: 'i-lucide-x-circle', category: 'Статусы' },
  { name: 'i-lucide-alert-circle', category: 'Статусы' },
  { name: 'i-lucide-alert-triangle', category: 'Статусы' },
  { name: 'i-lucide-info', category: 'Статусы' },
  { name: 'i-lucide-help-circle', category: 'Статусы' },

  // Коммерция
  { name: 'i-lucide-shopping-cart', category: 'Коммерция' },
  { name: 'i-lucide-shopping-bag', category: 'Коммерция' },
  { name: 'i-lucide-shopping-basket', category: 'Коммерция' },
  { name: 'i-lucide-credit-card', category: 'Коммерция' },
  { name: 'i-lucide-wallet', category: 'Коммерция' },
  { name: 'i-lucide-tag', category: 'Коммерция' },
  { name: 'i-lucide-percent', category: 'Коммерция' },

  // Прочее
  { name: 'i-lucide-lock', category: 'Безопасность' },
  { name: 'i-lucide-unlock', category: 'Безопасность' },
  { name: 'i-lucide-eye', category: 'Безопасность' },
  { name: 'i-lucide-eye-off', category: 'Безопасность' },
  { name: 'i-lucide-shield', category: 'Безопасность' },
  { name: 'i-lucide-shield-check', category: 'Безопасность' },
  { name: 'i-lucide-key', category: 'Безопасность' },

  { name: 'i-lucide-map-pin', category: 'Локация' },
  { name: 'i-lucide-map', category: 'Локация' },
  { name: 'i-lucide-compass', category: 'Локация' },

  { name: 'i-lucide-phone', category: 'Контакты' },
  { name: 'i-lucide-phone-call', category: 'Контакты' },
  { name: 'i-lucide-message-square', category: 'Контакты' },

  { name: 'i-lucide-link', category: 'Ссылки' },
  { name: 'i-lucide-external-link', category: 'Ссылки' },
  { name: 'i-lucide-globe', category: 'Ссылки' },
  { name: 'i-lucide-at-sign', category: 'Ссылки' },
  { name: 'i-lucide-hash', category: 'Ссылки' },

  { name: 'i-lucide-sun', category: 'Погода' },
  { name: 'i-lucide-moon', category: 'Погода' },
  { name: 'i-lucide-cloud', category: 'Погода' },
  { name: 'i-lucide-cloud-rain', category: 'Погода' },
  { name: 'i-lucide-cloud-snow', category: 'Погода' },
  { name: 'i-lucide-wind', category: 'Погода' },

  { name: 'i-lucide-phone', category: 'Контакты' },
  { name: 'i-lucide-phone-call', category: 'Контакты' },
  { name: 'i-lucide-message-square', category: 'Контакты' },

  { name: 'i-lucide-grid-2x2', category: 'Интерфейс' },
  { name: 'i-lucide-grid-3x3', category: 'Интерфейс' },
  { name: 'i-lucide-list', category: 'Интерфейс' },
  { name: 'i-lucide-layout-grid', category: 'Интерфейс' },
  { name: 'i-lucide-layout-list', category: 'Интерфейс' },

  { name: 'i-lucide-package', category: 'Прочее' },
  { name: 'i-lucide-box', category: 'Прочее' },
  { name: 'i-lucide-clipboard-list', category: 'Прочее' },
  { name: 'i-lucide-notebook', category: 'Прочее' },
  { name: 'i-lucide-book-open', category: 'Прочее' },
  { name: 'i-lucide-library', category: 'Прочее' },
  { name: 'i-lucide-database', category: 'Прочее' },
  { name: 'i-lucide-server', category: 'Прочее' },
  { name: 'i-lucide-code', category: 'Прочее' },
  { name: 'i-lucide-terminal', category: 'Прочее' },
]

const searchQuery = ref('')
const activeCategory = ref('Все')
const copiedIcon = ref('')

const categories = computed(() => {
  const cats = ['Все', ...new Set(allIcons.map(icon => icon.category))]
  return cats
})

const filteredIcons = computed(() => {
  let filtered = allIcons

  // Filter by category
  if (activeCategory.value !== 'Все') {
    filtered = filtered.filter(icon => icon.category === activeCategory.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(icon =>
      icon.name.toLowerCase().includes(query) ||
      icon.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

const copyIconName = async (iconName: string) => {
  try {
    await navigator.clipboard.writeText(iconName)
    copiedIcon.value = iconName
    setTimeout(() => {
      copiedIcon.value = ''
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>
