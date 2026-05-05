<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>

<template>
  <label class="block">
    <span class="sr-only">Поиск</span>
    <input
      v-model="model"
      class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4"
      type="search"
      placeholder="Поиск по рецептам"
    >
  </label>
</template>
