<script setup lang="ts">
import { demoRecipes } from "~/composables/useDemoContent";
</script>

<template>
  <div class="grid gap-3">
    <article v-for="recipe in demoRecipes" :key="recipe.id" class="panel flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <h3 class="font-bold">{{ recipe.title }}</h3>
        <p class="text-sm text-gray-600">Автор: {{ recipe.author.username }}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-primary" type="button">Опубликовать</button>
        <button class="btn-secondary" type="button">Отклонить</button>
      </div>
    </article>
  </div>
</template>
