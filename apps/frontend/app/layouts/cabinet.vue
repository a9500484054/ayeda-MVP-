<script setup lang="ts">
import { cabinetNavigation } from "~/shared/constants/navigation";
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="container-page grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
      <aside class="panel h-fit p-4">
        <NuxtLink to="/" class="mb-5 block text-2xl font-black text-green-800">Ayeda</NuxtLink>
        <nav class="grid gap-2">
          <NuxtLink v-for="item in cabinetNavigation" :key="item.to" :to="item.to" class="rounded-lg px-3 py-2 font-semibold hover:bg-gray-100">
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
