<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

const email = ref("");
const password = ref("");
const pending = ref(false);
const error = ref("");
const { login } = useAuth();

async function submit() {
  pending.value = true;
  error.value = "";
  try {
    await login(email.value, password.value);
  } catch {
    error.value = "Не удалось войти. Проверьте данные или доступность API.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="container-page grid min-h-[70vh] place-items-center py-10">
    <form class="panel grid w-full max-w-md gap-4 p-6" @submit.prevent="submit">
      <h1 class="text-3xl font-black">Вход</h1>
      <input v-model="email" class="h-11 rounded-lg border border-gray-300 px-3" type="email" placeholder="Email">
      <input v-model="password" class="h-11 rounded-lg border border-gray-300 px-3" type="password" placeholder="Пароль">
      <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
      <button class="btn-primary" type="submit" :disabled="pending">Войти</button>
      <NuxtLink to="/register" class="text-sm font-semibold text-green-800">Регистрация</NuxtLink>
    </form>
  </section>
</template>
