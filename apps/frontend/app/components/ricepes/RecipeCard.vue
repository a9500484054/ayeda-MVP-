<template>
  <article
    :class="[
      'group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-500 hover:shadow-lg hover:shadow-zinc-200/50',
      isListView
        ? 'flex flex-col md:flex-row hover:-translate-y-0'
        : 'flex flex-col cursor-pointer hover:-translate-y-1',
    ]"
    @click="openRecipe"
  >
    <!-- IMAGE -->
    <div
      :class="[
        'relative overflow-hidden bg-zinc-100',
        isListView ? 'md:w-[200px] md:flex-shrink-0' : 'w-full',
      ]"
    >
      <div :class="[isListView ? 'aspect-[3/2] h-full' : 'w-full aspect-[3/2]']">
        <img
          :src="recipeImage"
          :alt="recipe.title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          @error="handleImageError"
        />
      </div>

      <!-- Author badge -->
      <div
        class="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white backdrop-blur-sm flex items-center gap-1"
      >
        <UIcon name="i-lucide-user" class="h-2.5 w-2.5" />
        <span>{{ authorName }}</span>
      </div>
    </div>

    <!-- CONTENT -->
    <div
      class="transition-all duration-500"
      :class="[
        isListView
          ? 'flex-1 p-3 md:p-4 bg-white'
          : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3',
      ]"
    >
      <!-- Title -->
      <h3
        class="line-clamp-2 text-sm font-semibold leading-tight transition-colors duration-300"
        :class="[isListView ? 'text-black' : 'text-white']"
      >
        {{ recipe.title }}
      </h3>

      <!-- Description -->
      <p
        class="mt-1 text-xs leading-relaxed transition-colors duration-300"
        :class="[
          isListView ? 'text-gray-600 line-clamp-2' : 'text-gray-300 line-clamp-2',
        ]"
      >
        {{ recipe.description }}
      </p>

      <!-- Hover content (only for grid mode) -->
      <div
        v-if="!isListView"
        :class="[
          'overflow-hidden transition-all duration-500',
          'max-h-0 opacity-0 mt-0 group-hover:max-h-[400px] group-hover:opacity-100 group-hover:mt-2',
        ]"
      >
        <RecipeMetaInfo :recipe="recipe" :is-list-view="false" @favorite="toggleFavorite" @like="toggleLike" />
      </div>

      <!-- List mode content (always visible) -->
      <div v-if="isListView" class="mt-2">
        <RecipeMetaInfo :recipe="recipe" :is-list-view="true" @favorite="toggleFavorite" @like="toggleLike" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import RecipeMetaInfo from './RecipeMetaInfo.vue'

const props = defineProps<{
  recipe: RecipeResponse
  viewMode: 'grid-large' | 'grid-small' | 'list'
}>()

const emit = defineEmits<{
  open: [recipe: RecipeResponse]
  favorite: [recipe: RecipeResponse, state: boolean]
  like: [recipe: RecipeResponse, state: boolean]
}>()

const config = useRuntimeConfig()

const isListView = computed(() => props.viewMode === 'list')

// Состояния лайков и избранного
const isFavorited = ref(props.recipe.isFavorited || false)
const isLiked = ref(props.recipe.isLiked || false)

// Имя автора
const authorName = computed(() => {
  const author = props.recipe.author
  if (author?.username) return author.username
  if (author?.email) return author.email.split('@')[0]
  return 'Пользователь'
})

const recipeImage = computed(() => {
  if (props.recipe.photo?.src) {
    const src = props.recipe.photo.src
    if (src.startsWith('http')) return src
    if (src.startsWith('/')) return `${config.public.apiUrl}${src}`
    return `${config.public.apiUrl}/${src}`
  }
  return '/images/placeholder-recipe.jpg'
})

const openRecipe = () => {
  emit('open', props.recipe)
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', props.recipe, isFavorited.value)
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  emit('like', props.recipe, isLiked.value)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/images/placeholder-recipe.jpg'
}
</script>
