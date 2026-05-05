<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<template>
  <section class="grid gap-5">
    <h1 class="text-3xl font-black">Модерация рецептов</h1>
    <ModerateRecipeQueue />
  </section>
</template>
