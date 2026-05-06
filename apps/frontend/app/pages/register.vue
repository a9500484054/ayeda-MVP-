<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: false,
  ssr: false
})

const { register } = useAuth();
const pending = ref(false);
const serverError = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Схема валидации с проверкой на буквы и цифры
const zodSchema = z.object({
  username: z.string()
    .min(2, "Имя пользователя должно содержать минимум 2 символа")
    .max(50, "Имя пользователя слишком длинное"),
  email: z.string()
    .min(1, "Email обязателен")
    .email("Введите корректный email"),
  password: z.string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Пароль должен содержать хотя бы одну букву и одну цифру"),
  confirmPassword: z.string()
    .min(1, "Подтвердите пароль")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

const validationSchema = toTypedSchema(zodSchema);

const { defineField, errors, handleSubmit, setFieldError } = useForm({
  validationSchema,
  initialValues: {
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  }
});

const [username, usernameAttrs] = defineField("username");
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

const onSubmit = handleSubmit(async (values) => {
  pending.value = true;
  serverError.value = "";
  try {
    await register(values.email, values.password, values.username);
  } catch (err: any) {
    // Обработка ошибки с сервера
    if (err.message && Array.isArray(err.message)) {
      serverError.value = err.message.join(", ");
    } else if (typeof err.message === 'string') {
      serverError.value = err.message;
    } else {
      serverError.value = "Не удалось зарегистрироваться. Попробуйте позже.";
    }

    // Устанавливаем ошибки в поля
    if (serverError.value.toLowerCase().includes("email")) {
      setFieldError("email", serverError.value);
    }
    if (serverError.value.toLowerCase().includes("имя") || serverError.value.toLowerCase().includes("username")) {
      setFieldError("username", serverError.value);
    }
    if (serverError.value.toLowerCase().includes("пароль")) {
      setFieldError("password", serverError.value);
    }
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
          <h2 class="text-4xl font-bold text-white mb-3">Добро пожаловать!</h2>
          <p class="text-emerald-100 text-lg leading-relaxed">
            Создайте аккаунт и начните планировать питание с удовольствием.
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>14 дней бесплатно</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>500+ проверенных рецептов</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Умные списки покупок</span>
          </div>
        </div>

        <div class="mt-8 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
          <p class="text-white/90 text-sm italic">
            "Регистрация заняла 30 секунд, а результат — экономия 5 часов в неделю!"
          </p>
          <p class="text-emerald-200 text-xs mt-2">— Дмитрий, пользователь AyEda</p>
        </div>
      </div>

      <div class="relative z-10 text-white/40 text-sm">
        © 2026 AyEda
      </div>
    </div>

    <!-- Правая часть - Форма регистрации -->
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
          <h1 class="text-3xl font-black text-gray-900 mb-1">Регистрация</h1>
          <p class="text-gray-500">Создайте аккаунт за 30 секунд</p>
        </div>

        <form @submit="onSubmit" class="space-y-5">
          <!-- Имя пользователя -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Имя пользователя</label>
            <div class="relative">
              <UIcon name="i-lucide-user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-bind="usernameAttrs"
                v-model="username"
                type="text"
                placeholder="Как вас называть?"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                :class="{ 'border-red-300': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="text-xs text-red-500 mt-1">{{ errors.username }}</p>
          </div>

          <!-- Email -->
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
                :class="{ 'border-red-300': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Пароль -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-bind="passwordAttrs"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 6 символов, буквы и цифры"
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
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Подтвердите пароль</label>
            <div class="relative">
              <UIcon name="i-lucide-shield" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          <!-- Server error - простой текст -->
          <div v-if="serverError" class="text-sm text-red-500 bg-red-50 rounded-xl p-3">
            {{ serverError }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending" class="flex items-center justify-center gap-2">
              Создать аккаунт
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Регистрация...
            </span>
          </button>

          <!-- Login link -->
          <div class="text-center pt-2">
            <p class="text-sm text-gray-500">
              Уже есть аккаунт?
              <NuxtLink to="/login" class="text-emerald-600 font-semibold hover:text-emerald-700 transition ml-1">
                Войти
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Убираем лишние анимации, оставляем только fade */
</style>
