<!-- components/recipe/RecipeCard.vue -->
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

      <!-- Status Badge -->
      <div class="absolute left-3 top-3">
        <span
          class="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Actions -->
      <div class="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Button
          @click.stop="emitEdit"
          variant="solid"
          color="info"
          size="sm"
          icon="i-lucide-edit-2"
        />

        <Button
          @click.stop="emitDelete"
          variant="solid"
          color="danger"
          size="sm"
          icon="i-lucide-trash-2"
        />
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
        <!-- Categories - теперь слева -->
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

        <!-- Likes & Comments - теперь справа -->
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

      <!-- Bottom bar for list view -->
      <div
        v-if="isListView"
        class="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm"
      >
        <span class="text-zinc-500">{{ formatDate(recipe.createdAt) }}</span>

        <!-- Кнопки с ховером для list view -->
        <div class="relative">
          <!-- Кнопки появляются при ховере на контейнер -->
          <div
            v-if="showModerationButton && (recipe.status === 'private' || recipe.status === 'rejected')"
            class="flex gap-2"
            :class="isListView ? 'opacity-0 group-hover:opacity-100 transition-all duration-300' : ''"
          >
            <Button v-if="recipe.status === 'private'" color="success" size="xs" @click.stop="emitSubmitModeration">
              <span>Отправить на модерацию</span>
            </Button>

            <template v-if="recipe.status === 'rejected'">
              <Button
                @click.stop="emitSubmitModeration"
                color="success"
                size="xs"
              >
                Отправить на модерацию
              </Button>
              <Button
                @click.stop="emitMakePrivate"
                color="warning"
                size="xs"
              >
                Сделать приватным
              </Button>
            </template>
          </div>
          <!-- Заглушка чтобы не прыгал контент -->
          <div v-else class="h-9"></div>
        </div>
      </div>

      <!-- Кнопки для grid view - с ховером -->
      <div
        v-if="!isListView && showModerationButton && (recipe.status === 'private' || recipe.status === 'rejected')"
        class="relative"
      >
        <!-- Кнопки появляются при ховере на карточку -->
        <div class="absolute bottom-0 left-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button v-if="recipe.status === 'private'" color="success" size="xs" @click.stop="emitSubmitModeration" block>
            <span>Отправить на модерацию</span>
          </Button>

          <template v-if="recipe.status === 'rejected'">
            <Button
              @click.stop="emitSubmitModeration"
              color="success"
              size="xs"
              block
            >
              На модерацию
            </Button>
            <Button
              @click.stop="emitMakePrivate"
              color="warning"
              block
              size="xs"
            >
              Сделать приватным
            </Button>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import Button from '~/shared/ui/button/Button.vue';

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
}>()

const isListView = computed(() => {
  const mode = props.viewMode
  return mode === 'list'
})

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

const showModerationButton = computed(() => props.activeTab === 'my')

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const diff = Math.floor((Date.now() - d.getTime()) / (86400000))

  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  if (diff < 7) return `${diff} дн назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
}

const emitClick = () => emit('click', props.recipe)
const emitEdit = () => emit('edit', props.recipe)
const emitDelete = () => emit('delete', props.recipe)
const emitSubmitModeration = () => emit('submit-moderation', props.recipe)
const emitMakePrivate = () => emit('make-private', props.recipe)
</script>
