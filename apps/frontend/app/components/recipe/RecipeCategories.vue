<template>
  <div v-if="categories?.length" class="mt-2 flex flex-wrap gap-1 sm:mt-2.5 sm:gap-1.5">
    <span
      v-for="cat in categories"
      :key="cat.id"
      class="rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm sm:px-2.5 sm:py-0.5 sm:text-sm"
    >
      {{ cat.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
}

interface Props {
  categories?: Category[]
}

defineProps<Props>()
</script>
