<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
    <!-- Хлебные крошки -->
    <nav class="mb-4 flex items-center gap-2 text-sm md:mb-6">
      <button
        class="flex items-center gap-1 rounded-lg px-2 py-1 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 md:px-3 md:py-1.5"
        @click="goBack"
      >
        <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
        <span class="hidden sm:inline">Рецепты</span>
      </button>
      <UIcon name="i-lucide-chevron-right" class="hidden h-4 w-4 text-zinc-300 sm:block" />
      <span class="truncate font-medium text-zinc-900">{{ recipe?.title || 'Загрузка...' }}</span>
    </nav>

    <!-- Состояние загрузки -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 md:py-28">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 md:h-10 md:w-10" />
      <p class="mt-3 text-sm text-zinc-500 md:mt-4">Загрузка рецепта...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error || !recipe" class="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center md:rounded-3xl md:py-24">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 md:h-20 md:w-20">
        <UIcon name="i-lucide-cooking-pot" class="h-8 w-8 text-zinc-400 md:h-10 md:w-10" />
      </div>
      <h3 class="mt-4 text-lg font-semibold text-zinc-900 md:mt-5 md:text-xl">{{ srcPath ? 'Рецепт не найден' : 'Некорректная ссылка' }}</h3>
      <p class="mt-2 px-4 text-sm text-zinc-500">{{ error?.message || 'Возможно, этот рецепт был удален, перемещен или указан неправильный путь.' }}</p>
      <div class="mt-5 flex flex-col gap-3 sm:flex-row md:mt-6">
        <button class="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 md:rounded-2xl md:px-5 md:py-2.5" @click="goBack">
          Назад к рецептам
        </button>
        <button v-if="srcPath" class="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 md:rounded-2xl md:px-5 md:py-2.5" @click="refreshRecipe">
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Контент рецепта -->
    <article v-else>
      <!-- Hero секция с изображением -->
      <div class="relative mb-6 overflow-hidden rounded-2xl md:mb-8 md:rounded-3xl lg:mb-10">
        <div class="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
          <img
            :src="recipeImage"
            :alt="recipe.title"
            class="h-full w-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <!-- Информация об авторе -->
        <div class="absolute top-2 left-3 right-3 sm:bottom-auto sm:left-4 sm:right-auto sm:top-4 md:left-6 md:top-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-sm md:gap-3 md:px-4 md:py-2">
            <div class="h-6 w-6 overflow-hidden rounded-full bg-zinc-200 md:h-8 md:w-8">
              <img
                v-if="recipe.author?.avatar"
                :src="getImageUrl(recipe.author.avatar)"
                :alt="recipe.author.username || 'Автор'"
                class="h-full w-full object-cover"
              />
              <UIcon v-else name="i-lucide-user" class="h-full w-full p-1 text-zinc-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-zinc-900 md:text-sm">
                {{ recipe.author?.username || recipe.author?.email || 'Пользователь' }}
              </p>
              <!-- <p v-if="recipe.author?.role === 'admin'" class="text-[10px] text-emerald-600 md:text-xs">
                Автор рецепта
              </p> -->
            </div>
          </div>
        </div>

        <!-- Действия: лайк, избранное, шаринг - мобильная версия внизу -->
        <div class="absolute top-3 right-3 flex gap-2 items-start    sm:top-4 sm:right-4 sm:top-auto md:bottom-6 md:right-6 lg:top-10 lg:right-10">
          <!-- Кнопка лайка -->
          <button
            class="group flex items-center justify-center gap-1 rounded-full bg-white/95 p-2 shadow-lg transition-all sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 md:rounded-xl"
            :class="liked ? 'text-red-600' : 'text-zinc-600 hover:bg-zinc-100'"
            @click="toggleLike"
            :disabled="likePending || (!isAuthenticated && showAuthToast)"
          >
            <UIcon
              :name="liked ? 'i-lucide-heart' : 'i-lucide-heart'"
              class="h-4 w-4 sm:h-5 sm:w-5"
              :class="liked ? 'fill-red-600' : ''"
            />
            <span class="hidden text-xs font-medium sm:inline sm:text-sm">{{ likesCount }}</span>
          </button>

          <!-- Кнопка избранного -->
          <button
            class="group flex items-center justify-center gap-1 rounded-full bg-white/95 p-2 shadow-lg transition-all sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2"
            :class="isFavorite ? 'text-amber-600' : 'text-zinc-600 hover:bg-zinc-100'"
            @click="toggleFavorite"
            :disabled="favoritePending || (!isAuthenticated && showAuthToast)"
          >
            <UIcon
              :name="isFavorite ? 'i-lucide-star' : 'i-lucide-star'"
              class="h-4 w-4 sm:h-5 sm:w-5"
              :class="isFavorite ? 'fill-amber-600' : ''"
            />
            <span class="hidden text-xs font-medium sm:inline sm:text-sm">В избранное</span>
          </button>

          <!-- Поделиться -->
          <button
            class="group flex items-center justify-center gap-1 rounded-full bg-white/95 p-2 shadow-lg transition-all hover:bg-zinc-100 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2"
            @click="shareRecipe"
          >
            <UIcon name="i-lucide-share-2" class="h-4 w-4 sm:h-5 sm:w-5" />
            <span class="hidden text-xs font-medium sm:inline sm:text-sm">Поделиться</span>
          </button>
        </div>

        <!-- Заголовок и описание поверх изображения -->
        <div class="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-6 md:p-6 lg:p-10">
          <h1 class="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-5xl">{{ recipe.title }}</h1>

          <!-- Мета информация -->
          <div class="mt-2 flex flex-wrap gap-2 sm:mt-3 sm:gap-3 md:mt-4">
            <div v-if="recipe.cookingTime" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <UIcon name="i-lucide-clock" class="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{{ recipe.cookingTime }} мин</span>
            </div>
            <div v-if="recipe.servings" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <UIcon name="i-lucide-users" class="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{{ adjustedServings }} порций</span>
            </div>
            <div v-if="recipe.calories" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <UIcon name="i-lucide-flame" class="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{{ recipe.calories }} ккал</span>
            </div>
            <!-- <div v-if="recipe.difficulty" class="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <UIcon name="i-lucide-chart-bar" class="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{{ getDifficultyText(recipe.difficulty) }}</span>
            </div> -->
          </div>

          <!-- Описание -->
          <div v-if="recipe.description" class="mt-2 max-h-8 overflow-y-auto text-xs text-white/90 sm:mt-3 sm:max-h-20 sm:text-sm md:mt-4 md:text-base">
            <p>{{ recipe.description }}</p>
          </div>

          <!-- Категории -->
          <div v-if="recipe.categories?.length" class="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            <span
              v-for="cat in recipe.categories"
              :key="cat.id"
              class="rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur-sm sm:px-3 sm:py-1 sm:text-sm"
            >
              {{ cat.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Основной контент: ингредиенты + шаги -->
      <div class="grid gap-6 md:gap-8 lg:grid-cols-[380px_1fr]">
        <!-- Левая колонка - Ингредиенты -->
        <aside class="lg:sticky lg:top-4 lg:self-start">
          <div class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-5">
              <h2 class="text-lg font-semibold text-zinc-900 md:text-xl">Ингредиенты</h2>

              <!-- Управление порциями -->
              <div class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-0.5 md:rounded-xl">
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 md:h-8 md:w-8"
                  @click="adjustServings(-1)"
                >
                  <UIcon name="i-lucide-minus" class="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
                <span class="min-w-[60px] text-center text-xs font-medium md:min-w-[80px] md:text-sm">{{ adjustedServings }} порций</span>
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 md:h-8 md:w-8"
                  @click="adjustServings(1)"
                >
                  <UIcon name="i-lucide-plus" class="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>
            </div>

            <div v-if="recipe.ingredients?.length" class="space-y-2 md:space-y-3">
              <div
                v-for="(ing, idx) in adjustedIngredients"
                :key="idx"
                class="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 md:pb-3"
              >
                <div class="flex items-center gap-2 md:gap-3">
                  <button
                    @click="toggleIngredient(idx)"
                    class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all md:h-5 md:w-5"
                    :class="checkedIngredients[idx] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 hover:border-emerald-300'"
                  >
                    <UIcon v-if="checkedIngredients[idx]" name="i-lucide-check" class="h-2.5 w-2.5 md:h-3 md:w-3" />
                  </button>
                  <span class="text-xs text-zinc-800 md:text-sm" :class="{ 'line-through text-zinc-400': checkedIngredients[idx] }">
                    {{ getIngredientName(ing) }}
                  </span>
                </div>
                <span class="ml-2 text-xs text-zinc-500 md:text-sm">
                  {{ formatIngredientAmount(ing) }}
                </span>
              </div>
            </div>

            <div v-else class="py-6 text-center text-zinc-400 md:py-8">
              <UIcon name="i-lucide-package" class="mx-auto mb-2 h-8 w-8 md:h-10 md:w-10" />
              <p class="text-xs md:text-sm">Ингредиенты не добавлены</p>
            </div>
          </div>
        </aside>

        <!-- Правая колонка - Шаги приготовления и комментарии -->
        <main>
          <!-- Шаги приготовления -->
          <div class="rounded-xl md:rounded-2xl">
            <h2 class="mb-4 text-lg font-semibold text-zinc-900 md:mb-6 md:text-xl">Приготовление</h2>

            <div v-if="recipe.steps?.length" class="space-y-3 md:space-y-4">
              <div
                v-for="(step, idx) in sortedSteps"
                :key="idx"
                class="rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-sm md:rounded-xl md:p-5"
              >
                <div class="mb-2 flex items-center gap-2 md:mb-3 md:gap-3">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 md:h-8 md:w-8 md:text-sm">
                    {{ step.sort || idx + 1 }}
                  </span>
                  <h3 class="text-sm font-semibold text-zinc-900 md:text-base">Шаг {{ step.sort || idx + 1 }}</h3>
                </div>
                <p class="text-xs leading-relaxed text-zinc-600 md:text-sm">{{ step.text }}</p>
                <div v-if="step.image" class="mt-3 overflow-hidden rounded-lg md:mt-4 md:rounded-xl">
                  <img
                    :src="getImageUrl(step.image)"
                    :alt="`Шаг ${step.sort || idx + 1}`"
                    class="w-full cursor-pointer transition hover:scale-105"
                    loading="lazy"
                    @click="openImage(step.image)"
                  />
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center md:py-16">
              <UIcon name="i-lucide-clipboard-list" class="mx-auto h-10 w-10 text-zinc-300 md:h-14 md:w-14" />
              <h3 class="mt-3 text-sm font-medium text-zinc-700 md:mt-4">Шаги приготовления не добавлены</h3>
              <p class="mt-1 text-xs text-zinc-400 md:text-sm">Этот рецепт находится в разработке</p>
            </div>
          </div>
        </main>
      </div>
    </article>

    <!-- Блок комментариев -->
    <div class="mt-8 rounded-xl border border-zinc-200 bg-white p-4 md:mt-10 md:rounded-2xl md:p-6">
      <h3 class="mb-4 text-lg font-semibold text-zinc-900 md:mb-6 md:text-xl">Комментарии ({{ commentsTotal }})</h3>

      <!-- Форма добавления комментария -->
      <div v-if="isAuthenticated" class="mb-6 md:mb-8">
        <textarea
          v-model="newCommentText"
          rows="3"
          placeholder="Поделитесь своим мнением о рецепте..."
          class="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300 md:rounded-xl md:p-4"
        />
        <div class="mt-2 flex justify-end md:mt-3">
          <button
            @click="submitComment"
            :disabled="commentPending || !newCommentText.trim()"
            class="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50 md:rounded-xl md:px-5 md:py-2 md:text-sm"
          >
            {{ commentPending ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
      </div>

      <div v-else class="mb-6 rounded-lg bg-zinc-50 p-3 text-center md:mb-8 md:rounded-xl md:p-4">
        <p class="text-xs text-zinc-600 md:text-sm">
          <button @click="navigateToLogin" class="text-emerald-600 hover:underline">Войдите</button>, чтобы оставить комментарий
        </p>
      </div>

      <!-- Список комментариев -->
      <div v-if="commentsLoading" class="py-6 text-center md:py-8">
        <div class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 md:h-6 md:w-6" />
      </div>

      <div v-else-if="comments.length === 0" class="py-6 text-center md:py-8">
        <UIcon name="i-lucide-message-circle" class="mx-auto h-10 w-10 text-zinc-300 md:h-12 md:w-12" />
        <p class="mt-2 text-xs text-zinc-500 md:text-sm">Пока нет комментариев. Будьте первым!</p>
      </div>

      <div v-else class="space-y-4 md:space-y-6">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-b border-zinc-100 pb-4 last:border-0 md:pb-5"
        >
          <div class="flex items-start gap-2 md:gap-3">
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 md:h-10 md:w-10">
              <UIcon name="i-lucide-user" class="h-4 w-4 text-zinc-500 md:h-5 md:w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-1">
                <div>
                  <span class="text-sm font-medium text-zinc-900 md:text-base">
                    {{ comment.author.username || comment.author.email }}
                  </span>
                  <span class="ml-1 text-xs text-zinc-400 md:ml-2">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>

                <!-- Действия с комментарием -->
                <div class="flex gap-1.5 md:gap-2">
                  <button
                    v-if="canEditComment(comment)"
                    @click="startEditComment(comment)"
                    class="text-xs text-zinc-400 hover:text-zinc-600 md:text-xs"
                  >
                    Редактировать
                  </button>
                  <button
                    v-if="canDeleteComment(comment)"
                    @click="deleteCommentHandler(comment.id)"
                    class="text-xs text-red-400 hover:text-red-600 md:text-xs"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <!-- Режим редактирования -->
              <div v-if="editingCommentId === comment.id" class="mt-2">
                <textarea
                  v-model="editingCommentText"
                  rows="2"
                  class="w-full rounded-lg border border-zinc-200 p-2 text-sm"
                />
                <div class="mt-2 flex gap-2">
                  <button
                    @click="updateCommentHandler(comment.id)"
                    class="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 md:px-3"
                  >
                    Сохранить
                  </button>
                  <button
                    @click="cancelEditComment"
                    class="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 md:px-3"
                  >
                    Отмена
                  </button>
                </div>
              </div>

              <!-- Текст комментария -->
              <p v-else class="mt-1 text-xs text-zinc-600 md:text-sm" :class="{ 'text-zinc-400': comment.isHidden }">
                {{ comment.isHidden ? 'Комментарий скрыт модератором' : comment.text }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагинация комментариев -->
      <div v-if="commentsTotalPages > 1" class="mt-4 flex flex-wrap justify-center gap-1.5 md:mt-6 md:gap-2">
        <button
          v-for="page in commentsTotalPages"
          :key="page"
          @click="loadComments(page)"
          class="rounded-md px-2 py-0.5 text-xs transition md:rounded-lg md:px-3 md:py-1 md:text-sm"
          :class="currentCommentsPage === page ? 'bg-zinc-900 text-white' : 'border border-zinc-200 hover:bg-zinc-50'"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipesApi, type RecipeResponse } from '~/composables/useRecipesApi'
import { useRecipesLikes } from '~/composables/useRecipesLikes'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import { useRecipesComments } from '~/composables/useRecipesComments'
import type { CommentDto } from '~/shared/types/domain'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'cabinet',
})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const recipesApi = useRecipesApi()
const likesApi = useRecipesLikes()
const favoritesApi = useRecipesFavorites()
const commentsApi = useRecipesComments()
const { isAuthenticated, user } = useAuth()

// Получаем параметр srcPath из маршрута
const srcPath = computed(() => {
  const path = route.params.srcPath
  return Array.isArray(path) ? path[0] : path
})

// Состояние
const recipe = ref<RecipeResponse | null>(null)
const pending = ref(true)
const error = ref<any>(null)

// Ингредиенты и порции
const checkedIngredients = ref<boolean[]>([])
const servings = ref(1)

// Лайки
const liked = ref(false)
const likesCount = ref(0)
const likePending = ref(false)

// Избранное
const isFavorite = ref(false)
const favoritePending = ref(false)

// Комментарии
const comments = ref<CommentDto[]>([])
const commentsTotal = ref(0)
const commentsTotalPages = ref(1)
const currentCommentsPage = ref(1)
const commentsLoading = ref(false)
const commentPending = ref(false)
const newCommentText = ref('')
const editingCommentId = ref<string | null>(null)
const editingCommentText = ref('')

// Вспомогательная функция для показа уведомления о необходимости авторизации
const showAuthToast = () => {
  // Здесь можно использовать ваш тост-уведомитель
  alert('Пожалуйста, войдите в аккаунт для выполнения этого действия')
  return false
}

// Загрузка рецепта
const loadRecipe = async () => {
  pending.value = true
  error.value = null
  recipe.value = null
  checkedIngredients.value = []
  servings.value = 1

  const currentSrcPath = srcPath.value

  if (!currentSrcPath) {
    error.value = new Error('Путь к рецепту не указан')
    pending.value = false
    return
  }

  try {
    const response = await recipesApi.getRecipeBySrcPath(currentSrcPath)

    if (response && response.id) {
      recipe.value = response
      servings.value = response.servings || 1
      checkedIngredients.value = new Array(response.ingredients?.length || 0).fill(false)

      // Загружаем статус лайка и избранного только если авторизован
      if (isAuthenticated.value) {
        await loadLikeStatus()
        await loadFavoriteStatus()
      }

      // Загружаем комментарии
      await loadComments(1)
    } else {
      throw new Error('Рецепт не найден')
    }
  } catch (err: any) {
    console.error('Ошибка загрузки рецепта:', err)
    if (err.statusCode === 404 || err.response?.status === 404) {
      error.value = new Error('Рецепт не найден. Возможно, он был удален.')
    } else {
      error.value = err
    }
  } finally {
    pending.value = false
  }
}

// Загрузка статуса лайка
const loadLikeStatus = async () => {
  if (!recipe.value?.id || !isAuthenticated.value) return

  try {
    const status = await likesApi.getLikesStatus(recipe.value.id)
    liked.value = status.liked
    likesCount.value = status.likesCount
  } catch (err) {
    console.error('Ошибка загрузки статуса лайка:', err)
  }
}

// Загрузка статуса избранного
const loadFavoriteStatus = async () => {
  if (!recipe.value?.id || !isAuthenticated.value) return

  try {
    const status = await favoritesApi.getFavoriteStatus(recipe.value.id)
    isFavorite.value = status.isFavorite
  } catch (err) {
    console.error('Ошибка загрузки статуса избранного:', err)
  }
}

// Загрузка комментариев
const loadComments = async (page: number) => {
  if (!recipe.value?.id) return

  commentsLoading.value = true
  try {
    const response = await commentsApi.getComments(recipe.value.id, page, 10)
    comments.value = response.items || []
    commentsTotal.value = response.total
    commentsTotalPages.value = response.pages
    currentCommentsPage.value = response.page
  } catch (err) {
    console.error('Ошибка загрузки комментариев:', err)
  } finally {
    commentsLoading.value = false
  }
}

// Toggle лайка
const toggleLike = async () => {
  if (!isAuthenticated.value) {
    showAuthToast()
    return
  }
  if (!recipe.value?.id) return

  likePending.value = true
  try {
    const result = await likesApi.toggleLike(recipe.value.id)
    liked.value = result.liked
    likesCount.value = result.likesCount
  } catch (err) {
    console.error('Ошибка при изменении лайка:', err)
  } finally {
    likePending.value = false
  }
}

// Toggle избранного
const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    showAuthToast()
    return
  }
  if (!recipe.value?.id) return

  favoritePending.value = true
  try {
    const result = await favoritesApi.toggleFavorite(recipe.value.id)
    isFavorite.value = result.isFavorite
  } catch (err) {
    console.error('Ошибка при изменении избранного:', err)
  } finally {
    favoritePending.value = false
  }
}

