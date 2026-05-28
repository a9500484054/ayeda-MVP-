<template>
  <div class="flex gap-1.5">
    <Button
      variant="solid"
      color="white"
      size="xs"
      :disabled="likePending || (!isAuthenticated && showAuthToast)"
      @click="$emit('like')"
    >
      <UIcon
        name="i-lucide-heart"
        class="h-3.5 w-3.5 transition-colors"
        :class="liked ? 'text-red-600 fill-red-600' : 'text-zinc-500'"
      />
      <span class="hidden sm:inline text-xs" :class="liked ? 'text-red-600' : 'text-zinc-500'">
        {{ likesCount }}
      </span>
    </Button>

    <Button
      variant="solid"
      color="white"
      size="xs"
      :disabled="favoritePending || (!isAuthenticated && showAuthToast)"
      @click="$emit('favorite')"
    >
      <UIcon
        name="i-lucide-star"
        class="h-3.5 w-3.5 transition-colors"
        :class="isFavorite ? 'text-amber-600 fill-amber-600' : 'text-zinc-500'"
      />
      <span class="hidden sm:inline text-xs" :class="isFavorite ? 'text-amber-600' : 'text-zinc-500'">
        В избранное
      </span>
    </Button>

    <Button
      variant="solid"
      color="white"
      size="xs"
      @click="$emit('share')"
    >
      <UIcon name="i-lucide-share-2" class="h-3.5 w-3.5 text-zinc-500" />
      <span class="hidden sm:inline text-xs text-zinc-500">Поделиться</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue'

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
