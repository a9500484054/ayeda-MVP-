<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Хлебные крошки -->
    <nav class="flex items-center gap-2 text-sm text-zinc-500 mb-6">
      <NuxtLink to="/" class="hover:text-zinc-900 transition-colors">
        Главная
      </NuxtLink>
      <span>/</span>
      <NuxtLink to="/ingredients" class="hover:text-zinc-900 transition-colors">
        Ингредиенты
      </NuxtLink>
      <span>/</span>
      <span class="text-zinc-900 font-medium" v-if="ingredient">
        {{ ingredient.name }}
      </span>
    </nav>

    <!-- Состояние загрузки -->
    <div v-if="pending && !ingredient" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-zinc-500">Загрузка ингредиента...</p>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="fetchError || !ingredient" class="text-center py-20">
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto" />
      <h2 class="text-2xl font-bold mt-4">Ингредиент не найден</h2>
      <p class="text-zinc-500 mt-2">{{ fetchError?.message || 'Ингредиент не найден' }}</p>
      <UButton to="/ingredients" class="mt-6" color="primary">
        Вернуться к списку
      </UButton>
    </div>

    <!-- Контент -->
    <div v-else-if="ingredient" class="space-y-8">
      <!-- Заголовок с фото -->
      <div class="flex flex-col md:flex-row items-start gap-6">
        <!-- Фото -->
        <div class="flex-shrink-0 w-full md:w-48">
          <div v-if="ingredient.photo" class="w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
            <img
              :src="getImageUrl(ingredient.photo)"
              :alt="ingredient.name"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="(e) => (e.target as HTMLImageElement).src = '/images/ingredient-placeholder.jpg'"
            />
          </div>
          <div v-else class="w-full aspect-square rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <UIcon name="i-lucide-package" class="w-24 h-24 text-emerald-600/40" />
          </div>
        </div>

        <div class="flex-1">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold">{{ ingredient.name }}</h1>
              <p class="text-sm text-zinc-500 mt-1 font-mono">Код: {{ ingredient.code }}</p>
              <p class="text-xs text-zinc-400 mt-0.5 font-mono">Путь: {{ ingredient.srcPath }}</p>
            </div>
            <UBadge color="primary" variant="soft" class="text-sm px-3 py-1 whitespace-nowrap">
              {{ ingredient.unit.name }}
            </UBadge>
          </div>

          <!-- Описание -->
          <p v-if="ingredient.description" class="mt-4 text-zinc-600 text-lg leading-relaxed">
            {{ ingredient.description }}
          </p>

          <!-- Единица измерения -->
          <div class="mt-3 flex items-center gap-2 text-sm text-zinc-500">
            <span>Единица измерения:</span>
            <UBadge :class="getUnitTypeColor(ingredient.unit.type)" variant="subtle">
              {{ ingredient.unit.name }}
              <span class="ml-1 text-xs opacity-70">({{ ingredient.unit.short || ingredient.unit.code }})</span>
            </UBadge>
            <span class="text-xs opacity-60">• {{ getUnitTypeLabel(ingredient.unit.type) }}</span>
          </div>
        </div>
      </div>

      <!-- Пищевая ценность -->
      <UCard>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-semibold">Пищевая ценность</h2>
            <p class="text-sm text-zinc-500">На 100 г / 100 мл продукта</p>
          </div>
          <UBadge color="primary" variant="soft">
            {{ ingredient.unit.short || ingredient.unit.code }}
          </UBadge>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div class="bg-zinc-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-emerald-600">
              {{ formatNutrition(ingredient.nutritionInfo?.calories) }}
            </div>
            <div class="text-sm text-zinc-500">ккал</div>
          </div>

          <div class="bg-zinc-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-500">
              {{ formatNutrition(ingredient.nutritionInfo?.proteins) }}
            </div>
            <div class="text-sm text-zinc-500">Белки (г)</div>
          </div>

          <div class="bg-zinc-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-500">
              {{ formatNutrition(ingredient.nutritionInfo?.fats) }}
            </div>
            <div class="text-sm text-zinc-500">Жиры (г)</div>
          </div>

          <div class="bg-zinc-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-500">
              {{ formatNutrition(ingredient.nutritionInfo?.carbohydrates) }}
            </div>
            <div class="text-sm text-zinc-500">Углеводы (г)</div>
          </div>
        </div>

        <!-- Дополнительные поля -->
        <div v-if="ingredient.nutritionInfo?.fiber || ingredient.nutritionInfo?.sugar" class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div v-if="ingredient.nutritionInfo?.fiber" class="flex justify-between">
            <span class="text-zinc-500">Клетчатка</span>
            <span class="font-medium">{{ formatNutrition(ingredient.nutritionInfo.fiber) }} г</span>
          </div>
          <div v-if="ingredient.nutritionInfo?.sugar" class="flex justify-between">
            <span class="text-zinc-500">Сахар</span>
            <span class="font-medium">{{ formatNutrition(ingredient.nutritionInfo.sugar) }} г</span>
          </div>
        </div>
      </UCard>

      <!-- SEO информация -->
      <UCard v-if="ingredient.seo?.title || ingredient.seo?.description">
        <h2 class="text-lg font-semibold mb-4">SEO информация</h2>
        <div class="space-y-3">
          <div v-if="ingredient.seo?.title">
            <div class="text-sm text-zinc-500">Заголовок</div>
            <div class="font-medium">{{ ingredient.seo.title }}</div>
          </div>
          <div v-if="ingredient.seo?.description">
            <div class="text-sm text-zinc-500">Описание</div>
            <div class="font-medium">{{ ingredient.seo.description }}</div>
          </div>
          <div v-if="ingredient.seo?.keywords?.length">
            <div class="text-sm text-zinc-500">Ключевые слова</div>
            <div class="flex flex-wrap gap-2 mt-1">
              <UBadge
                v-for="keyword in ingredient.seo.keywords"
                :key="keyword"
                color="neutral"
                variant="soft"
                size="sm"
              >
                {{ keyword }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Мета информация -->
      <div class="text-sm text-zinc-500 border-t pt-4">
        <div class="flex flex-wrap gap-4">
          <span>Создан: {{ formatDate(ingredient.createdAt) }}</span>
          <span>Обновлен: {{ formatDate(ingredient.updatedAt) }}</span>
        </div>
      </div>

      <!-- Похожие ингредиенты -->
      <div v-if="similarIngredients.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Похожие ингредиенты</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <NuxtLink
            v-for="item in similarIngredients"
            :key="item.id"
            :to="`/ingredients/${item.srcPath}`"
            class="group bg-white border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                <img
                  v-if="item.photo"
                  :src="getImageUrl(item.photo)"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-lucide-package" class="w-6 h-6 text-zinc-400" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold truncate group-hover:text-emerald-600 transition-colors">
                  {{ item.name }}
                </h3>
                <p class="text-xs text-zinc-400 font-mono">{{ item.code }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-zinc-500">{{ item.unit.name }}</span>
                  <span v-if="item.nutritionInfo?.calories" class="text-xs text-emerald-600 font-medium">
                    {{ item.nutritionInfo.calories }} ккал
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '#app'

definePageMeta({ layout: 'cabinet' })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// Получаем параметр srcPath из маршрута
const srcPath = computed(() => route.params.srcPath as string)

// Состояние
const similarIngredients = ref<any[]>([])

// Функция для получения полного URL изображения
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${config.public.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

// ============ SSR DATA FETCHING ============
const { data: ingredientData, pending, error: fetchError } = await useAsyncData(
  `ingredient-${srcPath.value}`,
  async () => {
    console.log('🚀 useAsyncData started for ingredient:', srcPath.value)

    if (!srcPath.value) {
      console.error('❌ No srcPath provided')
      throw new Error('Путь ингредиента не указан')
    }

    const apiBase = config.public.apiBase || 'http://localhost:3001'
    const url = `${apiBase}/ingredients/by-path/${srcPath.value}`
    console.log('📡 Request URL:', url)

    try {
      console.log('🌐 Fetching ingredient...')
      const response = await $fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('✅ Response received:', response)
      console.log('📦 Ingredient ID:', response?.id)
      console.log('📦 Ingredient srcPath:', response?.srcPath)

      if (!response?.id) {
        console.error('❌ Ingredient has no id')
        throw new Error('Ингредиент не найден')
      }

      return response
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      console.error('❌ Error status:', err.status)
      console.error('❌ Error message:', err.message)
      throw err
    }
  },
  {
    server: true,
    lazy: false,
    immediate: true,
  }
)

console.log('📊 useAsyncData result:', {
  hasData: !!ingredientData.value,
  pending: pending.value,
  hasError: !!fetchError.value,
  errorMessage: fetchError.value?.message
})

const ingredient = computed(() => ingredientData.value)

// Если есть ошибка, показываем её в консоли
if (fetchError.value) {
  console.error('🚨 Fetch error in component:', fetchError.value)
}

// ============ SEO ============
// Устанавливаем SEO мета-теги на основе данных ингредиента
if (ingredient.value) {
  const seoTitle = ingredient.value.seo?.title || ingredient.value.name
  const seoDescription = ingredient.value.seo?.description ||
    `Ингредиент ${ingredient.value.name} - состав, калорийность, полезные свойства. ${ingredient.value.description || ''}`
  const seoKeywords = ingredient.value.seo?.keywords || [
    ingredient.value.name,
    ingredient.value.code,
    'ингредиент',
    'состав',
    'калорийность'
  ]

  useHead({
    title: `${seoTitle} | АуЕда - Ингредиенты`,
    meta: [
      { name: 'description', content: seoDescription, key: 'description' },
      { name: 'keywords', content: seoKeywords.join(', '), key: 'keywords' },
      { property: 'og:title', content: `${seoTitle} | АуЕда`, key: 'og:title' },
      { property: 'og:description', content: seoDescription, key: 'og:description' },
      { property: 'og:type', content: 'article', key: 'og:type' },
      { property: 'og:image', content: getImageUrl(ingredient.value.photo) || 'https://ayeda.ru/images/ingredient-placeholder.jpg', key: 'og:image' },
      { property: 'og:image:alt', content: ingredient.value.name, key: 'og:image:alt' },
      { property: 'og:url', content: `https://ayeda.ru/ingredients/${ingredient.value.srcPath}`, key: 'og:url' },
      { property: 'og:site_name', content: 'АуЕда', key: 'og:site_name' },
      { name: 'twitter:card', content: 'summary_large_image', key: 'twitter:card' },
      { name: 'twitter:title', content: `${seoTitle} | АуЕда`, key: 'twitter:title' },
      { name: 'twitter:description', content: seoDescription, key: 'twitter:description' },
      { name: 'twitter:image', content: getImageUrl(ingredient.value.photo) || 'https://ayeda.ru/images/ingredient-placeholder.jpg', key: 'twitter:image' },
    ],
    link: [
      { rel: 'canonical', href: `https://ayeda.ru/ingredients/${ingredient.value.srcPath}`, key: 'canonical' },
      { rel: 'alternate', hreflang: 'ru', href: `https://ayeda.ru/ingredients/${ingredient.value.srcPath}` },
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': ingredient.value.name,
          'description': ingredient.value.description || `${ingredient.value.name} — продукт для кулинарии`,
          'image': getImageUrl(ingredient.value.photo) || undefined,
          'sku': ingredient.value.code,
          'nutrition': {
            '@type': 'NutritionInformation',
            'calories': ingredient.value.nutritionInfo?.calories ? `${ingredient.value.nutritionInfo.calories} kcal` : undefined,
            'proteinContent': ingredient.value.nutritionInfo?.proteins ? `${ingredient.value.nutritionInfo.proteins} g` : undefined,
            'fatContent': ingredient.value.nutritionInfo?.fats ? `${ingredient.value.nutritionInfo.fats} g` : undefined,
            'carbohydrateContent': ingredient.value.nutritionInfo?.carbohydrates ? `${ingredient.value.nutritionInfo.carbohydrates} g` : undefined,
          }
        })
      }
    ]
  })
}

