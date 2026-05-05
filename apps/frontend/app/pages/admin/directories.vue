<script setup lang="ts">
definePageMeta({ layout: "admin" });
const dictionaries = ["units", "ingredients", "categories"];
</script>

<template>
  <section class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-black">Справочники</h1>
      <button class="btn-primary" type="button">Создать запись</button>
    </div>
    <div class="grid gap-4">
      <article v-for="dictionary in dictionaries" :key="dictionary" class="panel flex items-center justify-between p-4">
        <strong>{{ dictionary }}</strong>
        <button class="btn-secondary" type="button">Открыть CRUD</button>
      </article>
    </div>
  </section>
</template>
