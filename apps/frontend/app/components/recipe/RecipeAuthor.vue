<template>
  <div class="absolute left-3 top-4 sm:left-4 sm:top-4 md:left-5 md:top-5">
    <div class="flex cursor-default items-center gap-1.5 rounded-full bg-white/100 px-2 py-1 shadow-sm backdrop-blur-sm transition-all hover:bg-white/95 md:gap-2 md:px-1.5">
      <div class="h-4 w-4 overflow-hidden rounded-full bg-zinc-200 md:h-5 md:w-5">
        <img
          v-if="author?.avatar"
          :src="getImageUrl(author.avatar)"
          :alt="author.username || 'Автор'"
          class="h-full w-full object-cover"
          @error="handleAvatarError"
        />
        <UIcon v-else name="i-lucide-user" class="h-full w-full p-0.5 text-zinc-500 md:p-0.5" />
      </div>
      <span class="max-w-[80px] truncate text-[10px] font-medium text-zinc-800 md:max-w-[120px] md:text-xs">
        {{ authorName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Author {
  id: string
  username?: string
  email?: string
  avatar?: string
}

interface Props {
  author?: Author | null
}

const props = defineProps<Props>()

const config = useRuntimeConfig()

const authorName = computed(() => {
  if (props.author?.username) return props.author.username
  if (props.author?.email) return props.author.email.split('@')[0]
  return 'Пользователь'
})

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiBase || 'http://localhost:3001'
  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  const parent = target.parentElement
  if (parent) {
    const icon = document.createElement('div')
    icon.className = 'h-full w-full flex items-center justify-center bg-zinc-200'
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-zinc-500 md:h-4 md:w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    parent.appendChild(icon)
    target.remove()
  }
}
</script>
