<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  layout: false,
  ssr: false
})

const pending = ref(false);
const success = ref(false);
const serverError = ref("");

// Схема валидации с zod
const validationSchema = toTypedSchema(z.object({
  email: z.string()
    .min(1, "Email обязателен")
    .email("Введите корректный email")
}));

// useForm с vee-validate
const { defineField, errors, handleSubmit, setFieldError } = useForm({
  validationSchema,
  initialValues: {
    email: ""
  }
});

// Поля формы
const [email, emailAttrs] = defineField("email");

// Отправка формы
const onSubmit = handleSubmit(async (values) => {
  pending.value = true;
  serverError.value = "";

  try {
    // Здесь будет запрос на сброс пароля
    // await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: values.email } })

    // Имитация запроса
    const response = await $fetch('http://localhost:3001/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: {
        email: values.email
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    success.value = true;
  } catch (err: any) {
    serverError.value = err.message || "Не удалось отправить запрос. Попробуйте позже.";
    if (err.message?.includes("email")) setFieldError("email", err.message);
  } finally {
    pending.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Левая часть - Брендинг -->
    <div class="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-700 to-teal-800 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-30"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <UIcon name="i-lucide-utensils" class="w-5 h-5 text-emerald-600" />
          </div>
          <span class="text-2xl font-bold text-white">AyEda</span>
        </div>
      </div>

      <div class="relative z-10">
        <div class="mb-6">
          <div class="text-7xl mb-4">🔐</div>
          <h2 class="text-4xl font-bold text-white mb-3">Восстановление доступа</h2>
          <p class="text-emerald-100 text-lg leading-relaxed">
            Не волнуйтесь! Мы отправим инструкции по восстановлению пароля на вашу почту.
          </p>
        </div>

        <div class="space-y-3">
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

        <div class="mt-8 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
          <p class="text-white/90 text-sm italic">
            "Сбросил пароль за 2 минуты. Очень удобно!"
          </p>
          <p class="text-emerald-200 text-xs mt-2">— Михаил, пользователь AyEda</p>
        </div>
      </div>

      <div class="relative z-10 text-white/40 text-sm">
        © 2026 AyEda
      </div>
    </div>

    <!-- Правая часть - Форма восстановления -->
    <div class="flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <div class="flex justify-center mb-8 lg:hidden">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
            </div>
            <span class="text-2xl font-bold text-gray-900">AyEda</span>
          </div>
        </div>

        <div class="mb-8">
          <h1 class="text-3xl font-black text-gray-900 mb-1">Забыли пароль?</h1>
          <p class="text-gray-500">Введите email, и мы вышлем инструкции для восстановления</p>
        </div>

        <!-- Сообщение об успехе -->
        <Transition name="fade">
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
        </Transition>

        <!-- Форма -->
        <form @submit="onSubmit" class="space-y-5">
          <!-- Email поле -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-bind="emailAttrs"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Server error -->
          <Transition name="fade">
            <div v-if="serverError" class="p-3 bg-red-50 rounded-xl border border-red-200">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
                <p class="text-sm text-red-600">{{ serverError }}</p>
              </div>
            </div>
          </Transition>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending" class="flex items-center justify-center gap-2">
              Отправить инструкции
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Отправка...
            </span>
          </button>

          <!-- Login link -->
          <div class="text-center pt-4">
            <NuxtLink to="/login" class="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1">
              <UIcon name="i-lucide-arrow-left" class="w-3 h-3" />
              Вернуться ко входу
            </NuxtLink>
          </div>
        </form>

        <!-- Help -->
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
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
