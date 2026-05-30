<template>
  <div
    class="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-darkMode-100"
  >
    <!-- Круглый чекбокс -->
    <button
      class="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
      :class="[
        item.isChecked
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md'
          : 'border-2 border-gray-300 bg-white hover:border-emerald-500 hover:shadow-md dark:border-darkMode-600 dark:bg-darkMode-800'
      ]"
      @click.stop="emit('toggle')"
    >
      <UIcon
        v-if="item.isChecked"
        name="i-lucide-check"
        class="h-3.5 w-3.5 text-white"
      />
    </button>

    <!-- Иконка категории с Popover -->
    <UPopover
      ref="popoverRef"
      mode="click"
      :content="{
        align: 'start',
        side: 'bottom',
        sideOffset: 8
      }"
    >
      <button
        class="cursor-pointer transition-transform hover:scale-110"
        @click.stop
        :title="categoryTooltip"
      >
        <CategoryIcon :category="currentCategory" />
      </button>

      <template #content>
        <div class="p-3 bg-white dark:bg-darkMode-100 rounded-xl shadow-lg">
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="cat in categoriesWithIcons"
              :key="cat.id"
              class="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-darkMode-200 cursor-pointer group"
              :title="getCategoryTooltip(cat)"
              @click="selectCategory(cat)"
            >
              <CategoryIcon :category="cat" />
            </button>
          </div>
        </div>
      </template>
    </UPopover>

    <!-- Название и количество -->
    <div class="flex-1 min-w-0">
      <div class="flex flex-wrap items-baseline gap-1">
        <span
          class="text-gray-900 dark:text-darkMode-900"
          :class="{ 'line-through text-gray-400 dark:text-gray-500': item.isChecked }"
        >
          {{ item.name }}
        </span>
        <span class="text-sm text-gray-400">
          {{ item.quantity }} {{ item.unit }}
        </span>
        <span v-if="item.price" class="text-sm text-gray-500">
          {{ item.price }} ₽
        </span>
      </div>

      <!-- Заметка -->
      <div v-if="item.note" class="mt-1 text-xs text-gray-400">
        📝 {{ item.note }}
      </div>
    </div>

    <!-- Действия при ховере -->
    <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <!-- Кнопка редактирования -->
      <Button
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="sm"
        icon-only
        class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-darkMode-200"
        @click.stop="emit('edit')"
      />

      <!-- UPopover для подтверждения удаления -->
      <UPopover
        :content="{
          side: 'top',    // Показывать сверху от кнопки
          align: 'end',   // Выровнять по правому краю кнопки
          sideOffset: 8   // Отступ от кнопки
        }"
        arrow
      >
        <!-- Кнопка-триггер -->
        <Button
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          size="sm"
          icon-only
          class="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
        />

        <!-- Содержимое всплывающего окна -->
        <template #content="{ close }">
          <div class="p-4 min-w-[240px]">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-red-500" />
              <h4 class="font-semibold text-gray-900 dark:text-white">
                Удалить элемент?
              </h4>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Это действие нельзя отменить. Элемент будет удален навсегда.
            </p>
            <!-- Кнопки с вашим компонентом Button -->
            <div class="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                color="neutral"
                @click="close"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                color="danger"
                @click="
                  () => {
                    close();
                    emit('delete');
                  }
                "
              >
                Удалить
              </Button>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ShoppingListItem } from '~/shared/types/shopping.types'
import Button from '~/shared/ui/button/Button.vue'
import CategoryIcon from './shared/CategoryIcon.vue'

interface Category {
  id: string
  code: string
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
}

const props = defineProps<{
  item: ShoppingListItem
  categories?: Category[]
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: []
  'update-category': [categoryId: string]
}>()

const popoverRef = ref<any>(null)

// Получение ID категории из item
const getItemCategoryId = (): string => {
  return props.item.category?.id || props.item.categoryId || ''
}

// Текущий ID категории
const currentCategoryId = ref(getItemCategoryId())

// Получение текущей категории
const currentCategory = computed(() => {
  if (!currentCategoryId.value) return null
  if (!props.categories?.length) return null
  return props.categories.find(c => c.id === currentCategoryId.value) || null
})

// Красивый tooltip для текущей категории
const categoryTooltip = computed(() => {
  if (currentCategory.value) {
    return getCategoryTooltip(currentCategory.value)
  }
  return 'Выберите категорию'
})

// Функция для получения красивого описания категории
const getCategoryTooltip = (category: Category): string => {
  const tooltips: Record<string, string> = {
    'vegetables': 'Овощи и зелень 🥕',
    'fruits': 'Фрукты и ягоды 🍎',
    'meat': 'Мясо и птица 🍗',
    'fish': 'Рыба и морепродукты 🐟',
    'dairy': 'Молочные продукты 🥛',
    'eggs': 'Яйца и яичные продукты 🥚',
    'bakery': 'Хлеб и выпечка 🥖',
    'grocery': 'Бакалея и крупы 📦',
    'beverages': 'Напитки 🧃',
    'sauces': 'Соусы и приправы 🧂',
    'frozen': 'Замороженные продукты ❄️',
    'ready_meals': 'Готовая еда 🍱',
    'household': 'Товары для дома 🏠',
    'other': 'Прочие товары 📦'
  }
  return tooltips[category.code] || category.name
}

// Следим за изменениями item
watch(() => props.item.category, (newCategory) => {
  if (newCategory?.id && newCategory.id !== currentCategoryId.value) {
    currentCategoryId.value = newCategory.id
  }
}, { deep: true })

// Следим за загрузкой categories
watch(() => props.categories, (newCategories) => {
  if (newCategories?.length) {
    const newId = getItemCategoryId()
    if (newId && newId !== currentCategoryId.value) {
      currentCategoryId.value = newId
    }
  }
}, { immediate: true })

// Категории для попапа
const categoriesWithIcons = computed(() => {
  if (!props.categories?.length) return []
  return props.categories.filter(cat => cat.isActive !== false)
})

const selectCategory = async (category: Category) => {
  currentCategoryId.value = category.id

  if (popoverRef.value) {
    if (typeof popoverRef.value.close === 'function') {
      popoverRef.value.close()
    } else if (typeof popoverRef.value.hide === 'function') {
      popoverRef.value.hide()
    } else if (popoverRef.value.$emit) {
      popoverRef.value.$emit('update:open', false)
    }
  }

  emit('update-category', category.id)
}
</script>
