<template>
  <Modal :open="open" @update:open="handleOpenUpdate">
    <div class="p-2">
      <!-- Заголовок -->
      <div class="flex items-center justify-between mb-6 items-start">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-darkMode-700">
            Заказать продукты у партнеров
          </h2>
          <p class="text-sm text-gray-500 dark:text-darkMode-500 mt-1">
            Выберите сервис для заказа ингредиентов из рецепта
          </p>
        </div>
        <button
          @click="close"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkMode-300 transition-colors cursor-pointer"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-500 dark:text-darkMode-400" />
        </button>
      </div>

      <!-- Список партнеров -->
      <div class="flex flex-col gap-4">
        <a
          v-for="partner in partners"
          :key="partner.id"
          :href="getPartnerUrl(partner)"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-darkMode-300 bg-white dark:bg-darkMode-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-800"
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
              class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-white dark:bg-darkMode-100 p-2"
            >
              <img
                v-if="partner.logo"
                :src="partner.logo"
                :alt="partner.name"
                class="w-full h-full object-contain"
              />
              <span v-else class="text-3xl">{{ partner.emoji }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-darkMode-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ partner.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-darkMode-500 mt-0.5">
                {{ partner.description }}
              </p>
              <!-- <div class="flex items-center gap-3 mt-2 flex-wrap">
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="partner.badgeClass">
                  {{ partner.badge }}
                </span>
                <span class="text-xs text-gray-400 dark:text-darkMode-400">
                  🕐 {{ partner.deliveryTime }}
                </span>
                <span class="text-xs text-gray-400 dark:text-darkMode-400">
                  ⭐ {{ partner.rating }}
                </span>
              </div> -->
            </div>

            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 text-gray-300 dark:text-darkMode-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2"
            />
          </div>
        </a>
      </div>

      <div class="mt-6 pt-4 border-t border-gray-100 dark:border-darkMode-300 flex items-center justify-between">
        <p class="text-xs text-gray-400 dark:text-darkMode-400">
          <UIcon name="i-lucide-shield-check" class="w-3.5 h-3.5 inline mr-1" />
          Переход на сайты партнеров безопасен
        </p>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '../../shared/ui/modal/Modal.vue'

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

// Импорт логотипов
import vkusvillLogo from '@/assets/vkusvill-sign-logo.svg'
import kuperLogo from '@/assets/kuper-logo.webp'

const partners: Partner[] = [
  {
    id: 'vkusvill',
    name: 'ВкусВилл',
    description: 'Натуральные продукты без консервантов',
    logo: vkusvillLogo,
    emoji: '🌿',
    color1: '#059669',
    color2: '#047857',
    badge: 'ЗОЖ',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    deliveryTime: '1-2 часа',
    rating: '4.9',
    url: 'https://pxl.leads.su/click/be17b9832f2d24a66ff33e2b0cd99859?erid=2W5zFGEwzdv'
  },
  {
    id: 'kupers',
    name: 'Купер',
    description: 'Почувствуй вкус праздника',
    logo: kuperLogo,
    emoji: '💰',
    color1: '#16A34A',
    color2: '#15803D',
    badge: 'Кешбэк',
    badgeClass: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    deliveryTime: '1-2 часа',
    rating: '4.8',
    url: 'https://kupers.ru'
  }
]

const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const close = () => {
  open.value = false
}

const handleOpenUpdate = (value: boolean) => {
  emit('update:open', value)
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
