<script setup lang="ts">
import { ref } from "vue";

definePageMeta({
  layout: 'auth'
})

const email = ref("");
const pending = ref(false);
const success = ref(false);
const error = ref("");

async function submit() {
  if (!email.value) {
    error.value = "Введите email";
    return;
  }

  pending.value = true;
  error.value = "";

  try {
    // Здесь будет запрос на сброс пароля
    // await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })

    // Имитация запроса
    await new Promise(resolve => setTimeout(resolve, 1500));

    success.value = true;
  } catch (err: any) {
    error.value = err.message || "Не удалось отправить запрос. Попробуйте позже.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Левая часть - Красивый фон -->
    <div class="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-teal-700 overflow-hidden">
      <!-- Декоративные элементы -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>

      <!-- Контент левой части -->
      <div class="relative z-10">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
          </div>
          <span class="text-2xl font-bold text-white">AyEda</span>
        </div>
      </div>

      <div class="relative z-10 max-w-md">
        <div class="text-6xl mb-6">🔐</div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Восстановление доступа
        </h2>
        <p class="text-emerald-100 leading-relaxed">
          Не волнуйтесь! Мы отправим инструкции по восстановлению пароля на вашу почту.
        </p>

        <!-- Советы -->
        <div class="mt-8 space-y-3">
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-mail" class="w-3 h-3" />
            </div>
            <span>Проверьте папку "Спам"</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
            </div>
            <span>Ссылка действительна 24 часа</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-shield" class="w-3 h-3" />
            </div>
            <span>Ваши данные в безопасности</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-white/60 text-sm">
        © 2026 AyEda. Все права защищены.
      </div>
    </div>

    <!-- Правая часть - Форма восстановления -->
    <div class="flex items-center justify-center p-6 lg:p-12 bg-white">
      <div class="w-full max-w-md">
        <!-- Мобильный логотип -->
        <div class="flex justify-center mb-8 lg:hidden">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
            </div>
            <span class="text-2xl font-bold text-gray-900">AyEda</span>
          </div>
        </div>

        <!-- Заголовок формы -->
        <div class="text-center lg:text-left mb-8">
          <h1 class="text-3xl lg:text-4xl font-black text-gray-900 mb-2">Забыли пароль?</h1>
          <p class="text-gray-500">Введите email, и мы вышлем инструкции для восстановления</p>
        </div>

        <!-- Сообщение об успехе -->
        <div v-if="success" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p class="text-sm text-emerald-700 font-medium">Письмо отправлено!</p>
              <p class="text-xs text-emerald-600 mt-1">
                Мы отправили инструкции по восстановлению пароля на {{ email }}.
                Проверьте почту и следуйте инструкциям.
              </p>
            </div>
          </div>
        </div>

        <!-- Форма -->
        <form v-else @submit.prevent="submit" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                required
              />
            </div>
          </div>

          <!-- Ошибка -->
          <p v-if="error" class="text-sm text-red-500 bg-red-50 rounded-xl p-3">
            {{ error }}
          </p>

          <!-- Кнопка отправки -->
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending">Отправить инструкции</span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Отправка...
            </span>
          </button>

          <!-- Ссылка на вход -->
          <div class="text-center pt-4">
            <NuxtLink to="/login" class="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
              <UIcon name="i-lucide-arrow-left" class="w-3 h-3" />
              Вернуться ко входу
            </NuxtLink>
          </div>
        </form>

        <!-- Помощь -->
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-xs text-gray-500 text-center">
            💡 Не приходит письмо? Проверьте папку "Спам" или
            <NuxtLink to="/support" class="text-emerald-600 hover:underline">свяжитесь с поддержкой</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

form {
  animation: fadeIn 0.5s ease-out;
}
</style>
