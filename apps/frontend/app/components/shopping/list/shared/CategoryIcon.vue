<template>
  <div
    class="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
    :class="bgColorClass"
    :title="tooltipText"
  >
    <UIcon
      :name="iconName"
      class="h-4 w-4"
      :class="iconColor"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Category {
  id?: string
  code?: string
  name?: string
  icon?: string
}

const props = defineProps<{
  category?: Category | null
  icon?: string
  name?: string
  code?: string
}>()

const getIconName = (iconName?: string): string => {
  if (!iconName) return 'i-lucide-package'
  if (iconName.startsWith('i-lucide-')) return iconName
  return `i-lucide-${iconName}`
}

// Получение кода категории
const categoryCode = computed(() => {
  if (props.code) return props.code
  if (props.category?.code) return props.category.code
  return null
})

// Получение иконки
const categoryIcon = computed(() => {
  if (props.icon) return props.icon
  if (props.category?.icon) return props.category.icon
  return null
})

const iconName = computed(() => {
  if (categoryIcon.value) return getIconName(categoryIcon.value)
  return 'i-lucide-package'
})

// Красивый текст для подсказки
const tooltipText = computed(() => {
  const name = props.category?.name || props.name || ''
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
  if (categoryCode.value && tooltips[categoryCode.value]) {
    return tooltips[categoryCode.value]
  }
  return name || 'Категория'
})

// Цвет фона по коду категории
const getBgColorByCode = (code: string): string => {
  const colors: Record<string, string> = {
    'vegetables': 'bg-emerald-100 dark:bg-emerald-900/30',
    'fruits': 'bg-red-100 dark:bg-red-900/30',
    'meat': 'bg-amber-100 dark:bg-amber-900/30',
    'fish': 'bg-blue-100 dark:bg-blue-900/30',
    'dairy': 'bg-sky-100 dark:bg-sky-900/30',
    'eggs': 'bg-yellow-100 dark:bg-yellow-900/30',
    'bakery': 'bg-amber-100 dark:bg-amber-900/30',
    'grocery': 'bg-stone-100 dark:bg-stone-800/50',
    'beverages': 'bg-orange-100 dark:bg-orange-900/30',
    'sauces': 'bg-purple-100 dark:bg-purple-900/30',
    'frozen': 'bg-cyan-100 dark:bg-cyan-900/30',
    'ready_meals': 'bg-emerald-100 dark:bg-emerald-900/30',
    'household': 'bg-indigo-100 dark:bg-indigo-900/30',
    'other': 'bg-gray-100 dark:bg-gray-800/50'
  }
  return colors[code] || 'bg-gray-100 dark:bg-gray-800/50'
}

// Цвет иконки по коду
const getIconColorByCode = (code: string): string => {
  const colors: Record<string, string> = {
    'vegetables': 'text-emerald-600 dark:text-emerald-400',
    'fruits': 'text-red-600 dark:text-red-400',
    'meat': 'text-amber-600 dark:text-amber-400',
    'fish': 'text-blue-600 dark:text-blue-400',
    'dairy': 'text-sky-600 dark:text-sky-400',
    'eggs': 'text-yellow-600 dark:text-yellow-400',
    'bakery': 'text-amber-600 dark:text-amber-400',
    'grocery': 'text-stone-600 dark:text-stone-400',
    'beverages': 'text-orange-600 dark:text-orange-400',
    'sauces': 'text-purple-600 dark:text-purple-400',
    'frozen': 'text-cyan-600 dark:text-cyan-400',
    'ready_meals': 'text-emerald-600 dark:text-emerald-400',
    'household': 'text-indigo-600 dark:text-indigo-400',
    'other': 'text-gray-600 dark:text-gray-400'
  }
  return colors[code] || 'text-gray-600 dark:text-gray-400'
}

const bgColorClass = computed(() => {
  if (categoryCode.value) {
    return getBgColorByCode(categoryCode.value)
  }
  return 'bg-gray-100 dark:bg-gray-800/50'
})

const iconColor = computed(() => {
  if (categoryCode.value) {
    return getIconColorByCode(categoryCode.value)
  }
  return 'text-gray-600 dark:text-gray-400'
})
</script>
