<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Select - Полная демонстрация</h1>

      <!-- Описание -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          Select - универсальный выпадающий список с поддержкой иконок, групп, кастомных слотов и много другого.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Возможности:</h3>
          <ul class="text-sm text-gray-600 space-y-1 grid grid-cols-2 gap-2">
            <li>✅ Базовый выбор</li>
            <li>✅ Иконки в опциях</li>
            <li>✅ Группировка</li>
            <li>✅ Кастомные слоты</li>
            <li>✅ Поиск/фильтрация</li>
            <li>✅ Состояния ошибок</li>
            <li>✅ Подсказки</li>
            <li>✅ Отключенное состояние</li>
            <li>✅ Обязательное поле</li>
            <li>✅ Программное управление</li>
          </ul>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- 1. Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📌 Базовый Select</h3>
          <Select
            v-model="basicValue"
            :options="basicOptions"
            label="Категория"
            placeholder="Выберите категорию"
          />
          <p class="text-sm text-gray-500 mt-2">Выбрано: {{ basicValue || 'ничего' }}</p>
        </div>

        <!-- 2. С иконками через слот -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🎨 С иконками (слот)</h3>
          <Select
            v-model="iconValue"
            :options="iconOptions"
            label="Категория"
            placeholder="Выберите категорию"
          >
            <template #options="{ options, isSelected, selectOption }">
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                :class="{ 'bg-emerald-50': isSelected(option.value) }"
                @click="selectOption(option)"
              >
                <UIcon :name="option.icon" class="h-4 w-4 text-gray-400" />
                <span class="flex-1 text-gray-700">{{ option.label }}</span>
                <UIcon
                  v-if="isSelected(option.value)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-emerald-600"
                />
              </button>
            </template>
          </Select>
        </div>

        <!-- 3. С группами -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📂 С группами</h3>
          <Select
            v-model="groupValue"
            :options="[]"
            label="Категории"
            placeholder="Выберите категорию"
          >
            <template #options="{ isSelected, selectOption }">
              <div v-for="group in groupedOptions" :key="group.label">
                <div class="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50">
                  {{ group.label }}
                </div>
                <button
                  v-for="option in group.items"
                  :key="option.value"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 pl-6 text-left text-sm transition-colors hover:bg-gray-100"
                  :class="{ 'bg-emerald-50': isSelected(option.value) }"
                  @click="selectOption(option)"
                >
                  <span class="text-gray-700">{{ option.label }}</span>
                  <UIcon
                    v-if="isSelected(option.value)"
                    name="i-lucide-check"
                    class="h-4 w-4 text-emerald-600"
                  />
                </button>
              </div>
            </template>
          </Select>
        </div>

        <!-- 4. С подзаголовками (кастомная карточка) -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💰 Тарифы (кастомная карточка)</h3>
          <Select
            v-model="priceValue"
            :options="[]"
            label="Выберите тариф"
            placeholder="Выберите тарифный план"
          >
            <template #options="{ isSelected, selectOption }">
              <button
                v-for="option in priceOptions"
                :key="option.value"
                type="button"
                class="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                :class="{ 'bg-emerald-50 ring-1 ring-emerald-200': isSelected(option.value) }"
                @click="selectOption(option)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">{{ option.label }}</div>
                    <div class="text-xs text-gray-500">{{ option.subtitle }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-emerald-600">{{ option.price }}</div>
                  </div>
                </div>
              </button>
            </template>
          </Select>
        </div>

        <!-- 5. С аватарками -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">👥 Пользователи</h3>
          <Select
            v-model="userValue"
            :options="[]"
            label="Выберите пользователя"
            placeholder="Выберите пользователя"
          >
            <template #options="{ isSelected, selectOption }">
              <button
                v-for="option in userOptions"
                :key="option.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100"
                :class="{ 'bg-emerald-50': isSelected(option.value) }"
                @click="selectOption(option)"
              >
                <img :src="option.avatar" class="h-8 w-8 rounded-full object-cover" />
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">{{ option.label }}</div>
                  <div class="text-xs text-gray-500">{{ option.email }}</div>
                </div>
                <UIcon
                  v-if="isSelected(option.value)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-emerald-600"
                />
              </button>
            </template>
          </Select>
        </div>

        <!-- 6. С хедером и футером -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 С хедером и футером</h3>
          <Select
            v-model="headerValue"
            :options="basicOptions"
            label="Категория"
            placeholder="Выберите категорию"
          >
            <template #header>
              <div class="px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 border-b border-emerald-100">
                🎯 Популярные категории
              </div>
            </template>
            <template #footer>
              <div class="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                Всего {{ basicOptions.length }} категорий
              </div>
            </template>
          </Select>
        </div>

        <!-- 7. С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ С ошибкой</h3>
          <Select
            v-model="errorValue"
            :options="basicOptions"
            label="Категория"
            error="Пожалуйста, выберите категорию"
            required
          />
        </div>

        <!-- 8. Отключенный -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Отключенный</h3>
          <Select
            v-model="disabledValue"
            :options="basicOptions"
            label="Категория"
            disabled
          />
        </div>

        <!-- 9. С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 С подсказкой</h3>
          <Select
            v-model="hintValue"
            :options="basicOptions"
            label="Тема"
            placeholder="Выберите тему"
            hint="Тема будет применена ко всему приложению"
          />
        </div>

        <!-- 10. Кастомное пустое состояние -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📭 Пустое состояние</h3>
          <Select
            v-model="emptyValue"
            :options="[]"
            label="Список"
            placeholder="Ничего нет"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center py-8 text-center">
                <UIcon name="i-lucide-inbox" class="h-10 w-10 text-gray-300 mb-2" />
                <p class="text-sm text-gray-400">Нет доступных опций</p>
                <button class="mt-2 text-xs text-emerald-600 hover:text-emerald-700">
                  + Добавить
                </button>
              </div>
            </template>
          </Select>
        </div>

        <!-- Добавьте в grid после существующих примеров -->

        <!-- 11. С поиском (в отдельном поле) -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 С поиском (отдельное поле)</h3>
          <Select
            v-model="searchValue"
            :options="manyOptions"
            label="Выберите город"
            placeholder="Выберите город"
            searchable
          />
          <p class="text-sm text-gray-500 mt-2">Выбрано: {{ searchValue || 'ничего' }}</p>
        </div>

        <!-- 12. С поиском в инпуте -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Поиск в инпуте</h3>
          <Select
            v-model="searchInInputValue"
            :options="manyOptions"
            label="Выберите город"
            placeholder="Введите название города..."
            searchable
            search-in-input
          />
          <p class="text-sm text-gray-500 mt-2">Выбрано: {{ searchInInputValue || 'ничего' }}</p>
        </div>

        <!-- 13. С поиском и кастомной фильтрацией -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Поиск с кастомной фильтрацией</h3>
          <Select
            v-model="customFilterValue"
            :options="iconOptions"
            label="Выберите категорию"
            placeholder="Поиск по названию или иконке..."
            searchable
            :filter-option="customFilter"
          >
            <template #options="{ options, isSelected, selectOption }">
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                :class="{ 'bg-emerald-50': isSelected(option.value) }"
                @click="selectOption(option)"
              >
                <UIcon :name="option.icon" class="h-4 w-4 text-gray-400" />
                <span class="flex-1 text-gray-700">{{ option.label }}</span>
                <UIcon
                  v-if="isSelected(option.value)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-emerald-600"
                />
              </button>
            </template>
          </Select>
        </div>
      </div>

      <!-- Много опций -->
      <div class="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 Много опций (50+)</h3>
        <Select
          v-model="manyValue"
          :options="manyOptions"
          label="Выберите город"
          placeholder="Выберите город из списка"
        />
      </div>

      <!-- Программное управление -->
      <div class="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🎮 Программное управление</h3>
        <div class="flex gap-3 mb-4">
          <Button size="sm" @click="programmaticSelect.open()">Открыть</Button>
          <Button size="sm" variant="outline" @click="programmaticSelect.close()">Закрыть</Button>
          <Button size="sm" variant="ghost" @click="programmaticSelect.toggle()">Переключить</Button>
        </div>
        <Select
          ref="programmaticSelect"
          v-model="programmaticValue"
          :options="basicOptions"
          label="Управляемый Select"
          placeholder="Выберите категорию"
        />
        <p class="text-sm text-gray-500 mt-2">Выбрано: {{ programmaticValue || 'ничего' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Select, { type SelectOption } from './Select.vue'
import Button from '../button/Button.vue'

// Базовые опции
const basicValue = ref(null)
const basicOptions = [
  { value: 'tech', label: 'Технологии' },
  { value: 'food', label: 'Еда' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'sports', label: 'Спорт' },
  { value: 'art', label: 'Искусство' }
]

// Опции с иконками
const iconValue = ref(null)
const iconOptions = [
  { value: 'tech', label: 'Технологии', icon: 'i-lucide-laptop' },
  { value: 'food', label: 'Еда', icon: 'i-lucide-coffee' },
  { value: 'travel', label: 'Путешествия', icon: 'i-lucide-plane' },
  { value: 'sports', label: 'Спорт', icon: 'i-lucide-bike' }
]

// Группированные опции
const groupValue = ref(null)
const groupedOptions = [
  {
    label: 'Популярные',
    items: [
      { value: 'tech', label: 'Технологии' },
      { value: 'food', label: 'Еда' }
    ]
  },
  {
    label: 'Развлечения',
    items: [
      { value: 'travel', label: 'Путешествия' },
      { value: 'sports', label: 'Спорт' },
      { value: 'art', label: 'Искусство' }
    ]
  }
]

// Тарифы
const priceValue = ref(null)
const priceOptions = [
  { value: 'basic', label: 'Базовый', subtitle: 'до 10 пользователей', price: '₽1,000/мес' },
  { value: 'pro', label: 'Профессиональный', subtitle: 'до 100 пользователей', price: '₽5,000/мес' },
  { value: 'enterprise', label: 'Корпоративный', subtitle: 'неограниченно', price: '₽20,000/мес' }
]

// Пользователи
const userValue = ref(null)
const userOptions = [
  { value: 1, label: 'Иван Иванов', email: 'ivan@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
  { value: 2, label: 'Мария Петрова', email: 'maria@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
  { value: 3, label: 'Алексей Сидоров', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?img=3' }
]

// Хедер/футер
const headerValue = ref(null)

// Состояния
const errorValue = ref(null)
const disabledValue = ref('tech')
const hintValue = ref(null)
const emptyValue = ref(null)
const manyValue = ref(null)

// Много опций
const manyOptions = Array.from({ length: 50 }, (_, i) => ({
  value: i,
  label: `Город ${i + 1}`
}))

// Программное управление
const programmaticSelect = ref()
const programmaticValue = ref(null)


// Поиск
const searchValue = ref(null)
const searchInInputValue = ref(null)
const customFilterValue = ref(null)

const customFilter = (option: SelectOption, query: string) => {
  return option.label.toLowerCase().includes(query) ||
         (option.icon && option.icon.toLowerCase().includes(query))
}
</script>
