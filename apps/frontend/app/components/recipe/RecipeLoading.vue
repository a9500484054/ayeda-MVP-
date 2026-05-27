<template>
  <div class="flex flex-col items-center justify-center py-20 md:py-28">
    <Loader size="lg" />
    <p class="mt-3 text-sm text-zinc-500 md:mt-4">Загрузка рецепта...</p>
  </div>
</template>

<script setup lang="ts">
import Loader from '~/shared/ui/loader/Loader.vue'
</script>
