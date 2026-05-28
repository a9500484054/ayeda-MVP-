<template>
  <Modal
    :open="isOpen"
    size="xl"
    @update:open="closeModal"
  >
    <div class="flex flex-col max-h-[90vh] bg-white dark:bg-darkMode-100 rounded-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">
          Предпросмотр списка покупок
        </h2>
      </div>

      <!-- Body -->
      <div class="flex-1">
        <!-- Количество ингредиентов и кнопка редактирования -->
        <div class="mb-4 flex items-center justify-between pb-3">
          <div class="text-sm text-zinc-500">
            Всего ингредиентов:
            <span class="font-semibold text-zinc-900">{{ editableIngredients.length }}</span>
          </div>

          <div class="flex items-center gap-2">
            <Button
              v-if="!isEditing"
              variant="outline"
              size="xs"
              @click="startEditing"
            >
              <UIcon name="i-lucide-pencil" class="h-3.5 w-3.5" />
              <span>Редактировать</span>
            </Button>
            <div v-else class="flex gap-2">
              <Button
                variant="ghost"
                size="xs"
                @click="cancelEditing"
              >
                Отмена
              </Button>
              <Button
                color="primary"
                size="xs"
                @click="saveEditing"
                :loading="isSaving"
              >
                <UIcon name="i-lucide-check" class="h-3.5 w-3.5" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        <!-- Список ингредиентов -->
        <div class="space-y-2">
          <!-- Режим просмотра -->
          <div v-if="!isEditing" class="space-y-2">
            <div
              v-for="ingredient in editableIngredients"
              :key="ingredient.key"
              class="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200 hover:shadow-sm dark:border-darkMode-300 dark:bg-darkMode-100"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <UIcon name="i-lucide-shopping-basket" class="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p class="font-medium text-zinc-900 dark:text-darkMode-700">
                    {{ ingredient.name }}
                  </p>
                  <p class="text-xs text-zinc-400 dark:text-darkMode-500">
                    {{ ingredient.unit || 'шт' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {{ ingredient.amount }}
                </span>
                <span class="text-sm text-zinc-500 dark:text-darkMode-500">
                  {{ ingredient.unit || 'шт' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Режим редактирования -->
          <div v-else class="space-y-3">
            <div
              v-for="(ingredient, index) in editableIngredients"
              :key="ingredient.key"
              class="group rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-emerald-200 dark:border-darkMode-300 dark:bg-darkMode-100"
            >
              <div class="flex items-center gap-3">
                <!-- Drag handle -->
                <!-- <div class="cursor-grab text-zinc-400 active:cursor-grabbing">
                  <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
                </div> -->

                <!-- Иконка -->
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <UIcon name="i-lucide-shopping-basket" class="h-4 w-4 text-emerald-600" />
                </div>

                <!-- Название -->
                <div class="flex-1">
                  <Input
                    v-model="ingredient.name"
                    size="sm"
                    class="font-medium"
                  />
                </div>

                <!-- Количество -->
                <div class="flex w-32 items-center gap-2">
                  <Input
                    v-model.number="ingredient.amount"
                    type="number"
                    size="sm"
                    step="0.1"
                    min="0"
                    class="w-20 text-center"
                  />
                  <span class="text-sm text-zinc-500 dark:text-darkMode-500">{{ ingredient.unit || 'шт' }}</span>
                </div>

                <!-- Кнопка удаления -->
                <Button
                  variant="ghost"
                  color="danger"
                  size="sm"
                  icon="i-lucide-trash-2"
                  icon-only
                  @click="removeIngredient(index)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="dark:border-darkMode-300 bg-white dark:bg-darkMode-100 mt-4">
        <div class="flex justify-end gap-3">
          <Button
            variant="ghost"
            @click="closeModal"
          >
            Отмена
          </Button>
          <Button
            color="primary"
            @click="handleConfirm"
            :loading="isCreating"
          >
            Создать список покупок
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/shared/ui/modal/Modal.vue'
import Button from '~/shared/ui/button/Button.vue'
import Input from '~/shared/ui/input/Input.vue'

const props = defineProps<{
  open: boolean
  ingredients: Array<{ id: string; name: string; amount: number; unit: string }>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [ingredients: Array<{ id: string; name: string; amount: number; unit: string }>]
}>()

const isCreating = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

// Состояние для редактируемых ингредиентов
const editableIngredients = ref<Array<{
  key: string
  id: string
  name: string
  amount: number
  unit: string
}>>([])

// Исходные ингредиенты для отмены
let originalIngredients: Array<any> = []

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      isEditing.value = false
    }
    emit('update:open', value)
  }
})

// Инициализация при открытии
watch(() => props.open, (open) => {
  if (open) {
    initIngredients()
  }
})

function initIngredients() {
  const map = new Map<string, {
    key: string
    id: string
    name: string
    amount: number
    unit: string
  }>()

  props.ingredients.forEach(ingredient => {
    let amount = 0
    if (typeof ingredient.amount === 'number') {
      amount = ingredient.amount
    } else if (typeof ingredient.amount === 'string') {
      amount = parseFloat(ingredient.amount) || 0
    }

    const key = `${ingredient.name}_${ingredient.unit}`

    if (map.has(key)) {
      const existing = map.get(key)!
      existing.amount = Number((existing.amount + amount).toFixed(2))
    } else {
      map.set(key, {
        key,
        id: ingredient.id,
        name: ingredient.name,
        amount: amount,
        unit: ingredient.unit || 'шт'
      })
    }
  })

  editableIngredients.value = Array.from(map.values())
}

function startEditing() {
  originalIngredients = JSON.parse(JSON.stringify(editableIngredients.value))
  isEditing.value = true
}

function cancelEditing() {
  editableIngredients.value = originalIngredients
  isEditing.value = false
}

async function saveEditing() {
  isSaving.value = true
  // Имитация сохранения
  await new Promise(resolve => setTimeout(resolve, 300))
  isEditing.value = false
  isSaving.value = false
}

function removeIngredient(index: number) {
  editableIngredients.value.splice(index, 1)
}

function closeModal() {
  isOpen.value = false
}

async function handleConfirm() {
  isCreating.value = true
  try {
    const finalIngredients = editableIngredients.value.map(({ key, ...rest }) => rest)
    emit('confirm', finalIngredients)
    closeModal()
  } finally {
    isCreating.value = false
  }
}
</script>
