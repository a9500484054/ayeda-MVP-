<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Блог
        </h1>
        <p v-if="totalArticles > 0" class="mt-2 text-sm text-zinc-500">
          {{ totalArticles }} {{ getDeclension(totalArticles, ['статья', 'статьи', 'статей']) }}
        </p>
      </div>

      <!-- Фильтры - оборачиваем в ClientOnly чтобы избежать гидратации -->
      <ClientOnly>
        <BlogFilters
          :category="selectedCategory"
          :search="searchQuery"
          :categories="categories"
          @update:category="setCategory"
          @update:search="setSearch"
        />
      </ClientOnly>
    </div>

    <!-- Скелетон начальной загрузки -->
    <div v-if="(isLoading || ssrPending) && articles.length === 0" :class="containerClass">
      <BlogSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Список статей -->
    <div v-else-if="articles.length > 0" :class="containerClass">
      <BlogCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- Пустое состояние -->
    <EmptyState
      v-else-if="!isLoading && !ssrPending"
      title="Статьи не найдены"
      description="Попробуйте изменить параметры поиска"
      icon="i-lucide-book-open"
      action-text="Сбросить фильтры"
      @action="resetFilters"
    />

    <!-- Скелетон дозагрузки -->
    <div v-if="isLoading && articles.length > 0" :class="containerClass">
      <BlogSkeleton v-for="i in 3" :key="i" />
    </div>

    <!-- Триггер бесконечной прокрутки -->
    <div ref="triggerRef" class="h-10" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useBlogSearch } from '~/composables/useBlogSearch'
import { useArticlesApi } from '~/composables/useArticlesApi'
import BlogFilters from '~/components/blog/BlogFilters.vue'
import BlogCard from '~/components/blog/BlogCard.vue'
import BlogSkeleton from '~/components/blog/BlogSkeleton.vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import { getDeclension } from '~/shared/utils/strings'

definePageMeta({
  layout: 'cabinet'
})

useSeoMeta({
  title: 'Блог | Планирование питания',
  description: 'Статьи о планировании питания, сезонных продуктах и работе с рецептами'
})

const articlesApi = useArticlesApi()

// SSR данные
const { data: ssrData, pending: ssrPending } = await useAsyncData(
  'blog-articles',
  async () => {
    const response = await articlesApi.getArticles({
      status: 'published',
      page: 1,
      limit: 9
    })
    return response
  },
  {
    server: true,
    lazy: false
  }
)

// Используем composable для клиентской логики
const {
  articles,
  isLoading,
  hasMore,
  totalArticles,
  categories,
  selectedCategory,
  searchQuery,
  fetchCategories,
  loadArticles,
  setCategory,
  setSearch,
  resetFilters,
  setInitialData
} = useBlogSearch()

// Инициализируем данные из SSR
if (ssrData.value) {
  setInitialData({
    articles: ssrData.value.items,
    total: ssrData.value.total,
    hasMore: ssrData.value.items.length === 9,
    page: 2
  })
}

// Единая сетка
const containerClass = computed(() => {
  return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
})

// Бесконечная прокрутка (только на клиенте)
const triggerRef = ref<HTMLElement | null>(null)

if (process.client) {
  useInfiniteScroll(
    triggerRef,
    () => {
      if (hasMore.value && !isLoading.value && !ssrPending.value) {
        loadArticles()
      }
    },
    { distance: 100 }
  )
}

// Загрузка категорий
onMounted(async () => {
  await fetchCategories()
})
</script>
