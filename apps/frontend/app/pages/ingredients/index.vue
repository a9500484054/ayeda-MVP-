<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
    <!-- HEADER -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Ингредиенты
        </h1>
        <p v-if="totalItems > 0" class="mt-2 text-sm text-zinc-500">
          {{ totalItems }} {{ getDeclension(totalItems, ['ингредиент', 'ингредиента', 'ингредиентов']) }}
        </p>
      </div>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <div class="relative">
        <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <UInput
          v-model="searchQuery"
          placeholder="Поиск ингредиентов по названию или коду..."
          size="lg"
          class="w-full pl-10"
          @update:model-value="handleSearchUpdate"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-if="isClientLoading && ingredients.length === 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white rounded-xl border border-zinc-200 overflow-hidden animate-pulse">
        <div class="aspect-square bg-zinc-200"></div>
        <div class="p-4 space-y-3">
          <div class="h-5 bg-zinc-200 rounded w-3/4"></div>
          <div class="h-4 bg-zinc-200 rounded w-1/2"></div>
          <div class="flex justify-between">
            <div class="h-4 bg-zinc-200 rounded w-1/3"></div>
            <div class="h-4 bg-zinc-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredients Grid -->
    <div v-else-if="ingredients.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="item in ingredients"
        :key="item.id"
        :to="`/ingredients/${item.srcPath}`"
        class="group bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
      >
        <!-- Photo -->
        <div class="aspect-square bg-zinc-100 overflow-hidden">
          <img
            v-if="item.photo"
            :src="item.photo"
            :alt="item.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <UIcon name="i-lucide-package" class="w-16 h-16 text-emerald-600/40" />
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="font-semibold truncate group-hover:text-emerald-600 transition-colors">
            {{ item.name }}
          </h3>
          <p class="text-xs text-zinc-400 font-mono">{{ item.code }}</p>

          <div class="flex items-center justify-between mt-2 text-sm">
            <span class="text-zinc-500">{{ item.unit.name }}</span>
            <span v-if="item.nutritionInfo?.calories" class="text-emerald-600 font-medium">
              {{ item.nutritionInfo.calories }} ккал
            </span>
          </div>

          <p v-if="item.description" class="text-xs text-zinc-400 mt-1 line-clamp-2">
            {{ item.description }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Ингредиенты не найдены"
      description="Попробуйте изменить поисковый запрос"
      icon="i-lucide-package"
      :action-text="searchQuery ? 'Очистить поиск' : ''"
      @action="clearSearch"
    />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="pageSize"
        :total="totalItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import { getDeclension } from '~/shared/utils/strings'

definePageMeta({ layout: 'cabinet' })

const config = useRuntimeConfig()

useHead({
  title: 'Ингредиенты - Каталог продуктов | АуЕда',
  meta: [
    { name: 'description', content: 'Полный каталог ингредиентов для кулинарии. Узнайте состав, калорийность и полезные свойства продуктов.', key: 'description' },
    { name: 'keywords', content: 'ингредиенты, продукты, каталог продуктов, состав, калорийность', key: 'keywords' },
    { property: 'og:title', content: 'Ингредиенты - Каталог продуктов | АуЕда', key: 'og:title' },
    { property: 'og:description', content: 'Полный каталог ингредиентов для кулинарии', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/images/ingredients-og.jpg', key: 'og:image' },
    { property: 'og:image:alt', content: 'Ингредиенты - Каталог продуктов АуЕда', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/ingredients', key: 'og:url' },
    { property: 'og:site_name', content: 'АуЕда', key: 'og:site_name' },
    { name: 'twitter:card', content: 'summary_large_image', key: 'twitter:card' },
    { name: 'twitter:title', content: 'Ингредиенты - Каталог продуктов | АуЕда', key: 'twitter:title' },
    { name: 'twitter:description', content: 'Полный каталог ингредиентов для кулинарии', key: 'twitter:description' },
  ],
  link: [
    { rel: 'canonical', href: 'https://ayeda.ru/ingredients' }
  ]
})

// Состояние
const ingredients = ref<any[]>([])
const isClientLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)

// ============ SSR DATA FETCHING ============
const { data: ssrData, pending } = await useAsyncData(
  'ingredients-public',
  async () => {
    console.log('🚀 useAsyncData started for ingredients list')

    const apiBase = config.public.apiBase || 'http://localhost:3001'
    const url = `${apiBase}/ingredients?page=1&limit=20`
    console.log('📡 Request URL:', url)

    try {
      const response = await $fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('✅ Response received, count:', response?.data?.length || 0)
      return response
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      throw err
    }
  },
  {
    server: true,
    lazy: false,
  }
)

// Инициализируем данные из SSR
if (ssrData.value) {
  ingredients.value = ssrData.value.data || []
  totalItems.value = ssrData.value.total || 0
  currentPage.value = ssrData.value.page || 1
}

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

// Методы
const handleSearchUpdate = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
  debouncedSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchIngredients(true)
}

// Debounced search
let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchIngredients(true)
  }, 500)
}

// Fetch ingredients (клиентские запросы)
const fetchIngredients = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
    ingredients.value = []
  }

  isClientLoading.value = true

  try {
    const apiBase = config.public.apiBase || 'http://localhost:3001'
    let url: string

    if (searchQuery.value && searchQuery.value.trim()) {
      const query = encodeURIComponent(searchQuery.value.trim())
      url = `${apiBase}/ingredients/search?q=${query}&page=${currentPage.value}&limit=${pageSize.value}`
    } else {
      url = `${apiBase}/ingredients?page=${currentPage.value}&limit=${pageSize.value}`
    }

    console.log('📡 Fetching ingredients:', url)

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (reset || currentPage.value === 1) {
      ingredients.value = response.data || []
    } else {
      ingredients.value.push(...(response.data || []))
    }

    totalItems.value = response.total || 0
  } catch (error: any) {
    console.error('Error fetching ingredients:', error)
  } finally {
    isClientLoading.value = false
  }
}

// Следим за изменением страницы
watch(currentPage, () => {
  if (ingredients.value.length > 0 || searchQuery.value) {
    fetchIngredients(false)
  }
})

// Загрузка при монтировании (если нужно обновить данные)
onMounted(() => {
  if (ingredients.value.length === 0) {
    fetchIngredients(true)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
