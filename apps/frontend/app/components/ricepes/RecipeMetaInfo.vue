<template>
  <div>
    <!-- Categories -->
    <div v-if="recipe.categories?.length" class="mb-2 flex flex-wrap gap-1">
      <span
        v-for="category in recipe.categories.slice(0, 2)"
        :key="category.id"
        class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
        :class="isListView ? 'bg-zinc-100 text-zinc-600' : 'bg-white/20 text-white backdrop-blur-sm'"
      >
        {{ category.name }}
      </span>
    </div>

    <!-- Meta & Stats -->
    <div class="flex items-center justify-between gap-2" :class="{ 'border-t border-zinc-100 pt-2': isListView }">
      <!-- Meta info (time, servings, calories) -->
      <div class="flex flex-wrap items-center gap-1.5 text-[10px]" :class="isListView ? 'text-zinc-500' : 'text-white/90'">
        <div class="flex items-center gap-0.5">
          <UIcon name="i-lucide-clock-3" class="h-2.5 w-2.5" />
          <span>{{ recipe.cookingTime }} мин</span>
        </div>

        <div class="flex items-center gap-0.5">
          <UIcon name="i-lucide-users" class="h-2.5 w-2.5" />
          <span>{{ recipe.servings }} порц</span>
        </div>

        <div v-if="recipe.calories" class="flex items-center gap-0.5">
          <UIcon name="i-lucide-flame" class="h-2.5 w-2.5" />
          <span>{{ recipe.calories }} ккал</span>
        </div>
      </div>

      <!-- Stats (views, likes, favorites) -->
      <div class="flex items-center gap-2 text-[10px]" :class="isListView ? 'text-zinc-500' : 'text-white/80'">
        <div class="flex items-center gap-0.5">
          <UIcon name="i-lucide-eye" class="h-2.5 w-2.5" />
          <span>{{ formatNumber(recipe.views || 0) }}</span>
        </div>

        <button
          @click.stop="handleFavorite"
          class="flex items-center gap-0.5 transition-colors"
          :class="[
            isFavorited ? (isListView ? 'text-red-500' : 'text-red-400') : '',
            isListView ? 'hover:text-red-500' : 'hover:text-red-300'
          ]"
        >
          <UIcon
            name="i-lucide-heart"
            class="h-2.5 w-2.5"
            :class="isFavorited ? 'fill-current' : ''"
          />
          <span>{{ formatNumber(recipe.favorites || 0) }}</span>
        </button>

        <button
          @click.stop="handleLike"
          class="flex items-center gap-0.5 transition-colors"
          :class="[
            isLiked ? (isListView ? 'text-blue-500' : 'text-blue-400') : '',
            isListView ? 'hover:text-blue-500' : 'hover:text-blue-300'
          ]"
        >
          <UIcon
            name="i-lucide-thumbs-up"
            class="h-2.5 w-2.5"
          />
          <span>{{ formatNumber(recipe.likes || 0) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import { formatNumber } from '~/shared/utils/number';

const props = defineProps<{
  recipe: RecipeResponse
  isListView: boolean
}>()

const emit = defineEmits<{
  favorite: [state: boolean]
  like: [state: boolean]
}>()

// Инициализируем с false, обновим после монтирования
const isFavorited = ref(false)
const isLiked = ref(false)

onMounted(() => {
  isFavorited.value = props.recipe.isFavorited || false
  isLiked.value = props.recipe.isLiked || false
})

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', isFavorited.value)
}

const handleLike = () => {
  isLiked.value = !isLiked.value
  emit('like', isLiked.value)
}
</script>
