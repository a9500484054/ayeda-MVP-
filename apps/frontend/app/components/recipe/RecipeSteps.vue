<template>
  <div class="rounded-xl md:rounded-2xl">
    <h2 class="mb-4 text-lg font-semibold text-zinc-900 md:mb-5 md:text-xl">Приготовление</h2>

    <div v-if="steps?.length" class="space-y-3 md:space-y-4">
      <div
        v-for="(step, idx) in sortedSteps"
        :key="idx"
        class="rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-sm md:rounded-xl md:p-5"
      >
        <div class="mb-2 flex items-center gap-2 md:mb-3 md:gap-3">
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 md:h-7 md:w-7 md:text-sm">
            {{ step.sort || idx + 1 }}
          </span>
          <h3 class="text-sm font-semibold text-zinc-900 md:text-base">Шаг {{ step.sort || idx + 1 }}</h3>
        </div>
        <p class="text-xs leading-relaxed text-zinc-600 md:text-sm">{{ step.text }}</p>
        <div v-if="step.image" class="mt-3 overflow-hidden rounded-lg md:mt-4 md:rounded-xl">
          <img
            :src="getImageUrl(step.image)"
            :alt="`Шаг ${step.sort || idx + 1}`"
            class="w-full"
            loading="lazy"
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
</template>

<script setup lang="ts">
interface Step {
  sort?: number
  text: string
  image?: string | null
}

interface Props {
  steps?: Step[]
}

const props = defineProps<Props>()

const config = useRuntimeConfig()

const sortedSteps = computed(() => {
  if (!props.steps?.length) return []
  return [...props.steps].sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const openImage = (imageUrl: string) => {
  window.open(getImageUrl(imageUrl), '_blank')
}
</script>
