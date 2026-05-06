<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { useAuth } from "~/composables/useAuth";
import { useUserStore } from "~/stores/userStore";

definePageMeta({
  layout: false,
  ssr: false
})

const { login, restoreSession, user, isAuthenticated } = useAuth();
const userStore = useUserStore();
const router = useRouter();
const pending = ref(false);
const serverError = ref("");
const isCheckingAuth = ref(true);
const showPassword = ref(false);
const rememberMe = ref(false);

// Загружаем сохраненный email из localStorage
onMounted(async () => {
  // Загружаем сохраненный email
  const savedEmail = localStorage.getItem('remembered_email');
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }

  await restoreSession();
  isCheckingAuth.value = false;
  console.log("Пользователь после восстановления сессии:", userStore.user, userStore.isAuthenticated);

  // Проверяем, авторизован ли пользователь
  if (user.value) {
    router.push('/cabinet/my-recipes');
  }
});

// Схема валидации с zod
const validationSchema = toTypedSchema(z.object({
  email: z.string()
    .min(1, "Email обязателен")
    .email("Введите корректный email"),
  password: z.string()
    .min(1, "Пароль обязателен")
    .min(6, "Пароль должен содержать минимум 6 символов")
}));

// useForm с vee-validate
const { defineField, errors, handleSubmit, setFieldError } = useForm({
  validationSchema,
  initialValues: {
    email: "",
    password: ""
  }
});

// Поля формы
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

// Отправка формы
async function onSubmit(e: Event) {
  e.preventDefault();

  // Валидация
  if (!email.value) {
    setFieldError("email", "Email обязателен");
    return;
  }
  if (!password.value) {
    setFieldError("password", "Пароль обязателен");
    return;
  }
  if (password.value.length < 6) {
    setFieldError("password", "Пароль должен содержать минимум 6 символов");
    return;
  }

  pending.value = true;
  serverError.value = "";

  try {
    await login(email.value, password.value);

    // Сохраняем email если выбран "Запомнить меня"
    if (rememberMe.value) {
      localStorage.setItem('remembered_email', email.value);
    } else {
      localStorage.removeItem('remembered_email');
    }

    // Проверяем, что пользователь сохранен в store
    if (userStore.user) {
      router.push('/cabinet/my-recipes');
    } else {
      // Если пользователь не сохранился, пробуем восстановить сессию
      await restoreSession();
      if (userStore.user) {
        router.push('/cabinet/my-recipes');
      } else {
        serverError.value = "Ошибка авторизации. Попробуйте снова.";
      }
    }
  } catch (err: any) {
    const errorMessage = err?.message || "Не удалось войти. Проверьте данные или доступность API.";
    serverError.value = errorMessage;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div v-if="isCheckingAuth" class="min-h-screen flex items-center justify-center bg-white">
    <div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else class="min-h-screen grid lg:grid-cols-2">
    <!-- Левая часть - Брендинг -->
    <div class="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-700 to-teal-800 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-30"></div>

      <div class="relative z-10">
        <NuxtLink to="/">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-5 h-5 text-emerald-600" />
            </div>
            <span class="text-2xl font-bold text-white">АуЕда</span>
          </div>
        </NuxtLink>
      </div>

      <div class="relative z-10">
        <div class="mb-6">
          <h2 class="text-4xl font-bold text-white mb-3">Рады <br> видеть вас снова</h2>
          <p class="text-emerald-100 text-lg leading-relaxed">
            Войдите, чтобы продолжить планировать питание и экономить время.
          </p>
        </div>

        <div class="mt-8 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
          <p class="text-white/90 text-sm italic">
            "AyEda изменил мой подход к питанию. Теперь я трачу 10 минут на планирование вместо 3 часов!"
          </p>
          <p class="text-emerald-200 text-xs mt-2">— Анна, мама двоих детей</p>
        </div>
      </div>

      <div class="relative z-10 text-white/40 text-sm">
        © 2026 AyEda
      </div>
    </div>

    <!-- Правая часть - Форма -->
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
          <h1 class="text-3xl font-black text-gray-900 mb-1">Вход</h1>
          <p class="text-gray-500">Введите email и пароль</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-5">
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

          <!-- Пароль поле с кнопкой показа -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-sm font-medium text-gray-700">Пароль</label>
              <NuxtLink to="/forgot-password" class="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition">
                Забыли?
              </NuxtLink>
            </div>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-bind="passwordAttrs"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ваш пароль"
                class="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': errors.password }"
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

          <!-- Запомнить меня -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                v-model="rememberMe"
                class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span class="text-sm text-gray-600 group-hover:text-gray-800 transition">Запомнить меня</span>
            </label>
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
            class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span v-if="!pending" class="flex items-center justify-center gap-2">
              Войти
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Вход...
            </span>
          </button>

          <!-- Register link -->
          <div class="text-center pt-2">
            <p class="text-sm text-gray-500">
              Нет аккаунта?
              <NuxtLink to="/register" class="text-emerald-600 font-semibold hover:text-emerald-700 transition ml-1">
                Создать
              </NuxtLink>
            </p>
          </div>
        </form>
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
