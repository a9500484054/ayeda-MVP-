<template>
  <div class="mt-8 rounded-2xl border border-zinc-200 bg-white overflow-hidden md:mt-10">
    <!-- Заголовок -->
    <div class="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 md:px-6 md:py-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <UIcon name="i-lucide-message-circle" class="h-4 w-4 text-emerald-600" />
        </div>
        <h3 class="text-base font-semibold text-zinc-900 md:text-lg">
          Комментарии
          <span class="ml-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
            {{ total }}
          </span>
        </h3>
      </div>
    </div>

    <div class="p-4 md:p-6">
      <!-- Форма добавления комментария -->
      <div v-if="isAuthenticated" class="mb-6">
        <div class="flex gap-3">
          <div class="flex-shrink-0">
            <div class="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                :alt="userName"
                class="h-full w-full object-cover"
                @error="handleUserAvatarError"
              />
              <div v-else class="h-full w-full flex items-center justify-center text-white text-sm font-medium">
                {{ userInitial }}
              </div>
            </div>
          </div>
          <div class="flex-1">
            <Textarea
              v-model="newCommentText"
              placeholder="Написать комментарий..."
              :rows="2"
              class="!rounded-xl !border-zinc-200 focus:!border-emerald-300"
            />
            <div class="mt-2 flex justify-end">
              <Button
                size="sm"
                color="primary"
                :loading="commentPending"
                :disabled="!newCommentText.trim()"
                @click="submitComment"
              >
                <UIcon name="i-lucide-send" class="h-3.5 w-3.5" />
                Отправить
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Призыв войти -->
      <div v-else class="mb-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center">
        <UIcon name="i-lucide-message-square" class="h-6 w-6 text-emerald-500 mx-auto mb-2" />
        <p class="text-sm text-zinc-600">
          <button @click="$emit('login')" class="font-medium text-emerald-600 hover:underline">
            Войдите
          </button>, чтобы поделиться своим мнением
        </p>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="py-8 text-center">
        <Loader />
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="comments.length === 0" class="py-8 text-center">
        <div class="flex justify-center mb-3">
          <div class="rounded-full bg-zinc-100 p-3">
            <UIcon name="i-lucide-messages-square" class="h-6 w-6 text-zinc-400" />
          </div>
        </div>
        <p class="text-sm text-zinc-500">Пока нет комментариев</p>
        <p class="text-xs text-zinc-400 mt-1">Будьте первым, кто оставит комментарий!</p>
      </div>

      <!-- Список комментариев -->
      <div v-else class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="group rounded-xl transition-all duration-200 hover:bg-zinc-50/50 p-3 -mx-3"
        >
          <div class="flex gap-3">
            <!-- Аватар -->
            <div class="flex-shrink-0">
              <div class="h-9 w-9 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 overflow-hidden">
                <img
                  v-if="comment.author?.avatar"
                  :src="getImageUrl(comment.author.avatar)"
                  :alt="getAuthorName(comment.author)"
                  class="h-full w-full object-cover"
                  @error="handleAvatarError"
                />
                <div v-else class="h-full w-full flex items-center justify-center text-white text-sm font-medium">
                  {{ getInitial(comment.author) }}
                </div>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <!-- Верхняя часть -->
              <div class="flex flex-wrap items-baseline gap-1 mb-0.5">
                <span class="text-sm font-semibold text-zinc-900">
                  {{ getAuthorName(comment.author) }}
                </span>
                <span class="text-xs text-zinc-400">
                  • {{ formatDate(comment.createdAt) }}
                </span>

                <!-- Действия с кнопками -->
                <div class="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    v-if="canEditComment(comment)"
                    variant="ghost"
                    size="xs"
                    class="!p-1 !h-auto text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Редактировать"
                    @click="startEditComment(comment)"
                  >
                    <UIcon name="i-lucide-pencil" class="h-3 w-3" />
                  </Button>
                  <Button
                    v-if="canDeleteComment(comment)"
                    variant="ghost"
                    size="xs"
                    class="!p-1 !h-auto text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    title="Удалить"
                    @click="openDeleteModal(comment.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <!-- Режим редактирования -->
              <div v-if="editingId === comment.id" class="mt-2">
                <Textarea
                  v-model="editingText"
                  :rows="2"
                  class="!rounded-lg !text-sm"
                />
                <div class="mt-2 flex gap-2 justify-end">
                  <Button size="xs" variant="ghost" @click="cancelEdit">Отмена</Button>
                  <Button
                    size="xs"
                    color="primary"
                    :loading="editPending"
                    @click="handleUpdateComment(comment.id)"
                  >
                    Сохранить
                  </Button>
                </div>
              </div>

              <!-- Текст -->
              <p v-else class="text-sm text-zinc-700 leading-relaxed">
                {{ comment.isHidden ? 'Комментарий скрыт модератором' : comment.text }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="mt-6 pt-2 flex justify-center">
        <div class="flex gap-1">
          <Button
            v-for="page in totalPages"
            :key="page"
            :variant="currentPage === page ? 'solid' : 'outline'"
            size="xs"
            @click="() => $emit('page-change', page)"
          >
            {{ page }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmModal
      :open="showDeleteModal"
      title="Удалить комментарий?"
      description="Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить."
      confirm-text="Удалить"
      confirm-color="danger"
      :loading="deletePending"
      @update:open="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Button from '~/shared/ui/button/Button.vue'
import Textarea from '~/shared/ui/textarea/Textarea.vue'
import Loader from '~/shared/ui/loader/Loader.vue'
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue'

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
  userName?: string
  userAvatar?: string | null  // Добавлен пропс для аватара
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  commentPending: false,
  editPending: false,
  isAuthenticated: false,
  userName: '',
  userAvatar: null
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
const showDeleteModal = ref(false)
const deletePending = ref(false)
const commentToDelete = ref<string | null>(null)

const userInitial = computed(() => {
  if (props.userName) {
    return props.userName.charAt(0).toUpperCase()
  }
  return '?'
})

const getInitial = (author?: Author | null) => {
  if (author?.username) return author.username.charAt(0).toUpperCase()
  if (author?.email) return author.email.charAt(0).toUpperCase()
  return '?'
}

// Сброс формы после отправки
watch(() => props.commentPending, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    newCommentText.value = ''
  }
})

