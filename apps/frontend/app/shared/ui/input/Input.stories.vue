<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Input - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          Input - универсальное поле ввода с поддержкой иконок, валидации и подсказок.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">modelValue</code> - значение поля (обязательно)</li>
            <li><code class="bg-gray-200 px-1 rounded">label</code> - заголовок поля</li>
            <li><code class="bg-gray-200 px-1 rounded">type</code> - тип поля (text, number, email, password, tel)</li>
            <li><code class="bg-gray-200 px-1 rounded">placeholder</code> - плейсхолдер</li>
            <li><code class="bg-gray-200 px-1 rounded">icon</code> - иконка слева</li>
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
          <Input
            v-model="basicValue"
            label="Имя"
            placeholder="Введите ваше имя"
          />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ basicValue || '—' }}</p>
        </div>

        <!-- С иконкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С иконкой</h3>
          <Input
            v-model="iconValue"
            label="Email"
            type="email"
            placeholder="user@example.com"
            icon="i-lucide-mail"
          />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ iconValue || '—' }}</p>
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С ошибкой</h3>
          <Input
            v-model="errorValue"
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            icon="i-lucide-lock"
            error="Пароль должен содержать минимум 6 символов"
          />
        </div>

        <!-- С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С подсказкой</h3>
          <Input
            v-model="hintValue"
            label="Телефон"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            icon="i-lucide-phone"
            hint="Введите номер в международном формате"
          />
        </div>

        <!-- Number тип -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Number тип</h3>
          <Input
            v-model="numberValue"
            label="Количество"
            type="number"
            placeholder="0"
            icon="i-lucide-hash"
          />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ numberValue || '—' }}</p>
        </div>

        <!-- Обязательное поле -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Обязательное поле</h3>
          <Input
            v-model="requiredValue"
            label="Название"
            placeholder="Введите название"
            required
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disabled</h3>
          <Input
            v-model="disabledValue"
            label="Недоступно"
            placeholder="Это поле заблокировано"
            disabled
          />
        </div>

        <!-- Email с валидацией в реальном времени -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Валидация email</h3>
          <Input
            v-model="emailValue"
            label="Email"
            type="email"
            placeholder="user@example.com"
            icon="i-lucide-at-sign"
            :error="emailError"
            @blur="validateEmail"
          />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ emailValue || '—' }}</p>
        </div>

        <!-- Форма регистрации (комплексный пример) -->
        <div class="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Форма регистрации (пример)</h3>
          <div class="space-y-4">
            <Input
              v-model="registerName"
              label="Имя"
              placeholder="Введите ваше имя"
              icon="i-lucide-user"
              required
            />
            <Input
              v-model="registerEmail"
              label="Email"
              type="email"
              placeholder="user@example.com"
              icon="i-lucide-mail"
              :error="registerEmailError"
              required
              @blur="validateRegisterEmail"
            />
            <Input
              v-model="registerPassword"
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              icon="i-lucide-lock"
              :error="registerPasswordError"
              required
              @blur="validateRegisterPassword"
            />
            <Button @click="handleRegister">
              Зарегистрироваться
            </Button>
          </div>
          <p v-if="registerSuccess" class="text-green-600 text-sm mt-4">
            Успешная регистрация!
          </p>
        </div>
      </div>

      <!-- Лог изменений -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог изменений</h2>
        <div class="space-y-2">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            {{ log.message }}
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
import Input from './Input.vue'
import Button from '../button/Button.vue'

// State for examples
const basicValue = ref('')
const iconValue = ref('')
const errorValue = ref('')
const hintValue = ref('')
const numberValue = ref<number | string>(0)
const requiredValue = ref('')
const disabledValue = ref('Заблокированное значение')
const emailValue = ref('')
const emailError = ref('')

// Registration form
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerEmailError = ref('')
const registerPasswordError = ref('')
const registerSuccess = ref(false)

// Logs
interface Log {
  id: number
  message: string
}
const logs = ref<Log[]>([])
let nextId = 1

const addLog = (message: string) => {
  logs.value.unshift({
    id: nextId++,
    message: `[${new Date().toLocaleTimeString()}] ${message}`
  })
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

// Watch for changes
watch(basicValue, (val) => addLog(`basicValue изменился: ${val || '(пусто)'}`))
watch(iconValue, (val) => addLog(`iconValue изменился: ${val || '(пусто)'}`))
watch(numberValue, (val) => addLog(`numberValue изменился: ${val}`))
watch(emailValue, (val) => {
  if (emailError.value) validateEmail()
})

// Email validation
const validateEmail = () => {
  const email = emailValue.value
  if (!email) {
    emailError.value = ''
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email as string)) {
    emailError.value = 'Введите корректный email адрес'
  } else {
    emailError.value = ''
  }
}

// Registration validations
const validateRegisterEmail = () => {
  const email = registerEmail.value
  if (!email) {
    registerEmailError.value = 'Email обязателен'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    registerEmailError.value = 'Введите корректный email адрес'
  } else {
    registerEmailError.value = ''
  }
}

const validateRegisterPassword = () => {
  const password = registerPassword.value
  if (!password) {
    registerPasswordError.value = 'Пароль обязателен'
    return
  }

  if (password.length < 6) {
    registerPasswordError.value = 'Пароль должен содержать минимум 6 символов'
  } else {
    registerPasswordError.value = ''
  }
}

const handleRegister = () => {
  validateRegisterEmail()
  validateRegisterPassword()

  if (!registerName.value) {
    addLog('Ошибка: Имя не заполнено')
    return
  }

  if (registerEmailError.value || registerPasswordError.value) {
    addLog('Ошибка: Форма заполнена неверно')
    return
  }

  if (!registerName.value || !registerEmail.value || !registerPassword.value) {
    addLog('Ошибка: Не все поля заполнены')
    return
  }

  registerSuccess.value = true
  addLog(`Успешная регистрация: ${registerName.value} (${registerEmail.value})`)

  // Сброс через 3 секунды
  setTimeout(() => {
    registerSuccess.value = false
  }, 3000)
}
</script>
