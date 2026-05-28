<template>
  <ConfirmModal
    :open="open"
    title="Добавить в список покупок"
    :description="`Вы уверены, что хотите добавить ${itemsCount} ингредиентов в список покупок?`"
    confirm-text="Добавить"
    confirm-color="primary"
    :loading="loading"
    @update:open="handleClose"
    @confirm="handleConfirm"
  >
    <template #description>
      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-darkMode-500">
          Вы уверены, что хотите добавить <strong>{{ itemsCount }}</strong> ингредиентов в список покупок?
        </p>
        <div class="bg-emerald-50 rounded-lg p-3 dark:bg-emerald-900/20">
          <p class="text-sm text-emerald-800 dark:text-emerald-300">
            <UIcon name="i-lucide-shopping-cart" class="h-4 w-4 inline mr-1" />
            Список покупок будет создан с именем "{{ shoppingListName }}"
          </p>
        </div>

        <!-- Предпросмотр ингредиентов (если их немного) -->
        <div v-if="showPreview" class="max-h-32 overflow-y-auto">
          <div class="text-xs text-gray-500 mb-1">Предпросмотр ингредиентов:</div>
          <ul class="text-xs text-gray-600 space-y-1">
            <li v-for="(item, idx) in previewItems" :key="idx">
              • {{ item.name }}: {{ formatQuantity(item.quantity) }} {{ item.unit }}
            </li>
            <li v-if="hasMoreItems" class="text-gray-400 italic">
              ... и еще {{ moreItemsCount }} ингредиентов
            </li>
          </ul>
        </div>
      </div>
    </template>
  </ConfirmModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue'

interface ShoppingItem {
  name: string
  quantity: number
  unit: string
}

interface Props {
  open: boolean
  items: ShoppingItem[]
  recipeTitle: string
  loading?: boolean
  maxPreviewItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxPreviewItems: 10
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const itemsCount = computed(() => props.items.length)
const shoppingListName = computed(() => `Ингредиенты для "${props.recipeTitle}"`)
const showPreview = computed(() => props.items.length <= props.maxPreviewItems + 1)
const previewItems = computed(() => props.items.slice(0, props.maxPreviewItems))
const hasMoreItems = computed(() => props.items.length > props.maxPreviewItems)
const moreItemsCount = computed(() => props.items.length - props.maxPreviewItems)

const formatQuantity = (quantity: number) => {
  return quantity.toString().replace('.', ',')
}

const handleClose = (value: boolean) => {
  if (!props.loading) {
    emit('update:open', value)
  }
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
