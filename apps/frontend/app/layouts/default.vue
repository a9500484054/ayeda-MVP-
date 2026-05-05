<script setup lang="ts">
import { publicNavigation } from "~/shared/constants/navigation";
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 bg-white">
      <div class="container-page flex min-h-16 items-center justify-between gap-6">
        <NuxtLink to="/" class="text-2xl font-black text-green-800">Ayeda</NuxtLink>
        <nav class="hidden items-center gap-5 md:flex">
          <NuxtLink v-for="item in publicNavigation" :key="item.to" :to="item.to" class="font-semibold">
            {{ item.label }}
          </NuxtLink>
        </nav>
        <NuxtLink to="/login" class="btn-secondary">Войти</NuxtLink>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="mt-16 border-t border-gray-200 bg-white py-8">
      <div class="container-page flex flex-wrap justify-between gap-4 text-sm text-gray-600">
        <span>Ayeda, 2026</span>
        <NuxtLink to="/policy">Политика конфиденциальности</NuxtLink>
        <NuxtLink to="/offer">Оферта</NuxtLink>
      </div>
    </footer>
  </div>
</template>
