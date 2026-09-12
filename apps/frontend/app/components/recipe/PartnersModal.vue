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

      <!-- Блок «Собрать корзину через ИИ» -->
      <div
        v-if="ingredients?.length"
        class="mb-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
              Собрать корзину автоматически
            </h3>
            <p class="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              Скопируйте готовый промпт и вставьте его в ИИ-помощник с подключённым MCP ВкусВилл
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <Button
                size="xs"
                color="primary"
                @click="handleCopyPrompt"
              >
                <UIcon name="i-lucide-copy" class="w-3.5 h-3.5" />
                Скопировать промпт
              </Button>
              <Button
                size="xs"
                variant="outline"
                color="primary"
                @click="showPreview = !showPreview"
              >
                <UIcon
                  :name="showPreview ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="w-3.5 h-3.5"
                />
                {{ showPreview ? 'Скрыть' : 'Показать текст' }}
              </Button>
            </div>

            <pre
              v-if="showPreview"
              class="mt-3 max-h-40 overflow-auto rounded-lg bg-white/70 dark:bg-darkMode-200 p-3 text-[11px] leading-relaxed text-zinc-700 dark:text-darkMode-600 whitespace-pre-wrap break-words"
            >{{ promptPreview }}</pre>
          </div>
        </div>
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
          <div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <div
              class="w-full h-full"
              :style="{
                background: `linear-gradient(135deg, ${partner.color1}, ${partner.color2})`
              }"
            />
          </div>

          <div class="relative flex items-start gap-4">
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
import { computed, ref } from 'vue'
import Modal from '../../shared/ui/modal/Modal.vue'
import Button from '~/shared/ui/button/Button.vue'
import { useVkusvillApi } from '~/composables/useVkusvillApi'

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

const { buildVkusvillPrompt, copyVkusvillPrompt } = useVkusvillApi()

const showPreview = ref(false)

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
    url: 'https://pxl.leads.su/click/4ded2db87a248be57cc2a9a706190a19?erid=2W5zFJ7XyZr'
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

const promptPreview = computed(() => {
  if (!props.ingredients?.length) return ''
  return buildVkusvillPrompt(props.ingredients, 4.7)
})

const handleCopyPrompt = async () => {
  if (!props.ingredients?.length) return
  await copyVkusvillPrompt(props.ingredients, { minRating: 4.7 })
}
</script>
