import { ref, computed } from 'vue'
import { useArticlesApi } from './useArticlesApi'
import type { Article } from '~/shared/types/articles.types'

export function useBlogSearch() {
  const articlesApi = useArticlesApi()

  // State
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const totalArticles = ref(0)
  const categories = ref<string[]>([])
  const selectedCategory = ref<string | null>(null)
  const searchQuery = ref('')

  const limit = 9

  // Установка начальных данных из SSR
  const setInitialData = (data: { articles: Article[], total: number, hasMore: boolean, page: number }) => {
    articles.value = data.articles
    totalArticles.value = data.total
    hasMore.value = data.hasMore
    page.value = data.page
  }

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      categories.value = await articlesApi.getCategories()
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // Загрузка статей
  const loadArticles = async (reset = false) => {
    if (isLoading.value) return
    if (!reset && !hasMore.value) return

    isLoading.value = true

    try {
      const params: any = {
        page: page.value,
        limit,
        status: 'published'
      }

      if (selectedCategory.value) {
        params.category = selectedCategory.value
      }

      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const response = await articlesApi.getArticles(params)

      if (reset || page.value === 1) {
        articles.value = response.items
      } else {
        articles.value = [...articles.value, ...response.items]
      }

      totalArticles.value = response.total
      hasMore.value = response.items.length === limit
      page.value++
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Сброс и повторная загрузка
  const resetAndLoad = () => {
    page.value = 1
    articles.value = []
    hasMore.value = true
    loadArticles(true)
  }

  // Обработчики фильтров
  const setCategory = (category: string | null) => {
    selectedCategory.value = category
    resetAndLoad()
  }

  const setSearch = (query: string) => {
    searchQuery.value = query
    resetAndLoad()
  }

  const resetFilters = () => {
    selectedCategory.value = null
    searchQuery.value = ''
    resetAndLoad()
  }

  return {
    // State
    articles,
    isLoading,
    hasMore,
    totalArticles,
    categories,
    selectedCategory,
    searchQuery,
    page,

    // Methods
    setInitialData,
    fetchCategories,
    loadArticles,
    resetAndLoad,
    setCategory,
    setSearch,
    resetFilters
  }
}
