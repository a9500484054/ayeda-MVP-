<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { useRoute, useRouter } from "vue-router";

definePageMeta({
  layout: false,
  ssr: false
})

const route = useRoute();
const router = useRouter();
const token = ref("");
const pending = ref(false);
const success = ref(false);
const serverError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Сначала создаем схему zod, потом передаем в toTypedSchema
const zodSchema = z.object({
  password: z.string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string()
    .min(1, "Подтвердите пароль")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

// Теперь передаем схему в toTypedSchema
const validationSchema = toTypedSchema(zodSchema);

// useForm с vee-validate
const { defineField, errors, handleSubmit, setFieldError } = useForm({
  validationSchema,
  initialValues: {
    password: "",
    confirmPassword: ""
  }
});

// Поля формы
const [password, passwordAttrs] = defineField("password");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

// Проверяем токен при монтировании
onMounted(() => {
  token.value = route.query.token as string || "";
  if (!token.value) {
    serverError.value = "Недействительная ссылка сброса пароля";
  }
});

// Отправка формы
const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    serverError.value = "Недействительная ссылка сброса пароля";
    return;
  }

  pending.value = true;
  serverError.value = "";

  try {
    const response = await $fetch('http://localhost:3001/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: {
        token: token.value,
        newPassword: values.password
      }
    });

    console.log("Reset password response:", response);
    success.value = true;

    // Через 3 секунды перенаправляем на страницу входа
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    serverError.value = err.message || "Не удалось сбросить пароль. Попробуйте позже.";
    if (err.message?.includes("пароль")) setFieldError("password", err.message);
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
          <div class="text-7xl mb-4">🔑</div>
          <h2 class="text-4xl font-bold text-white mb-3">Создайте новый пароль</h2>
          <p class="text-emerald-100 text-lg leading-relaxed">
            Придумайте надежный пароль, который вы не используете на других сайтах.
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Минимум 6 символов</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Используйте буквы и цифры</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Не используйте простые пароли</span>
          </div>
        </div>

        <div class="mt-8 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
          <p class="text-white/90 text-sm italic">
            "Хороший пароль — залог безопасности ваших данных"
          </p>
          <p class="text-emerald-200 text-xs mt-2">— Совет безопасности</p>
        </div>
      </div>

      <div class="relative z-10 text-white/40 text-sm">
        © 2026 AyEda
      </div>
    </div>

    <!-- Правая часть - Форма сброса пароля -->
    <div class="flex items-center justify-center p-8 bg-white">
      <div class="w-full max-w-md">
        <!-- Мобильный логотип -->
        <div class="flex justify-center mb-8 lg:hidden">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
            </div>
            <span class="text-2xl font-bold text-gray-900">AyEda</span>
          </div>
        </div>

        <div class="mb-8">
          <h1 class="text-3xl font-black text-gray-900 mb-1">Новый пароль</h1>
          <p class="text-gray-500">Придумайте новый надежный пароль</p>
        </div>

        <!-- Сообщение об успехе -->
        <div v-if="success" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p class="text-sm text-emerald-700 font-medium">Пароль успешно изменен!</p>
              <p class="text-xs text-emerald-600 mt-1">
                Перенаправляем на страницу входа...
              </p>
            </div>
          </div>
        </div>

        <!-- Ошибка токена -->
        <div v-else-if="serverError && !token" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p class="text-sm text-red-700 font-medium">Ошибка</p>
              <p class="text-xs text-red-600 mt-1">{{ serverError }}</p>
            </div>
          </div>
        </div>

        <!-- Форма -->
        <form v-else-if="token" @submit="onSubmit" class="space-y-5">
          <!-- Новый пароль -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Новый пароль
            </label>
            <div class="relative">
              <UIcon
                name="i-lucide-lock"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                v-bind="passwordAttrs"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 6 символов"
                class="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                :class="{ 'border-red-300': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
          </div>

          <!-- Подтверждение пароля -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Подтвердите пароль
            </label>
            <div class="relative">
              <UIcon
                name="i-lucide-shield"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                v-bind="confirmPasswordAttrs"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Повторите пароль"
                class="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                :class="{ 'border-red-300': errors.confirmPassword }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <UIcon :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Server error -->
          <div v-if="serverError" class="p-3 bg-red-50 rounded-xl border border-red-200">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
              <p class="text-sm text-red-600">{{ serverError }}</p>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending">Сохранить пароль</span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Сохранение...
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
