<template>
  <Modal
    :open="isOpen"
    @update:open="closeModal"
    size="lg"
  >
    <div class="flex flex-col max-h-[90vh] bg-white dark:bg-darkMode-100 rounded-2xl">
      <!-- Header -->
      <div class="sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ isEditing ? 'Редактировать список меню' : 'Создать список меню' }}
          </h2>
          <Button
            @click="closeModal"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-x"
            icon-only
            class="hover:bg-white/20"
          />
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-2">
        <div class="space-y-6">
          <!-- Название и Иконка в одной строке -->
          <div class="flex items-end gap-3">
            <!-- Выбор иконки через Popover -->
            <div class="flex flex-col space-y-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Иконка</label>
              <UPopover mode="click" :content="{ align: 'start', side: 'bottom', sideOffset: 8 }">
                <button
                  type="button"
                  class="h-11 w-11 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-2xl hover:scale-105 flex-shrink-0 cursor-pointer"
                  :class="form.icon
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'"
                >
                  {{ form.icon || '😊' }}
                </button>

                <template #content>
                  <div class="p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg">
                    <div class="grid grid-cols-4 gap-2">
                      <button
                        v-for="emoji in emojiList"
                        :key="emoji"
                        type="button"
                        class="h-10 w-10 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 flex items-center justify-center text-xl hover:scale-110 cursor-pointer"
                        :class="form.icon === emoji && 'bg-emerald-100 dark:bg-emerald-900/50 ring-2 ring-emerald-500'"
                        @click="selectEmoji(emoji)"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <!-- Поле ввода названия -->
            <div class="flex-1 flex flex-col space-y-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Название
                <span class="text-red-500">*</span>
              </label>
              <Input
                v-model="form.title"
                placeholder="Например: Обеденное меню"
                :error="errors.title"
              />
            </div>
          </div>

          <!-- Тип отображения -->
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Тип отображения</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in displayTypeOptions"
                :key="type.value"
                :disabled="type.disabled"
                class="rounded-xl border-2 p-2.5 text-center transition-all duration-200 cursor-pointer"
                :class="[
                  form.displayType === type.value
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-zinc-800/50',
                  type.disabled
                    ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:border-gray-200 dark:hover:border-zinc-700 filter grayscale'
                    : 'hover:scale-[0.98]'
                ]"
                @click="!type.disabled && onDisplayTypeChange(type.value)"
              >
                <div class="flex flex-col items-center gap-1">
                  <UIcon :name="type.icon" class="h-5 w-5" />
                  <span class="text-sm font-medium">{{ type.label }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Шаблоны дней (только для создания и только для DAYS) -->
          <div v-if="!isEditing && form.displayType === 'days'" class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Шаблон дней</label>
            <div class="flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="preset in dayPresets"
                :key="preset.days"
                type="button"
                class="rounded-lg border px-2.5 py-1.5 text-center text-sm transition-all duration-200 hover:scale-[0.98] whitespace-nowrap flex-shrink-0 cursor-pointer"
                :class="selectedPreset === preset.days
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-zinc-800/50'"
                @click="selectPreset(preset.days)"
              >
                <div class="font-medium">{{ preset.label }}</div>
              </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Будет создано {{ selectedPreset }} {{ getDaysWord(selectedPreset) }}
            </p>
          </div>

          <!-- Предупреждение при смене типа (только для редактирования) -->
          <div
            v-if="isEditing && originalDisplayType !== form.displayType"
            class="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
          >
            <UIcon name="i-lucide-alert-triangle" class="h-4 w-4 flex-shrink-0" />
            <span>Изменение типа отображения может повлиять на существующие рецепты</span>
          </div>

          <!-- Описание -->
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Описание (необязательно)</label>
            <Textarea
              v-model="form.description"
              placeholder="Краткое описание меню..."
              :rows="3"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 z-10 dark:border-darkMode-300 bg-white dark:bg-darkMode-100">
        <div class="flex justify-end gap-3">
          <Button
            variant="ghost"
            size="md"
            @click="closeModal"
          >
            Отмена
          </Button>
          <Button
            :loading="isSubmitting"
            variant="solid"
            color="primary"
            size="md"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Сохранить изменения' : 'Создать меню' }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { MenuList, DisplayType } from '~/composables/useMenuPlannerApi'
import Modal from '~/shared/ui/modal/Modal.vue'
import Button from '~/shared/ui/button/Button.vue'
import Input from '~/shared/ui/input/Input.vue'
import Textarea from '~/shared/ui/textarea/Textarea.vue'

const props = defineProps<{
  open: boolean
  list?: MenuList | null
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'updated': []
  'created': [MenuList]
}>()

const isSubmitting = ref(false)
const originalDisplayType = ref<DisplayType>('days')
const selectedPreset = ref(7)

// Статичный список популярных эмодзи
const emojiList = [
  '🍕', '🍔', '🥗', '🍣', '🍜', '🥘', '🍝', '🍛',
  '🥩', '🐟', '🥑', '🍳', '🥐', '🍰', '🍦', '☕',
  '🍷', '🥂', '📅', '⭐', '❤️', '🎯', '📋', '✨'
]

const dayPresets = [
  { days: 1, label: '1 день' },
  { days: 3, label: '3 дня' },
  { days: 7, label: 'Неделя' },
  { days: 14, label: '2 недели' },
  { days: 30, label: 'Месяц' },
]

const isEditing = computed(() => !!props.list)

const displayTypeOptions = [
  { value: 'days', label: 'Дни', icon: 'i-lucide-calendar-days', disabled: false },
  { value: 'calendar', label: 'Календарь', icon: 'i-lucide-calendar', disabled: true },
  { value: 'banquet', label: 'Банкет', icon: 'i-lucide-utensils', disabled: true },
]

const form = reactive({
  title: '',
  icon: '',
  description: '',
  displayType: 'days' as DisplayType,
})

const errors = reactive({
  title: '',
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

function selectEmoji(emoji: string) {
  form.icon = emoji
}

function onDisplayTypeChange(type: DisplayType) {
  form.displayType = type
}

function selectPreset(days: number) {
  selectedPreset.value = days
}

function getDaysWord(days: number): string {
  if (days === 1) return 'день'
  if (days >= 2 && days <= 4) return 'дня'
  return 'дней'
}

const validate = (): boolean => {
  errors.title = ''

  if (!form.title.trim()) {
    errors.title = 'Обязательное поле'
    return false
  }

  if (form.title.length > 100) {
    errors.title = 'Название не должно превышать 100 символов'
    return false
  }

  return true
}

const closeModal = () => {
  isOpen.value = false
  errors.title = ''

  if (!isEditing.value) {
    form.title = ''
    form.icon = ''
    form.description = ''
    form.displayType = 'days'
    selectedPreset.value = 7
  }
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    const { useMenuPlannerStore } = await import('~/stores/menuPlannerStore')
    const store = useMenuPlannerStore()

    if (isEditing.value && props.list) {
      await store.updateMenuList(props.list.id, {
        title: form.title.trim(),
        icon: form.icon || undefined,
        description: form.description || undefined,
        displayType: form.displayType,
      })
      emit('updated')
    } else {
      const newList = await store.createMenuList({
        title: form.title.trim(),
        icon: form.icon || undefined,
        displayType: form.displayType,
        presetDays: form.displayType === 'days' ? selectedPreset.value : undefined,
      })
      emit('created', newList)
    }

    closeModal()
  } catch (error) {
    console.error(`Failed to ${isEditing.value ? 'update' : 'create'} menu list:`, error)
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.list) {
      form.title = props.list.title
      form.icon = props.list.icon || ''
      form.description = props.list.description || ''
      form.displayType = props.list.displayType
      originalDisplayType.value = props.list.displayType
    } else {
      form.title = ''
      form.icon = ''
      form.description = ''
      form.displayType = 'days'
      selectedPreset.value = 7
    }
    errors.title = ''
  }
}, { immediate: true })
</script>
