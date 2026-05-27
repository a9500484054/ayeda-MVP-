<template>
  <div class="mt-2 flex flex-wrap gap-1.5 sm:mt-2.5 sm:gap-2 md:mt-3">
    <div v-if="cookingTime" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-sm">
      <UIcon name="i-lucide-clock" class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      <span>{{ cookingTime }} мин</span>
    </div>
    <div v-if="servings" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-sm">
      <UIcon name="i-lucide-users" class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      <span>{{ servings }} порций</span>
    </div>
    <div v-if="calories" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-sm">
      <UIcon name="i-lucide-flame" class="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      <span>{{ calories }} ккал</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cookingTime?: number
  servings?: number
  calories?: number
}

defineProps<Props>()
</script>