// Отправка комментария
const submitComment = async () => {
  if (!recipe.value?.id || !newCommentText.value.trim()) return

  commentPending.value = true
  try {
    await commentsApi.createComment(recipe.value.id, newCommentText.value.trim())
    newCommentText.value = ''
    await loadComments(1)
  } catch (err) {
    console.error('Ошибка при отправке комментария:', err)
  } finally {
    commentPending.value = false
  }
}

// Редактирование комментария
const startEditComment = (comment: CommentDto) => {
  editingCommentId.value = comment.id
  editingCommentText.value = comment.text
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentText.value = ''
}

const updateCommentHandler = async (commentId: string) => {
  if (!recipe.value?.id || !editingCommentText.value.trim()) return

  try {
    await commentsApi.updateComment(recipe.value.id, commentId, editingCommentText.value.trim())
    await loadComments(currentCommentsPage.value)
    cancelEditComment()
  } catch (err) {
    console.error('Ошибка при обновлении комментария:', err)
  }
}

// Удаление комментария
const deleteCommentHandler = async (commentId: string) => {
  if (!recipe.value?.id) return

  if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
    try {
      await commentsApi.deleteComment(recipe.value.id, commentId)
      await loadComments(currentCommentsPage.value)
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err)
    }
  }
}

// Проверка прав на редактирование/удаление комментария
const canEditComment = (comment: CommentDto) => {
  return user.value?.id === comment.author.id
}

