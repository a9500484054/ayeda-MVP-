<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

definePageMeta({
  layout: false,
  ssr: false
})

const route = useRoute();
const router = useRouter();
const status = ref<"loading" | "success" | "error">("loading");
const message = ref("");
const countdown = ref(5);
const token = ref("");

// Функция подтверждения email
const verifyEmail = async (token: string) => {
  try {
    const response = await $fetch('http://localhost:3001/api/v1/auth/verify-email', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: {
        token: token
      }
    });
    return response;
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || "Не удалось подтвердить email";
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
  }
};

onMounted(async () => {
  token.value = route.query.token as string || "";

  if (!token.value) {
    status.value = "error";
    message.value = "Недействительная ссылка подтверждения";
    return;
  }

  try {
    await verifyEmail(token.value);
    status.value = "success";
    message.value = "Ваш email успешно подтвержден!";

    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
        router.push('/login');
      }
    }, 1000);
  } catch (err: any) {
    status.value = "error";
    message.value = err.message || "Не удалось подтвердить email. Попробуйте позже.";
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
    <!-- Декоративные элементы -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Логотип с анимацией -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition"></div>
            <div class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">AyEda</h1>
      </div>

      <!-- Карточка статуса -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/50">
        <!-- Loading -->
        <div v-if="status === 'loading'" class="space-y-4">
          <div class="flex justify-center">
            <div class="relative">
              <div class="w-16 h-16 rounded-full border-4 border-gray-100"></div>
              <div class="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-gray-700 font-medium">Подтверждение email</p>
            <p class="text-sm text-gray-400">Пожалуйста, подождите...</p>
          </div>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'success'" class="space-y-4">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center animate-bounce">
            <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Email подтвержден!</h2>
          <p class="text-gray-500">Ваш email успешно подтвержден. Теперь вы можете войти в аккаунт.</p>
          <div class="pt-4 border-t border-gray-100 mt-4">
            <p class="text-sm text-emerald-600 font-medium mb-3">Перенаправление через {{ countdown }} сек.</p>
            <div class="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full transition-all duration-1000" :style="{ width: (countdown / 5) * 100 + '%' }"></div>
            </div>
            <NuxtLink to="/login" class="inline-block w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              Войти сейчас
            </NuxtLink>
          </div>
        </div>

        <!-- Error -->
        <div v-else class="space-y-4">
          <div class="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-x-circle" class="w-10 h-10 text-red-500" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Ошибка подтверждения</h2>
          <div class="bg-red-50 rounded-xl p-3">
            <p class="text-red-600 text-sm">{{ message }}</p>
          </div>
          <div class="pt-4 space-y-3">
            <p class="text-sm text-gray-500">Возможно, ссылка устарела или была уже использована.</p>
            <NuxtLink to="/login" class="inline-block w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              Перейти ко входу
            </NuxtLink>
            <NuxtLink to="/forgot-password" class="inline-block w-full text-sm text-emerald-600 hover:text-emerald-700 transition">
              Отправить новое письмо
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="text-center mt-6 text-xs text-gray-400">
        <p>© 2026 AyEda. Все права защищены.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-bounce {
  animation: bounce 0.6s ease-in-out;
}
</style>
