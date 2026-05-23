<!-- apps\frontend\app\components\shopping\lists\ShoppingListsHeader.vue -->
<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Ваши списки покупок
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Управляйте своими списками покупок
      </p>
    </div>

    <Button color="primary" @click="emit('create')">
      <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" />
      Создать новый список
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';

const emit = defineEmits<{
  create: [];
}>();
</script>