// Сброс режима редактирования после успешного обновления
watch(() => props.editPending, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // Если редактирование завершено - выходим из режима
    editingId.value = null
    editingText.value = ''
  }
})

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiBase || 'http://localhost:3001'
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
      if (minutes === 0) return 'только что'
      return `${minutes} мин`
    }
    return `${hours} ч`
  } else if (days === 1) {
    return 'вчера'
  } else if (days < 7) {
    return `${days} дн`
  } else if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} нед`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} мес`
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
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

const handleUpdateComment = (commentId: string) => {
  if (!editingText.value.trim()) return
  emit('update', commentId, editingText.value.trim())
}

const openDeleteModal = (commentId: string) => {
  commentToDelete.value = commentId
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (commentToDelete.value) {
    deletePending.value = true
    emit('delete', commentToDelete.value)
    setTimeout(() => {
      showDeleteModal.value = false
      deletePending.value = false
      commentToDelete.value = null
    }, 500)
  }
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    const fallback = document.createElement('div')
    fallback.className = 'h-full w-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-br from-zinc-400 to-zinc-500'
    fallback.textContent = '?'
    parent.appendChild(fallback)
    target.remove()
  }
}


// Вычисляемое свойство для аватара
const userAvatar = computed(() => {
  if (!props.userAvatar) return null
  return getImageUrl(props.userAvatar)
})

// Обработчик ошибки загрузки аватара
const handleUserAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    const fallback = document.createElement('div')
    fallback.className = 'h-full w-full flex items-center justify-center text-white text-sm font-medium'
    fallback.textContent = userInitial.value
    parent.appendChild(fallback)
    target.remove()
  }
}


</script>
