<template>
  <div class="flex flex-col h-1.5 w-full rounded-full bg-gray-200 dark:bg-darkMode-200">
    <div
      class="h-1.5 rounded-full bg-primary-600 transition-all duration-300"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number;
}>();
</script>