const canDeleteComment = (comment: CommentDto) => {
  return user.value?.id === comment.author.id || user.value?.role === 'admin' || user.value?.role === 'moderator'
}

// Навигация на логин
const navigateToLogin = () => {
  router.push('/login')
}

// Остальные вычисляемые свойства и методы
const recipeImage = computed(() => {
  if (recipe.value?.photo?.src) {
    return getImageUrl(recipe.value.photo.src)
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
})

const adjustedServings = computed(() => servings.value)

const adjustedIngredients = computed(() => {
  const baseServings = recipe.value?.servings || 1
  const multiplier = servings.value / baseServings

  return recipe.value?.ingredients?.map((ing: any) => ({
    ...ing,
    amount: Math.round((ing.amount * multiplier) * 10) / 10
  })) || []
})

const sortedSteps = computed(() => {
  if (!recipe.value?.steps?.length) return []
  return [...recipe.value.steps].sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const apiUrl = config.public.apiUrl || 'http://localhost:3001'

  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const getIngredientName = (ing: any) => {
  if (ing.ingredient?.name) return ing.ingredient.name
  if (ing.name) return ing.name
  return 'Ингредиент'
}

const formatIngredientAmount = (ing: any) => {
  const amount = ing.amount || 0
  const unit = ing.unit?.short || ing.unitId || ''
  const notes = ing.notes ? ` (${ing.notes})` : ''
  return `${amount} ${unit}${notes}`
}

const getDifficultyText = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  }
  return map[difficulty] || difficulty
}

const goBack = () => {
  router.back()
}

const refreshRecipe = () => {
  loadRecipe()
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
}

const openImage = (imageUrl: string) => {
  window.open(getImageUrl(imageUrl), '_blank')
}

const adjustServings = (delta: number) => {
  const newValue = servings.value + delta
  if (newValue >= 1 && newValue <= 20) {
    servings.value = newValue
  }
}

const toggleIngredient = (index: number) => {
  checkedIngredients.value[index] = !checkedIngredients.value[index]
}

const shareRecipe = async () => {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({
        title: recipe.value?.title,
        text: recipe.value?.description || undefined,
        url: url,
      })
    } catch (err) {
      console.log('Отмена шаринга')
    }
  } else {
    await navigator.clipboard.writeText(url)
    alert('Ссылка скопирована в буфер обмена')
  }
}

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} мин назад`
    }
    return `${hours} ч назад`
  } else if (days === 1) {
    return 'вчера'
  } else if (days < 7) {
    return `${days} дн назад`
  } else {
    return d.toLocaleDateString('ru-RU')
  }
}

// Следим за изменением srcPath и авторизации
watch(srcPath, () => {
  if (srcPath.value) {
    loadRecipe()
  }
}, { immediate: true })

// Следим за изменением статуса авторизации для перезагрузки статусов лайка/избранного
watch(isAuthenticated, (newVal) => {
  if (newVal && recipe.value?.id) {
    loadLikeStatus()
    loadFavoriteStatus()
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Стили для скролла описания */
.max-h-16 {
  max-height: 4rem;
}

.max-h-24 {
  max-height: 6rem;
}

.max-h-16::-webkit-scrollbar,
.max-h-24::-webkit-scrollbar {
  width: 3px;
}

.max-h-16::-webkit-scrollbar-track,
.max-h-24::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.max-h-16::-webkit-scrollbar-thumb,
.max-h-24::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.max-h-16::-webkit-scrollbar-thumb:hover,
.max-h-24::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
