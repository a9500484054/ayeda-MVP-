<template>
  <div class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center md:rounded-3xl md:py-24">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 md:h-20 md:w-20">
      <UIcon name="i-lucide-cooking-pot" class="h-8 w-8 text-zinc-400 md:h-10 md:w-10" />
    </div>
    <h3 class="mt-4 text-lg font-semibold text-zinc-900 md:mt-5 md:text-xl">
      {{ noPath ? 'Некорректная ссылка' : 'Рецепт не найден' }}
    </h3>
    <p class="mt-2 px-4 text-sm text-zinc-500 max-w-md">
      {{ errorMessage }}
    </p>
    <div class="mt-5 flex flex-col gap-3 sm:flex-row md:mt-6">
      <Button @click="$emit('back')">
        Назад к рецептам
      </Button>
      <Button v-if="!noPath" variant="outline" @click="$emit('retry')">
        Попробовать снова
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue'

interface Props {
  errorMessage?: string
  noPath?: boolean
}

withDefaults(defineProps<Props>(), {
  errorMessage: 'Возможно, этот рецепт был удален, перемещен или указан неправильный путь.',
  noPath: false
})

defineEmits<{
  back: []
  retry: []
}>()
</script>
