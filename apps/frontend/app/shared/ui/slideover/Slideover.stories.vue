<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Slideover - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          Slideover - компонент для создания выезжающих панелей (слайдоверов) справа.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">open</code> - открыт/закрыт</li>
            <li><code class="bg-gray-200 px-1 rounded">title</code> - заголовок</li>
            <li><code class="bg-gray-200 px-1 rounded">closeOnOverlay</code> - закрытие по клику на overlay</li>
            <li><code class="bg-gray-200 px-1 rounded">headerClass</code> - кастомный класс для header</li>
            <li><code class="bg-gray-200 px-1 rounded">titleClass</code> - кастомный класс для заголовка</li>
            <li><code class="bg-gray-200 px-1 rounded">closeButtonColor</code> - цвет кнопки закрытия</li>
          </ul>
        </div>
      </div>

      <!-- Примеры кнопок для открытия -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Базовый</h3>
          <p class="text-gray-500 text-sm mb-4">Стандартный слайдовер с заголовком</p>
          <Button @click="openBasic">Открыть базовый</Button>
        </div>

        <!-- Без заголовка -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Без заголовка</h3>
          <p class="text-gray-500 text-sm mb-4">Слайдовер без заголовка</p>
          <Button @click="openNoTitle">Открыть без заголовка</Button>
        </div>

        <!-- С кастомным заголовком -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Кастомный заголовок</h3>
          <p class="text-gray-500 text-sm mb-4">С иконкой и дополнительными элементами</p>
          <Button @click="openCustomTitle">Открыть с кастомным заголовком</Button>
        </div>

        <!-- С длинным контентом -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Длинный контент</h3>
          <p class="text-gray-500 text-sm mb-4">С прокруткой внутри</p>
          <Button @click="openLongContent">Открыть с длинным контентом</Button>
        </div>

        <!-- С формой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">С формой</h3>
          <p class="text-gray-500 text-sm mb-4">Пример с формой в слайдовере</p>
          <Button @click="openWithForm">Открыть с формой</Button>
        </div>

        <!-- Кастомные стили -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Кастомные стили</h3>
          <p class="text-gray-500 text-sm mb-4">Свой цвет header и заголовка</p>
          <Button @click="openCustomStyles">Кастомный стиль</Button>
        </div>
      </div>

      <!-- Лог действий -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог действий</h2>
        <div class="space-y-2">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не происходило
          </div>
        </div>
        <Button v-if="logs.length" size="sm" variant="ghost" class="mt-4" @click="clearLogs">
          Очистить лог
        </Button>
      </div>
    </div>

    <!-- Слайдоверы -->

    <!-- Базовый -->
    <Slideover
      :open="basicOpen"
      title="Базовый слайдовер"
      @update:open="basicOpen = false"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">Это базовый слайдовер с заголовком.</p>
          <p class="text-gray-600">Вы можете разместить здесь любой контент.</p>
          <Button block @click="basicOpen = false">Закрыть</Button>
        </div>
      </template>
    </Slideover>

    <!-- Без заголовка -->
    <Slideover
      :open="noTitleOpen"
      @update:open="noTitleOpen = false"
    >
      <template #body>
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Слайдовер без заголовка</h3>
          <p class="text-gray-600">Здесь нет стандартного header с заголовком и кнопкой закрытия.</p>
          <Button block @click="noTitleOpen = false">Закрыть</Button>
        </div>
      </template>
    </Slideover>

    <!-- Кастомный заголовок -->
    <Slideover
      :open="customTitleOpen"
      @update:open="customTitleOpen = false"
    >
      <template #header>
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-star" class="h-6 w-6 text-yellow-400" />
              <h2 class="text-xl font-semibold text-white">Кастомный заголовок</h2>
            </div>
            <Button
              @click="customTitleOpen = false"
              variant="ghost"
              color="white"
              size="sm"
              icon="i-lucide-x"
              icon-only
            />
          </div>
          <p class="text-blue-100 text-sm mt-2">Дополнительная информация в заголовке</p>
        </div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">Этот слайдовер использует кастомный слот для заголовка.</p>
          <p class="text-gray-600">Можно добавить иконки, описание, дополнительные кнопки.</p>
        </div>
      </template>
    </Slideover>

    <!-- Длинный контент -->
    <Slideover
      :open="longContentOpen"
      title="Длинный контент"
      @update:open="longContentOpen = false"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">Здесь много контента, чтобы показать прокрутку.</p>
          <div v-for="i in 20" :key="i" class="p-3 bg-gray-50 rounded-lg">
            <p class="text-gray-700">Пункт {{ i }}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </template>
    </Slideover>

    <!-- С формой -->
    <Slideover
      :open="formOpen"
      title="Форма обратной связи"
      @update:open="formOpen = false"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleFormSubmit">
          <Input
            v-model="formData.name"
            label="Имя"
            placeholder="Введите ваше имя"
            required
          />
          <Input
            v-model="formData.email"
            label="Email"
            type="email"
            placeholder="user@example.com"
            required
          />
          <Textarea
            v-model="formData.message"
            label="Сообщение"
            placeholder="Введите ваше сообщение..."
            :rows="4"
            required
          />
          <div class="flex gap-3 pt-4">
            <Button type="submit" color="primary">Отправить</Button>
            <Button type="button" variant="ghost" @click="formOpen = false">Отмена</Button>
          </div>
        </form>
      </template>
    </Slideover>

    <!-- Кастомные стили -->
    <Slideover
      :open="customStylesOpen"
      title="Кастомные стили"
      header-class="bg-gradient-to-r from-purple-700 to-pink-700"
      title-class="text-purple-100 text-2xl"
      close-button-color="white"
      close-button-class="bg-purple-600 hover:bg-purple-500 text-white"
      @update:open="customStylesOpen = false"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600">Слайдовер с кастомными стилями:</p>
          <ul class="list-disc list-inside text-gray-600 space-y-1">
            <li>Свой цвет header (градиент purple-pink)</li>
            <li>Свой размер и цвет заголовка</li>
            <li>Свой цвет кнопки закрытия</li>
          </ul>
        </div>
      </template>
    </Slideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Slideover from './Slideover.vue'
