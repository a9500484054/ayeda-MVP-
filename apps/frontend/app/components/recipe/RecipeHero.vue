<template>
  <div class="relative mb-6 overflow-hidden rounded-2xl md:mb-8 md:rounded-3xl lg:mb-10">
    <div class="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
      <img
        :src="imageUrl"
        :alt="title"
        class="h-full w-full object-cover"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>

    <!-- Информация об авторе -->
    <RecipeAuthor :author="author" />

    <!-- Действия -->
    <div class="absolute right-3 top-3 sm:right-4 sm:top-4 md:top-5 md:right-5 lg:top-6 lg:right-6">
      <RecipeActions
        :liked="liked"
        :likes-count="likesCount"
        :is-favorite="isFavorite"
        :like-pending="likePending"
        :favorite-pending="favoritePending"
        :is-authenticated="isAuthenticated"
        @like="$emit('like')"
        @favorite="$emit('favorite')"
        @share="$emit('share')"
      />
    </div>

    <!-- Заголовок и описание -->
    <div class="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5 md:p-6 lg:p-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">{{ title }}</h1>

      <RecipeMetaInfo
        :cooking-time="cookingTime"
        :servings="servings"
        :calories="calories"
      />

      <div v-if="description" class="mt-2 max-h-24 overflow-y-auto text-xs text-white/80 sm:mt-2.5 sm:max-h-32 sm:text-sm md:mt-3">
        <p>{{ description }}</p>
      </div>

      <RecipeCategories :categories="categories" />
    </div>
  </div>
</template>

<script setup lang="ts">
import RecipeAuthor from './RecipeAuthor.vue'
import RecipeActions from './RecipeActions.vue'
import RecipeMetaInfo from './RecipeMetaInfo.vue'
import RecipeCategories from './RecipeCategories.vue'

interface Category {
  id: string
  name: string
}

interface Author {
  id: string
  username?: string
  email?: string
  avatar?: string
}

interface Props {
  title: string
  description?: string | null
  imageUrl: string
  cookingTime?: number
  servings?: number
  calories?: number
  author?: Author | null
  categories?: Category[]
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

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
}
</script>
