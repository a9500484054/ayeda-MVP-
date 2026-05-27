<template>
  <div class="flex gap-2">
    <button
      class="group flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white sm:gap-1.5 sm:rounded-xl sm:p-2"
      :class="liked ? 'text-red-600' : 'text-zinc-600'"
      :disabled="likePending || (!isAuthenticated && showAuthToast)"
      @click="$emit('like')"
    >
      <UIcon
        name="i-lucide-heart"
        class="h-3.5 w-3.5 sm:h-4 sm:w-4"
        :class="liked ? 'fill-red-600' : ''"
      />
      <span class="hidden text-xs font-medium sm:inline">{{ likesCount }}</span>
    </button>

    <button
      class="group flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white sm:gap-1.5 sm:rounded-xl sm:p-2"
      :class="isFavorite ? 'text-amber-600' : 'text-zinc-600'"
      :disabled="favoritePending || (!isAuthenticated && showAuthToast)"
      @click="$emit('favorite')"
    >
      <UIcon
        name="i-lucide-star"
        class="h-3.5 w-3.5 sm:h-4 sm:w-4"
        :class="isFavorite ? 'fill-amber-600' : ''"
      />
      <span class="hidden text-xs font-medium sm:inline">В избранное</span>
    </button>

    <button
      class="group flex cursor-pointer items-center justify-center gap-1 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white sm:gap-1.5 sm:rounded-xl sm:p-2"
      @click="$emit('share')"
    >
      <UIcon name="i-lucide-share-2" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span class="hidden text-xs font-medium sm:inline">Поделиться</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  liked: boolean
  likesCount: number
  isFavorite: boolean
  likePending?: boolean
  favoritePending?: boolean
  isAuthenticated?: boolean
}

withDefaults(defineProps<Props>(), {
  likePending: false,
  favoritePending: false,
  isAuthenticated: false
})

defineEmits<{
  like: []
  favorite: []
  share: []
}>()

const showAuthToast = () => {
  alert('Пожалуйста, войдите в аккаунт для выполнения этого действия')
  return false
}
</script>
