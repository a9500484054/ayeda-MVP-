import { ref } from 'vue'
import { useRecipesApi, type RecipeResponse, type RecipesResponse } from './useRecipesApi'

export function useRecipesSearch() {
  const recipesApi = useRecipesApi()

  // State
  const recipes = ref<RecipeResponse[]>([])
  const loadingMore = ref(false)
  const searchQuery = ref('')
  const page = ref(1)
  const total = ref(0)
  const hasNext = ref(false)

  // Computed (убрали pending, так как используем отдельно)
  const totalRecipes = computed(() => total.value)

  // Methods
  const fetchRecipes = async (reset = false) => {
    if (reset) {
      page.value = 1
      recipes.value = []
    }

    const isLoadingMore = !reset && page.value > 1

    if (isLoadingMore) {
      loadingMore.value = true
    }

    try {
      const params: any = {
        page: page.value,
        limit: 12,
        status: 'public',
      }

      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const response: RecipesResponse = await recipesApi.getRecipes(params)

      if (reset || page.value === 1) {
        recipes.value = response.data
      } else {
        recipes.value.push(...response.data)
      }

      total.value = response.total
      hasNext.value = response.hasNext

      return response
    } catch (error) {
      console.error('Error fetching recipes:', error)
      throw error
    } finally {
      if (isLoadingMore) {
        loadingMore.value = false
      }
    }
  }

  const loadMore = async () => {
    if (loadingMore.value || !hasNext.value) return
    page.value++
    await fetchRecipes(false)
  }

  const resetSearch = () => {
    searchQuery.value = ''
    page.value = 1
  }

  return {
    // State
    recipes,
    loadingMore,
    searchQuery,
    page,
    total,
    hasNext,
    totalRecipes,

    // Methods
    fetchRecipes,
    loadMore,
    resetSearch,
  }
}
