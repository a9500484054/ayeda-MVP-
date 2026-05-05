<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
  };
}>();
</script>

<template>
  <NuxtLayout>
    <section class="container-page grid min-h-[70vh] place-items-center py-12">
      <div class="panel max-w-lg p-6 text-center">
        <p class="text-sm font-bold text-green-800">{{ props.error.statusCode ?? 500 }}</p>
        <h1 class="mt-2 text-3xl font-black">{{ props.error.statusMessage ?? "Ошибка приложения" }}</h1>
        <p class="mt-3 text-gray-700">{{ props.error.message }}</p>
        <NuxtLink to="/" class="btn-primary mt-5">На главную</NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>
