<!-- pages/blog/index.vue -->
<script setup lang="ts">
import { useArticlesApi } from '~/composables/useArticlesApi'
import type { Article } from '~/shared/types/articles.types'

definePageMeta({
  layout: 'cabinet'
})

useSeoMeta({
  title: 'Блог | Планирование питания',
  description: 'Статьи о планировании питания, сезонных продуктах и работе с рецептами'
})

const articlesApi = useArticlesApi()
const toast = useToast()

const articles = ref<Article[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(0)
const totalArticles = ref(0)
const categoriesList = ref<string[]>([])

const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')

// Загрузка статей
const loadArticles = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: 9,
      status: 'published'
    }

    if (selectedCategory.value) params.category = selectedCategory.value
    if (searchQuery.value) params.search = searchQuery.value

    const response = await articlesApi.getArticles(params)
    articles.value = response.items
    totalPages.value = Math.ceil(response.total / 9)
    totalArticles.value = response.total
  } catch (error: any) {
    console.error('Error loading articles:', error)
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось загрузить статьи',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузка категорий
const loadCategories = async () => {
  try {
    categoriesList.value = await articlesApi.getCategories()
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Обработчики
const handleCategoryChange = (value: string | null) => {
  selectedCategory.value = value
  currentPage.value = 1
  loadArticles()
}

const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

const handleClearCategory = () => {
  selectedCategory.value = null
  currentPage.value = 1
  loadArticles()
}

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Пагинация
const onPageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Загрузка при монтировании
onMounted(() => {
  loadArticles()
  loadCategories()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div class="container mx-auto px-4 py-12 md:py-20">
      <!-- Hero секция -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
          Блог
        </h1>
        <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Статьи о планировании питания, сезонных продуктах и работе с рецептами
        </p>
      </div>

      <!-- Фильтры и поиск -->
      <div class="max-w-6xl mx-auto mb-10">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="flex gap-3 w-full md:w-auto">
            <USelect
              v-model="selectedCategory"
              placeholder="Все категории"
              :items="categoriesList.map(c => ({ label: c, value: c }))"
              :clearable="true"
              class="w-48"
              @update:model-value="handleCategoryChange"
            />
          </div>

          <div class="w-full md:w-80">
            <UInput
              v-model="searchQuery"
              placeholder="Поиск статей..."
              icon="i-lucide-search"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
              :clearable="true"
            />
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
      </div>

      <!-- Список статей -->
      <div v-else-if="articles.length > 0" class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="article in articles"
            :key="article.id"
            :to="`/blog/${article.slug}`"
            class="group block"
          >
            <UCard class="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <!-- Изображение -->
              <div class="relative overflow-hidden rounded-lg mb-4 bg-gray-100">
                <img
                  v-if="article.featured_image"
                  :src="article.featured_image"
                  :alt="article.title"
                  class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  v-else
                  class="w-full h-48 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100"
                >
                  <UIcon name="i-lucide-image" class="h-12 w-12 text-emerald-500" />
                </div>

                <!-- Категории -->
                <div class="absolute top-3 left-3 flex gap-2">
                  <span
                    v-for="cat in article.categories?.slice(0, 2)"
                    :key="cat"
                    class="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm rounded-lg text-emerald-700"
                  >
                    {{ cat }}
                  </span>
                </div>
              </div>

              <!-- Контент -->
              <div>
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>{{ formatDate(article.created_at) }}</span>
                  <span>•</span>
                  <span>{{ article.views }} просмотров</span>
                </div>

                <h3 class="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                  {{ article.title }}
                </h3>

                <p class="text-gray-600 line-clamp-3">
                  {{ article.excerpt || article.content?.replace(/<[^>]*>/g, '').slice(0, 150) + '...' }}
                </p>

                <div class="mt-4 flex items-center text-emerald-600 font-medium">
                  Читать далее
                  <UIcon name="i-lucide-arrow-right" class="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <UPagination
            v-model:page="currentPage"
            :total="totalArticles"
            :items-per-page="9"
            :max="5"
            @update:page="onPageChange"
          />
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-else class="text-center py-20">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
          <UIcon name="i-lucide-book-open" class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Статьи не найдены
        </h3>
        <p class="text-gray-500">
          Попробуйте изменить параметры поиска или выберите другую категорию
        </p>
      </div>
    </div>
  </div>
</template>

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