// ============ ЗАГРУЗКА ПОХОЖИХ ИНГРЕДИЕНТОВ (КЛИЕНТ) ============
const loadSimilarIngredients = async () => {
  if (!ingredient.value) return

  try {
    const apiBase = config.public.apiBase || 'http://localhost:3001'
    const query = encodeURIComponent(ingredient.value.name.split(' ')[0])
    const url = `${apiBase}/ingredients/search?q=${query}&page=1&limit=5`

    console.log('📡 Fetching similar ingredients:', url)

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    similarIngredients.value = (response.data || []).filter(
      (item: any) => item.id !== ingredient.value?.id
    )
  } catch (e) {
    console.warn('Could not load similar ingredients:', e)
    similarIngredients.value = []
  }
}

// Загрузка похожих ингредиентов на клиенте
onMounted(() => {
  if (process.client && ingredient.value) {
    loadSimilarIngredients()
  }
})

// ============ ХЕЛПЕРЫ ============
// Форматирование числовых значений
const formatNutrition = (value: number | undefined): string => {
  if (value === undefined || value === null) return '—'
  return value.toFixed(1)
}

// Форматирование даты
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Получение цвета для категории единицы измерения
const getUnitTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    mass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    volume: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    piece: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
  }
  return colors[type] || colors.other
}

const getUnitTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    mass: 'Вес',
    volume: 'Объем',
    piece: 'Количество',
    other: 'Другое'
  }
  return labels[type] || type
}
</script>

<style scoped>
/* Анимации для карточек */
.group {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover {
  transform: translateY(-4px);
}
</style>
