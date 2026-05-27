<template>
  <div class="mt-8 rounded-xl border border-zinc-200 bg-white p-4 md:mt-10 md:rounded-2xl md:p-6">
    <h3 class="mb-4 text-lg font-semibold text-zinc-900 md:mb-5 md:text-xl">
      Комментарии ({{ total }})
    </h3>

    <!-- Форма добавления комментария -->
    <div v-if="isAuthenticated" class="mb-6 md:mb-8">
      <Textarea
        v-model="newCommentText"
        placeholder="Поделитесь своим мнением о рецепте..."
        :rows="3"
      />
      <div class="mt-2 flex justify-end md:mt-3">
        <Button
          color="primary"
          size="sm"
          :loading="commentPending"
          :disabled="!newCommentText.trim()"
          @click="submitComment"
        >
          Отправить
        </Button>
      </div>
    </div>

    <div v-else class="mb-6 rounded-lg bg-zinc-50 p-3 text-center md:mb-8 md:rounded-xl md:p-4">
      <p class="text-xs text-zinc-600 md:text-sm">
        <button @click="$emit('login')" class="cursor-pointer text-emerald-600 hover:underline">
          Войдите
        </button>, чтобы оставить комментарий
      </p>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="py-6 text-center md:py-8">
      <Loader />
    </div>

    <!-- Пустое состояние -->
    <EmptyState
      v-else-if="comments.length === 0"
      title="Нет комментариев"
      description="Будьте первым, кто оставит комментарий!"
      icon="i-lucide-message-circle"
    />

    <!-- Список комментариев -->
    <div v-else class="space-y-4 md:space-y-5">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border-b border-zinc-100 pb-4 last:border-0 md:pb-5"
      >
        <div class="flex items-start gap-2 md:gap-3">
          <!-- Аватар -->
          <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200 md:h-9 md:w-9">
            <img
              v-if="comment.author?.avatar"
              :src="getImageUrl(comment.author.avatar)"
              :alt="comment.author.username || 'Пользователь'"
              class="h-full w-full object-cover"
              @error="handleAvatarError"
            />
            <UIcon v-else name="i-lucide-user" class="h-full w-full p-1.5 text-zinc-500" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-1">
              <div>
                <span class="text-sm font-medium text-zinc-900 md:text-base">
                  {{ getAuthorName(comment.author) }}
                </span>
                <span class="ml-1.5 text-xs text-zinc-400 md:ml-2">
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="canEditComment(comment)"
                  @click="startEditComment(comment)"
                  class="cursor-pointer text-xs text-zinc-400 transition hover:text-zinc-600"
                >
                  Редактировать
                </button>
                <button
                  v-if="canDeleteComment(comment)"
                  @click="$emit('delete', comment.id)"
                  class="cursor-pointer text-xs text-red-400 transition hover:text-red-600"
                >
                  Удалить
                </button>
              </div>
            </div>

            <!-- Режим редактирования -->
            <div v-if="editingId === comment.id" class="mt-2">
              <Textarea
                v-model="editingText"
                :rows="2"
              />
              <div class="mt-2 flex gap-2">
                <Button
                  size="xs"
                  color="primary"
                  :loading="editPending"
                  @click="$emit('update', comment.id, editingText)"
                >
                  Сохранить
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  @click="cancelEdit"
                >
                  Отмена
                </Button>
              </div>
            </div>

            <!-- Текст комментария -->
            <p v-else class="mt-1 text-sm leading-relaxed text-zinc-700" :class="{ 'text-zinc-400 italic': comment.isHidden }">
              {{ comment.isHidden ? 'Комментарий скрыт модератором' : comment.text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="mt-5 flex flex-wrap justify-center gap-1.5 md:mt-6 md:gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="$emit('page-change', page)"
        class="cursor-pointer rounded-md px-2.5 py-1 text-xs transition md:rounded-lg md:px-3.5 md:py-1.5 md:text-sm"
        :class="currentPage === page ? 'bg-zinc-900 text-white' : 'border border-zinc-200 hover:bg-zinc-50'"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '~/shared/ui/button/Button.vue'
import Textarea from '~/shared/ui/textarea/Textarea.vue'
import Loader from '~/shared/ui/loader/Loader.vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'

interface Author {
  id: string
  username?: string
  email?: string
  avatar?: string
}

interface Comment {
  id: string
  text: string
  createdAt: string
  isHidden?: boolean
  author?: Author | null
}

interface Props {
  comments: Comment[]
  total: number
  currentPage: number
  totalPages: number
  loading?: boolean
  commentPending?: boolean
  editPending?: boolean
  isAuthenticated?: boolean
  userId?: string
  userRole?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  commentPending: false,
  editPending: false,
  isAuthenticated: false
})

const emit = defineEmits<{
  'submit': [text: string]
  'update': [id: string, text: string]
  'delete': [id: string]
  'page-change': [page: number]
  'login': []
}>()

const config = useRuntimeConfig()
const newCommentText = ref('')
const editingId = ref<string | null>(null)
const editingText = ref('')

// Сброс формы после отправки
watch(() => props.commentPending, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    newCommentText.value = ''
  }
})

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const getAuthorName = (author?: Author | null) => {
  if (author?.username) return author.username
  if (author?.email) return author.email.split('@')[0]
  return 'Пользователь'
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
  }
  return d.toLocaleDateString('ru-RU')
}

const canEditComment = (comment: Comment) => {
  return props.userId === comment.author?.id
}

const canDeleteComment = (comment: Comment) => {
  return props.userId === comment.author?.id || props.userRole === 'admin' || props.userRole === 'moderator'
}

const submitComment = () => {
  if (!newCommentText.value.trim()) return
  emit('submit', newCommentText.value.trim())
}

const startEditComment = (comment: Comment) => {
  editingId.value = comment.id
  editingText.value = comment.text
}

const cancelEdit = () => {
  editingId.value = null
  editingText.value = ''
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    const icon = document.createElement('div')
    icon.className = 'h-full w-full flex items-center justify-center bg-zinc-200'
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-zinc-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    parent.appendChild(icon)
    target.remove()
  }
}
</script>
