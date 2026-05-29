<template>
  <div>
    <!-- Meta info (time, servings, calories) -->
    <div class="flex flex-wrap items-center gap-1.5" :class="[
      size === 'small' ? 'text-[8px]' : 'text-[12px]',
      isListView ? 'text-zinc-500' : 'text-white/90'
    ]">
      <div class="flex items-center gap-0.5">
        <UIcon
          name="i-lucide-clock-3"
          :class="[
            size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            isListView ? 'text-zinc-500' : 'text-white/90'
          ]"
        />
        <span>{{ recipe.cookingTime }} мин</span>
      </div>

      <div class="flex items-center gap-0.5">
        <UIcon
          name="i-lucide-users"
          :class="[
            size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            isListView ? 'text-zinc-500' : 'text-white/90'
          ]"
        />
        <span>{{ recipe.servings }} порц</span>
      </div>

      <div v-if="recipe.calories" class="flex items-center gap-0.5">
        <UIcon
          name="i-lucide-flame"
          :class="[
            size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            isListView ? 'text-zinc-500' : 'text-white/90'
          ]"
        />
        <span>{{ recipe.calories }} ккал</span>
      </div>
    </div>


    <!-- Meta & Stats -->
    <div class="flex items-center justify-between gap-2" :class="{ 'border-t border-zinc-100 pt-2': isListView }">
      <!-- Categories -->
      <div v-if="recipe.categories?.length" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="category in recipe.categories.slice(0, 2)"
          :key="category.id"
          class="rounded font-medium uppercase tracking-wide"
          :class="[
            size === 'small' ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]',
            isListView ? 'bg-zinc-100 text-zinc-600' : 'bg-white/20 text-white backdrop-blur-sm'
          ]"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- Stats (likes, favorites) -->
      <div class="flex items-center gap-2">
        <!-- Избранное (bookmark) -->
        <button
          @click.stop="handleFavorite"
          class="flex items-center gap-0.5 transition-colors cursor-pointer"
          :class="[
            isFavorited ? (isListView ? 'text-amber-600' : 'text-amber-400') : '',
            isListView ? 'hover:text-amber-600' : 'hover:text-amber-400'
          ]"
        >
          <UIcon
            name="i-lucide-bookmark"
            :class="[
              size === 'small' ? 'h-3 w-3' : 'h-3.5 w-3.5',
              isFavorited ? 'fill-current' : '',
              isListView ? 'text-zinc-600' : 'text-white/80'
            ]"
          />
        </button>

        <!-- Лайк (heart) -->
        <button
          @click.stop="handleLike"
          class="flex items-center gap-0.5 transition-colors cursor-pointer"
          :class="[
            isLiked ? (isListView ? 'text-red-500' : 'text-red-400') : '',
            isListView ? 'hover:text-red-500' : 'hover:text-red-300'
          ]"
        >
          <UIcon
            name="i-lucide-heart"
            :class="[
              size === 'small' ? 'h-3 w-3' : 'h-3.5 w-3.5',
              isLiked ? 'fill-current' : '',
              isListView ? 'text-zinc-600' : 'text-white/80'
            ]"
          />
          <span
            v-if="size !== 'small'"
            class="text-[10px]"
            :class="isListView ? 'text-zinc-600' : 'text-white/80'"
          >
            {{ formatNumber(recipe.likes || 0) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import { formatNumber } from '~/shared/utils/number'

const props = defineProps<{
  recipe: RecipeResponse
  isListView: boolean
  size?: 'small' | 'large' | 'list'
}>()

const emit = defineEmits<{
  favorite: [state: boolean]
  like: [state: boolean]
}>()

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
