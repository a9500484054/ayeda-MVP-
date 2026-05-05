<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<template>
  <section class="grid gap-5">
    <h1 class="text-3xl font-black">Дашборд</h1>
    <div class="grid gap-4 md:grid-cols-3">
      <div class="panel p-5"><p class="text-sm text-gray-600">Рецептов на модерации</p><strong class="text-3xl">12</strong></div>
      <div class="panel p-5"><p class="text-sm text-gray-600">Комментариев</p><strong class="text-3xl">48</strong></div>
      <div class="panel p-5"><p class="text-sm text-gray-600">Ингредиентов</p><strong class="text-3xl">320</strong></div>
    </div>
  </section>
</template>
