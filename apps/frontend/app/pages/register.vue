<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: 'auth'
})

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const pending = ref(false);
const error = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const { register } = useAuth();

async function submit() {
  if (password.value !== confirmPassword.value) {
    error.value = "Пароли не совпадают";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Пароль должен содержать минимум 6 символов";
    return;
  }

  pending.value = true;
  error.value = "";
  try {
    await register(email.value, password.value, username.value);
  } catch (err: any) {
    error.value = err.message || "Не удалось зарегистрироваться. Попробуйте позже.";
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
        <div class="text-6xl mb-6">🎉</div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Присоединяйтесь к нам
        </h2>
        <p class="text-emerald-100 leading-relaxed">
          Создайте аккаунт и начните планировать питание с удовольствием.
          Экономьте время, деньги и питайтесь правильно.
        </p>

        <!-- Преимущества -->
        <div class="mt-8 space-y-3">
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>14 дней бесплатного пробного периода</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Безлимитный доступ ко всем рецептам</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-3 h-3" />
            </div>
            <span>Отмена подписки в любой момент</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-white/60 text-sm">
        © 2026 AyEda. Все права защищены.
      </div>
    </div>

    <!-- Правая часть - Форма регистрации -->
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
          <h1 class="text-3xl lg:text-4xl font-black text-gray-900 mb-2">Регистрация</h1>
          <p class="text-gray-500">Создайте аккаунт, чтобы начать</p>
        </div>

        <!-- Форма -->
        <form @submit.prevent="submit" class="space-y-5">
          <!-- Имя пользователя -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
            <div class="relative">
              <UIcon name="i-lucide-user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="username"
                type="text"
                placeholder="Как вас называть?"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                required
              />
            </div>
          </div>

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

          <!-- Пароль -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 6 символов"
                class="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Подтверждение пароля -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
            <div class="relative">
              <UIcon name="i-lucide-shield" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Повторите пароль"
                class="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <UIcon :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Ошибка -->
          <p v-if="error" class="text-sm text-red-500 bg-red-50 rounded-xl p-3">
            {{ error }}
          </p>

          <!-- Согласие с условиями -->
          <div class="flex items-start gap-2">
            <input type="checkbox" id="terms" class="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" required />
            <label for="terms" class="text-xs text-gray-500">
              Я принимаю
              <NuxtLink to="/offer" class="text-emerald-600 hover:underline">условия использования</NuxtLink>
              и
              <NuxtLink to="/policy" class="text-emerald-600 hover:underline">политику конфиденциальности</NuxtLink>
            </label>
          </div>

          <!-- Кнопка регистрации -->
          <button
            type="submit"
            :disabled="pending"
            class="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!pending">Создать аккаунт</span>
            <span v-else class="flex items-center justify-center gap-2">
              <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              Регистрация...
            </span>
          </button>

          <!-- Вход -->
          <div class="text-center pt-4">
            <p class="text-sm text-gray-500">
              Уже есть аккаунт?
              <NuxtLink to="/login" class="text-emerald-600 font-semibold hover:text-emerald-700 ml-1">
                Войти
              </NuxtLink>
            </p>
          </div>
        </form>

        <!-- Преимущества регистрации -->
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-xs text-gray-500 text-center">
            🎁 После регистрации вы получите 14 дней бесплатного доступа ко всем функциям
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
