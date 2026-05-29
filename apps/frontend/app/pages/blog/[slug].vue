<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div v-if="pending" class="flex justify-center py-20">
      <Loader size="lg" />
    </div>

    <div v-else-if="articleData" class="container mx-auto px-4 py-12 md:py-20">
      <!-- Hero секция -->
      <div class="max-w-4xl mx-auto mb-12">
        <!-- Категории -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="cat in articleData.categories"
            :key="cat"
            class="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full"
          >
            {{ cat }}
          </span>
        </div>

        <!-- Заголовок -->
        <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          {{ articleData.title }}
        </h1>

        <!-- Мета информация -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="h-4 w-4" />
            <span>{{ formatDate(articleData.created_at) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="h-4 w-4" />
            <span>{{ getReadingTime(articleData.content) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-eye" class="h-4 w-4" />
            <span>{{ formatNumber(articleData.views) }} просмотров</span>
          </div>
        </div>

        <!-- Главное изображение -->
        <div class="rounded-2xl overflow-hidden bg-gray-100 mb-8">
          <img
            v-if="articleData.featured_image"
            :src="articleData.featured_image"
            :alt="articleData.title"
            class="w-full h-auto object-cover"
          />
          <div
            v-else
            class="w-full h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100"
          >
            <UIcon name="i-lucide-image" class="h-20 w-20 text-emerald-500" />
          </div>
        </div>
      </div>

      <!-- Содержание статьи -->
      <div class="max-w-4xl mx-auto">
        <!-- Краткое описание -->
        <div v-if="articleData.excerpt" class="text-xl text-gray-600 italic border-l-4 border-emerald-500 pl-6 mb-8">
          {{ articleData.excerpt }}
        </div>

        <!-- Контент -->
        <div
          class="prose prose-lg prose-emerald max-w-none"
          v-html="articleContent"
        />

        <!-- SEO блок -->
        <div v-if="articleData.seo?.keywords?.length" class="mt-8 pt-8 border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-500">Ключевые слова:</span>
            <span
              v-for="keyword in articleData.seo.keywords"
              :key="keyword"
              class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>

      <!-- Похожие статьи -->
      <div v-if="relatedArticles.length > 0" class="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
          Похожие статьи
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BlogCard
            v-for="related in relatedArticles"
            :key="related.id"
            :article="related"
          />
        </div>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="container mx-auto px-4 py-20 text-center">
      <EmptyState
        title="Статья не найдена"
        description="Возможно, она была удалена или перемещена"
        icon="i-lucide-file-question"
        action-text="Вернуться в блог"
        @action="router.push('/blog')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticlesApi } from '~/composables/useArticlesApi'
import BlogCard from '~/components/blog/BlogCard.vue'
import Loader from '~/shared/ui/loader/Loader.vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import { formatNumber } from '~/shared/utils/number'

const route = useRoute()
const router = useRouter()
const articlesApi = useArticlesApi()

const slug = computed(() => route.params.slug as string)

// SSR данные
const { data: articleData, pending, error } = await useAsyncData(
  `article-${slug.value}`,
  async () => {
    const response = await articlesApi.getArticleBySlug(slug.value)
    return response
  },
  {
    server: true,
    lazy: false
  }
)

// Похожие статьи (загружаем на клиенте)
const relatedArticles = ref<any[]>([])

const articleContent = computed(() => {
  if (!articleData.value?.content) return ''
  return articleData.value.content
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getReadingTime = (content: string) => {
  if (!content) return '1 мин'
  const text = content.replace(/<[^>]*>/g, '')
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} мин чтения`
}

// Загрузка похожих статей (только на клиенте)
const loadRelatedArticles = async () => {
  if (!articleData.value?.categories?.length) return

  try {
    const similar = await articlesApi.getArticles({
      status: 'published',
      category: articleData.value.categories[0],
      limit: 3,
      page: 1
    })
    relatedArticles.value = similar.items.filter(a => a.id !== articleData.value.id)
  } catch (error) {
    console.error('Error loading related articles:', error)
  }
}

// SEO метатеги
if (articleData.value) {
  useSeoMeta({
    title: articleData.value.seo?.title || articleData.value.title,
    description: articleData.value.seo?.description || articleData.value.excerpt,
    ogTitle: articleData.value.seo?.title || articleData.value.title,
    ogDescription: articleData.value.seo?.description || articleData.value.excerpt,
    ogImage: articleData.value.seo?.og_image || articleData.value.featured_image,
    twitterCard: 'summary_large_image'
  })
}

// Загружаем похожие статьи на клиенте
if (process.client && articleData.value) {
  loadRelatedArticles()
}
</script>

<style scoped>
.prose {
  font-family: inherit;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: #1f2937;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.prose h2 {
  font-size: 1.875rem;
}

.prose h3 {
  font-size: 1.5rem;
}

.prose p {
  color: #4b5563;
  line-height: 1.75;
  margin-bottom: 1.25em;
}

.prose a {
  color: #059669;
  text-decoration: underline;
}

.prose a:hover {
  color: #047857;
}

.prose img {
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.prose ul,
.prose ol {
  margin: 1.25em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.5em 0;
  color: #4b5563;
}

.prose blockquote {
  border-left: 4px solid #059669;
  padding-left: 1.5rem;
  font-style: italic;
  color: #6b7280;
  margin: 1.5em 0;
}
</style>
