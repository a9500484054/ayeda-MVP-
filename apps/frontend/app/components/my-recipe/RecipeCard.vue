<template>
  <article
    :class="[
      'group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/70',
      isListView ? 'flex flex-col md:flex-row' : 'flex flex-col cursor-pointer hover:-translate-y-1'
    ]"
    @click="emitClick"
  >
    <!-- IMAGE -->
    <div
      :class="[
        'relative overflow-hidden bg-zinc-100 flex-shrink-0',
        isListView ? 'md:w-60' : 'w-full'
      ]"
    >
      <div :class="isListView ? 'aspect-[4/3] h-full' : 'aspect-[16/10]'">
        <img
          :src="imageUrl"
          :alt="recipe.title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          @error="handleImageError"
        />
      </div>

      <!-- Status Badge (только для "Мои рецепты") -->
      <div v-if="isMyRecipesTab" class="absolute left-3 top-3">
        <span
          class="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Actions (Edit/Delete) - только для "Мои рецепты" -->
      <div v-if="isMyRecipesTab && showEditDeleteButtons" class="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          @click.stop="emitEdit"
          variant="solid"
          color="neutral"
          size="sm"
          icon="i-lucide-edit-2"
          icon-only
        />

        <Button
          @click.stop="emitDelete"
          variant="solid"
          color="danger"
          size="sm"
          icon="i-lucide-trash-2"
          icon-only
        />
      </div>

      <!-- Remove from favorites button - только для "Избранное" -->
      <div v-if="isFavoritesTab" class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          @click.stop="emitRemoveFromFavorites"
          variant="solid"
          color="warning"
          size="sm"
          icon="i-lucide-star-off"
        >
          <span class="ml-1 text-xs">Убрать</span>
        </Button>
      </div>
    </div>

    <!-- CONTENT -->
    <div
      :class="[
        'flex-1 transition-all duration-500',
        isListView ? 'p-5 md:p-6' : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-5'
      ]"
    >
      <div class="flex items-start justify-between gap-3">
        <h3
          :class="[
            'line-clamp-2 font-semibold leading-tight transition-colors',
            isListView ? 'text-lg text-zinc-900' : 'text-white'
          ]"
        >
          {{ recipe.title }}
        </h3>
      </div>

      <!-- Description -->
      <p
        v-if="recipe.description"
        class="mt-2 line-clamp-2 text-sm"
        :class="isListView ? 'text-zinc-600' : 'text-white/90'"
      >
        {{ recipe.description }}
      </p>

      <!-- Meta -->
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div class="flex items-center gap-1.5" :class="isListView ? 'text-zinc-500' : 'text-white/80'">
          <UIcon name="i-lucide-clock-3" class="h-4 w-4" />
          <span>{{ recipe.cookingTime }} мин</span>
        </div>
        <div class="flex items-center gap-1.5" :class="isListView ? 'text-zinc-500' : 'text-white/80'">
          <UIcon name="i-lucide-users" class="h-4 w-4" />
          <span>{{ recipe.servings }} порц</span>
        </div>
        <div v-if="recipe.calories" class="flex items-center gap-1.5" :class="isListView ? 'text-zinc-500' : 'text-white/80'">
          <UIcon name="i-lucide-flame" class="h-4 w-4" />
          <span>{{ recipe.calories }} ккал</span>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <!-- Categories -->
        <div class="flex flex-wrap gap-1">
          <span
            v-for="cat in recipe.categories?.slice(0, 2)"
            :key="cat.id"
            class="rounded-md px-2 py-0.5 text-[10px] font-medium"
            :class="isListView ? 'bg-zinc-100 text-zinc-600' : 'bg-white/20 text-white/90 backdrop-blur-sm'"
          >
            {{ cat.name }}
          </span>
        </div>

        <!-- Likes & Comments -->
        <div class="flex items-center gap-4 text-sm" :class="isListView ? 'text-zinc-500' : 'text-white/75'">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-heart" class="h-4 w-4" />
            <span>{{ recipe.likes || 0 }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-message-circle" class="h-4 w-4" />
            <span>{{ recipe.commentsCount || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom bar for list view (только для "Мои рецепты") -->
      <div
        v-if="isListView && isMyRecipesTab"
        class="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm"
      >
        <span class="text-zinc-500">{{ formatDate(recipe.createdAt) }}</span>

        <div class="relative">
          <div
            v-if="showModerationButton && (recipe.status === 'private' || recipe.status === 'rejected')"
            class="flex gap-2"
            :class="isListView ? 'opacity-0 group-hover:opacity-100 transition-all duration-300' : ''"
          >
            <Button v-if="recipe.status === 'private'" color="success" size="xs" @click.stop="emitSubmitModeration">
              <span>Сделать публичным</span>
            </Button>

            <template v-if="recipe.status === 'rejected'">
              <Button
                @click.stop="emitSubmitModeration"
                color="success"
                size="xs"
              >
                сделать публичным
              </Button>
              <Button
                @click.stop="emitMakePrivate"
                color="warning"
                size="xs"
              >
                Приватный
              </Button>
            </template>
          </div>
          <div v-else class="h-9"></div>
        </div>
      </div>

      <!-- Кнопки для grid view -->
      <div
        v-if="!isListView && isMyRecipesTab && showModerationButton && (recipe.status === 'private' || recipe.status === 'rejected')"
        class="relative"
      >
        <div class="absolute bottom-0 left-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button v-if="recipe.status === 'private'" color="success" size="xs" @click.stop="emitSubmitModeration" block>
            <span>Сделать публичным</span>
          </Button>

          <template v-if="recipe.status === 'rejected'">
            <Button
              @click.stop="emitSubmitModeration"
              color="success"
              size="xs"
              block
            >
              Сделать публичным
            </Button>
            <Button
              @click.stop="emitMakePrivate"
              color="warning"
              block
              size="xs"
            >
              Приватный
            </Button>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi';
import Button from '~/shared/ui/button/Button.vue';
import { formatDate, getRelativeDate } from '~/shared/utils/dates'

const props = defineProps<{
  recipe: RecipeResponse
  activeTab: string
  viewMode?: 'grid' | 'list'
}>()

const emit = defineEmits<{
  click: [recipe: RecipeResponse]
  edit: [recipe: RecipeResponse]
  delete: [recipe: RecipeResponse]
  'submit-moderation': [recipe: RecipeResponse]
  'make-private': [recipe: RecipeResponse]
  'remove-from-favorites': [recipe: RecipeResponse]
}>()

const isListView = computed(() => props.viewMode === 'list')
const isMyRecipesTab = computed(() => props.activeTab === 'my')
const isFavoritesTab = computed(() => props.activeTab === 'favorites')
const showModerationButton = computed(() => props.activeTab === 'my')

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Показывать кнопки редактирования/удаления только для черновиков, приватных и отклоненных
const showEditDeleteButtons = computed(() => {
  const editableStatuses = ['draft', 'private', 'rejected']
  return editableStatuses.includes(props.recipe.status)
})

const imageUrl = computed(() => {
  const path = props.recipe.photo?.src
  if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
})

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700 text-white',
    private: 'bg-amber-500 text-white',
    pending: 'bg-blue-600 text-white',
    public: 'bg-emerald-600 text-white',
    rejected: 'bg-red-600 text-white'
  }
  return map[props.recipe.status] || 'bg-zinc-500 text-white'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    draft: 'Черновик',
    private: 'Приватный',
    pending: 'На модерации',
    public: 'Опубликован',
    rejected: 'Отклонён'
  }
  return map[props.recipe.status] || props.recipe.status
})

const emitClick = () => emit('click', props.recipe)
const emitEdit = () => emit('edit', props.recipe)
const emitDelete = () => emit('delete', props.recipe)
const emitSubmitModeration = () => emit('submit-moderation', props.recipe)
const emitMakePrivate = () => emit('make-private', props.recipe)
const emitRemoveFromFavorites = () => emit('remove-from-favorites', props.recipe)

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
}
</script>