import Button from '../button/Button.vue'
import Input from '../input/Input.vue'
import Textarea from '../textarea/Textarea.vue'

// State for slideovers
const basicOpen = ref(false)
const noTitleOpen = ref(false)
const customTitleOpen = ref(false)
const longContentOpen = ref(false)
const formOpen = ref(false)
const customStylesOpen = ref(false)

// Form data
const formData = ref({
  name: '',
  email: '',
  message: ''
})

// Logs
interface Log {
  id: number
  message: string
  timestamp: string
}

const logs = ref<Log[]>([])
let nextId = 1

const addLog = (message: string) => {
  logs.value.unshift({
    id: nextId++,
    message,
    timestamp: new Date().toLocaleTimeString()
  })

  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

// Open handlers
const openBasic = () => {
  basicOpen.value = true
  addLog('Открыт базовый слайдовер')
}

const openNoTitle = () => {
  noTitleOpen.value = true
  addLog('Открыт слайдовер без заголовка')
}

const openCustomTitle = () => {
  customTitleOpen.value = true
  addLog('Открыт слайдовер с кастомным заголовком')
}

const openLongContent = () => {
  longContentOpen.value = true
  addLog('Открыт слайдовер с длинным контентом')
}

const openWithForm = () => {
  formOpen.value = true
  addLog('Открыт слайдовер с формой')
}

const openCustomStyles = () => {
  customStylesOpen.value = true
  addLog('Открыт слайдовер с кастомными стилями')
}

// Form submit handler
const handleFormSubmit = () => {
  addLog(`Форма отправлена: Имя=${formData.value.name}, Email=${formData.value.email}`)

  // Reset form
  formData.value = {
    name: '',
    email: '',
    message: ''
  }

  formOpen.value = false
}
</script>
