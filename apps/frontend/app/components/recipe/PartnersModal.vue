<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-4xl w-full' }">
    <template #content>
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">Заказать продукты у партнеров</h2>
            <p class="text-sm text-gray-500 mt-1">
              Выберите сервис для заказа ингредиентов из рецепта
            </p>
          </div>
          <button
            @click="close"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Список партнеров -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            v-for="partner in partners"
            :key="partner.id"
            :href="getPartnerUrl(partner)"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200"
          >
            <!-- Градиентный фон -->
            <div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <div
                class="w-full h-full"
                :style="{
                  background: `linear-gradient(135deg, ${partner.color1}, ${partner.color2})`
                }"
              />
            </div>

            <div class="relative flex items-start gap-4">
              <!-- Логотип -->
              <div
                class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-white"
              >
                <img
                  v-if="partner.logo"
                  :src="partner.logo"
                  :alt="partner.name"
                  class="w-10 h-10 object-contain"
                />
                <span v-else class="text-3xl">{{ partner.emoji }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {{ partner.name }}
                </h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ partner.description }}
                </p>
                <div class="flex items-center gap-3 mt-2 flex-wrap">
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="partner.badgeClass">
                    {{ partner.badge }}
                  </span>
                  <span class="text-xs text-gray-400">
                    🕐 {{ partner.deliveryTime }}
                  </span>
                  <span class="text-xs text-gray-400">
                    ⭐ {{ partner.rating }}
                  </span>
                </div>
              </div>

              <UIcon
                name="i-lucide-arrow-right"
                class="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2"
              />
            </div>
          </a>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-xs text-gray-400">
            <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5 inline mr-1" />
            Переход на сайты партнеров безопасен
          </p>
          <button
            @click="close"
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Partner {
  id: string
  name: string
  description: string
  emoji: string
  logo?: string
  color1: string
  color2: string
  badge: string
  badgeClass: string
  deliveryTime: string
  rating: string
  url: string
}

const props = defineProps<{
  open: boolean
  recipeTitle?: string
  ingredients?: Array<{ name: string; quantity: number; unit: string }>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const partners: Partner[] = [
  {
    id: 'sbermarket',
    name: 'СберМаркет',
    description: 'Доставка продуктов из любимых магазинов',
    emoji: '🛒',
    color1: '#4CAF50',
    color2: '#2E7D32',
    badge: 'Популярный',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    deliveryTime: '1-2 часа',
    rating: '4.8',
    url: 'https://sbermarket.ru'
  },
  {
    id: 'yandex',
    name: 'Яндекс Лавка',
    description: 'Продукты с доставкой за 15 минут',
    emoji: '📦',
    color1: '#FC3F1D',
    color2: '#D92B0E',
    badge: 'Экспресс',
    badgeClass: 'bg-orange-50 text-orange-700',
    deliveryTime: '15-30 мин',
    rating: '4.9',
    url: 'https://lavka.yandex.ru'
  },
  {
    id: 'ozon',
    name: 'Ozon Fresh',
    description: 'Свежие продукты с доставкой на дом',
    emoji: '🛍️',
    color1: '#005BFF',
    color2: '#003DCC',
    badge: 'Акции',
    badgeClass: 'bg-blue-50 text-blue-700',
    deliveryTime: '1-3 часа',
    rating: '4.7',
    url: 'https://ozon.ru'
  },
  {
    id: 'perekrestok',
    name: 'Перекресток',
    description: 'Продукты от проверенных поставщиков',
    emoji: '🏪',
    color1: '#E31E24',
    color2: '#B8161A',
    badge: 'Выбор редакции',
    badgeClass: 'bg-red-50 text-red-700',
    deliveryTime: '2-4 часа',
    rating: '4.6',
    url: 'https://perekrestok.ru'
  },
  {
    id: 'samokat',
    name: 'Самокат',
    description: 'Быстрая доставка продуктов 24/7',
    emoji: '🛵',
    color1: '#FF6B00',
    color2: '#E55A00',
    badge: 'Круглосуточно',
    badgeClass: 'bg-amber-50 text-amber-700',
    deliveryTime: '15-60 мин',
    rating: '4.8',
    url: 'https://samokat.ru'
  },
  {
    id: 'vkusvill',
    name: 'ВкусВилл',
    description: 'Натуральные продукты без консервантов',
    emoji: '🌿',
    color1: '#2D8F4E',
    color2: '#1A6B35',
    badge: 'ЗОЖ',
    badgeClass: 'bg-green-50 text-green-700',
    deliveryTime: '1-2 часа',
    rating: '4.9',
    url: 'https://pxl.leads.su/click/be17b9832f2d24a66ff33e2b0cd99859?erid=2W5zFGEwzdv'
  }
]

const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const close = () => {
  open.value = false
}

const getPartnerUrl = (partner: Partner): string => {
  const baseUrl = partner.url
  if (props.ingredients?.length) {
    const searchQuery = props.ingredients
      .slice(0, 5)
      .map(i => i.name)
      .join(' ')
    return `${baseUrl}/search?q=${encodeURIComponent(searchQuery)}`
  }
  return baseUrl
}
</script>
