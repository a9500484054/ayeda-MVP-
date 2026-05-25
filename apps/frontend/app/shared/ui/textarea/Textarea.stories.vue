<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Textarea - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          Textarea - компонент для многострочного ввода текста с поддержкой меток, ошибок и подсказок.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">modelValue</code> - значение поля (обязательно)</li>
            <li><code class="bg-gray-200 px-1 rounded">label</code> - заголовок поля</li>
            <li><code class="bg-gray-200 px-1 rounded">placeholder</code> - плейсхолдер</li>
            <li><code class="bg-gray-200 px-1 rounded">rows</code> - количество строк (по умолчанию 3)</li>
            <li><code class="bg-gray-200 px-1 rounded">error</code> - текст ошибки</li>
            <li><code class="bg-gray-200 px-1 rounded">hint</code> - подсказка</li>
            <li><code class="bg-gray-200 px-1 rounded">required</code> - обязательное поле</li>
            <li><code class="bg-gray-200 px-1 rounded">disabled</code> - отключенное состояние</li>
          </ul>
        </div>
      </div>

      <!-- Примеры -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Базовый</h3>
          <Textarea
            v-model="basicValue"
            label="Описание"
            placeholder="Введите описание..."
          />
          <p class="text-sm text-gray-500 mt-2">
            Длина: {{ basicValue.length }} символов
          </p>
        </div>

        <!-- С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С подсказкой</h3>
          <Textarea
            v-model="hintValue"
            label="Комментарий"
            placeholder="Напишите ваш комментарий..."
            hint="Максимум 500 символов"
          />
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С ошибкой</h3>
          <Textarea
            v-model="errorValue"
            label="Отзыв"
            placeholder="Напишите отзыв..."
            error="Отзыв не может быть пустым"
          />
        </div>

        <!-- Обязательное поле -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Обязательное поле</h3>
          <Textarea
            v-model="requiredValue"
            label="Сообщение"
            placeholder="Введите сообщение..."
            required
          />
        </div>

        <!-- Разное количество строк -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">5 строк</h3>
          <Textarea
            v-model="rowsValue"
            label="Полное описание"
            placeholder="Подробное описание..."
            :rows="5"
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disabled</h3>
          <Textarea
            v-model="disabledValue"
            label="Заблокировано"
            placeholder="Это поле недоступно"
            disabled
          />
        </div>

        <!-- Счетчик символов -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Счетчик символов</h3>
          <Textarea
            v-model="counterValue"
            label="Биография"
            placeholder="Расскажите о себе..."
            :hint="`${counterValue.length}/200 символов`"
          />
          <div class="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div
              class="bg-emerald-600 h-1 rounded-full transition-all"
              :style="{ width: `${Math.min((counterValue.length / 200) * 100, 100)}%` }"
            />
          </div>
        </div>

        <!-- Валидация в реальном времени -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Валидация в реальном времени</h3>
          <Textarea
            v-model="validatedValue"
            label="Твит"
            placeholder="Что происходит?"
            :error="tweetError"
            :hint="`${validatedValue.length}/140 символов`"
            @blur="validateTweet"
          />
          <div class="mt-2 flex justify-between text-xs">
            <span class="text-gray-400">Минимум 10 символов</span>
            <span :class="validatedValue.length <= 140 ? 'text-gray-400' : 'text-red-500'">
              {{ validatedValue.length }}/140
            </span>
          </div>
        </div>
      </div>

      <!-- Форма обратной связи (комплексный пример) -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Форма обратной связи</h2>
        <form class="space-y-4" @submit.prevent="handleFeedbackSubmit">
          <Input
            v-model="feedbackForm.name"
            label="Имя"
            placeholder="Введите ваше имя"
            required
          />
          <Input
            v-model="feedbackForm.email"
            label="Email"
            type="email"
            placeholder="user@example.com"
            required
          />
          <Textarea
            v-model="feedbackForm.message"
            label="Сообщение"
            placeholder="Напишите ваше сообщение..."
            :rows="4"
            :error="feedbackForm.messageError"
            required
            @blur="validateMessage"
          />
          <div class="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" @click="resetFeedbackForm">
              Очистить
            </Button>
            <Button type="submit" color="primary">
              Отправить
            </Button>
          </div>
          <div v-if="feedbackSuccess" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Сообщение успешно отправлено! Спасибо за обратную связь.
          </div>
        </form>
      </div>

      <!-- Лог изменений -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог изменений</h2>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не изменялось
          </div>
        </div>
        <Button v-if="logs.length" size="sm" variant="ghost" class="mt-4" @click="clearLogs">
          Очистить лог
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Textarea from './Textarea.vue'
import Input from '../input/Input.vue'
import Button from '../button/Button.vue'

// Basic values
const basicValue = ref('')
const hintValue = ref('')
const errorValue = ref('')
const requiredValue = ref('')
const rowsValue = ref('')
const disabledValue = ref('Это поле заблокировано')
const counterValue = ref('')
const validatedValue = ref('')

// Validation
const tweetError = ref('')

// Feedback form
const feedbackForm = ref({
  name: '',
  email: '',
  message: '',
  messageError: ''
})
const feedbackSuccess = ref(false)

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

// Watch for changes
watch(basicValue, (val) => addLog(`basicValue изменен: "${val}" (${val.length} симв.)`))
watch(hintValue, (val) => addLog(`hintValue изменен: "${val}"`))
watch(rowsValue, (val) => addLog(`rowsValue изменен: "${val}"`))
watch(counterValue, (val) => addLog(`counterValue: ${val.length}/200 символов`))

// Tweet validation
const validateTweet = () => {
  const length = validatedValue.value.length

  if (length < 10 && length > 0) {
    tweetError.value = 'Минимум 10 символов'
  } else if (length > 140) {
    tweetError.value = 'Максимум 140 символов'
  } else {
    tweetError.value = ''
  }

  addLog(`Твит валидация: ${length}/140 символов, ошибка: ${tweetError.value || 'нет'}`)
}

// Message validation
const validateMessage = () => {
  const message = feedbackForm.value.message

  if (!message.trim()) {
    feedbackForm.value.messageError = 'Сообщение не может быть пустым'
  } else if (message.length < 10) {
    feedbackForm.value.messageError = 'Сообщение должно содержать минимум 10 символов'
  } else if (message.length > 1000) {
    feedbackForm.value.messageError = 'Сообщение не должно превышать 1000 символов'
  } else {
    feedbackForm.value.messageError = ''
  }
}

// Feedback form handlers
const handleFeedbackSubmit = () => {
  validateMessage()

  if (!feedbackForm.value.name) {
    addLog('Ошибка: Имя не заполнено')
    return
  }

  if (!feedbackForm.value.email) {
    addLog('Ошибка: Email не заполнен')
    return
  }

  if (feedbackForm.value.messageError) {
    addLog('Ошибка: Сообщение заполнено неверно')
    return
  }

  if (!feedbackForm.value.message) {
    addLog('Ошибка: Сообщение не заполнено')
    return
  }

  addLog(`Форма отправлена: ${feedbackForm.value.name} (${feedbackForm.value.email}) - Сообщение: ${feedbackForm.value.message.length} симв.`)

  feedbackSuccess.value = true
  resetFeedbackForm()

  setTimeout(() => {
    feedbackSuccess.value = false
  }, 3000)
}

const resetFeedbackForm = () => {
  feedbackForm.value = {
    name: '',
    email: '',
    message: '',
    messageError: ''
  }
}
</script>
