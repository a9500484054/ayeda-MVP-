<template>
  <div v-if="videoUrl && isValidVideo" class="mb-6 rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm md:rounded-2xl">
    <div class="relative pt-[56.25%] bg-zinc-100">
      <iframe
        ref="iframeRef"
        v-if="!hasError"
        :src="embedUrl"
        class="absolute inset-0 w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="handleIframeLoad"
      />
      <!-- Сообщение об ошибке -->
      <div v-else class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <UIcon name="i-lucide-video-off" class="h-8 w-8 text-zinc-400 mb-2" />
        <p class="text-sm text-zinc-500">Не удалось загрузить видео</p>
        <p class="text-xs text-zinc-400 mt-1">Платформа: {{ platformName }}</p>
        <a
          :href="videoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 text-xs text-emerald-600 hover:underline"
        >
          Открыть в {{ platformName }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Loader from '~/shared/ui/loader/Loader.vue';
import { getEmbedUrl, validateVideoUrl, detectVideoPlatform } from '~/shared/utils/video'

interface Props {
  videoUrl?: string | null
}

const props = defineProps<Props>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const hasError = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const isValidVideo = computed(() => {
  if (!props.videoUrl) return false
  return validateVideoUrl(props.videoUrl)
})

const embedUrl = computed(() => {
  if (!props.videoUrl || !isValidVideo.value) return null
  return getEmbedUrl(props.videoUrl)
})

const platformName = computed(() => {
  if (!props.videoUrl) return ''
  const platform = detectVideoPlatform(props.videoUrl)
  const names: Record<string, string> = {
    youtube: 'YouTube',
    vk: 'VK Video',
    rutube: 'Rutube'
  }
  return names[platform] || ''
})

const handleIframeLoad = () => {
  // Если iframe загрузился успешно - ошибки нет
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  hasError.value = false
}

const handleIframeError = () => {
  hasError.value = true
}

// Таймаут на случай, если iframe висит без ошибки
const startTimeout = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(() => {
    // Если через 10 секунд видео не загрузилось - показываем ошибку
    if (!hasError.value) {
      console.warn('Video loading timeout:', embedUrl.value)
      hasError.value = true
    }
  }, 10000)
}

// Сброс при изменении URL
watch(() => props.videoUrl, () => {
  hasError.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
})

// При монтировании запускаем таймер
onMounted(() => {
  if (embedUrl.value) {
    startTimeout()
  }
})
</script>
