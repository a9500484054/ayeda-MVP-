<template>
  <NuxtLink :to="`/blog/${article.slug}`" class="group block">
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <!-- Image -->
      <div class="relative overflow-hidden bg-gray-100">
        <img
          v-if="article.featured_image"
          :src="article.featured_image"
          :alt="article.title"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          v-else
          class="w-full h-48 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100"
        >
          <UIcon name="i-lucide-image" class="h-12 w-12 text-emerald-500" />
        </div>

        <!-- Categories overlay -->
        <div class="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            v-for="cat in article.categories?.slice(0, 2)"
            :key="cat"
            class="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-lg text-emerald-700"
          >
            {{ cat }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <UIcon name="i-lucide-calendar" class="h-3.5 w-3.5" />
          <span>{{ formatDate(article.created_at) }}</span>
          <span>•</span>
          <UIcon name="i-lucide-eye" class="h-3.5 w-3.5" />
          <span>{{ formatNumber(article.views) }} просмотров</span>
        </div>

        <h3 class="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
          {{ article.title }}
        </h3>

        <p class="text-gray-600 line-clamp-3">
          {{ article.excerpt || stripHtml(article.content).slice(0, 120) + '...' }}
        </p>

        <div class="mt-4 flex items-center text-emerald-600 font-medium text-sm">
          Читать далее
          <UIcon name="i-lucide-arrow-right" class="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Article } from '~/shared/types/articles.types'
import { formatNumber } from '~/shared/utils/number'

const props = defineProps<{
  article: Article
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  })
}

const stripHtml = (html: string) => {
  return html?.replace(/<[^>]*>/g, '') || ''
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
