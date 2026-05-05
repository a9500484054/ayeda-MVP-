<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

const email = ref("");
const username = ref("");
const password = ref("");
const { register } = useAuth();
</script>

<template>
  <section class="container-page grid min-h-[70vh] place-items-center py-10">
    <form class="panel grid w-full max-w-md gap-4 p-6" @submit.prevent="register(email, password, username)">
      <h1 class="text-3xl font-black">Регистрация</h1>
      <input v-model="username" class="h-11 rounded-lg border border-gray-300 px-3" type="text" placeholder="Username">
      <input v-model="email" class="h-11 rounded-lg border border-gray-300 px-3" type="email" placeholder="Email">
      <input v-model="password" class="h-11 rounded-lg border border-gray-300 px-3" type="password" placeholder="Пароль">
      <button class="btn-primary" type="submit">Создать аккаунт</button>
    </form>
  </section>
</template>
