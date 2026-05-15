<template>
  <UModal v-model:open="isOpen" :title="isEditing ? 'Редактировать список меню' : 'Создать список меню'">
    <template #body>
      <div class="space-y-4">
        <!-- Название -->
        <UInput
          v-model="form.title"
          placeholder="Название"
          :color="errors.title ? 'error' : 'neutral'"
        />
        <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>

        <!-- Иконка (только для редактирования) -->
        <UInput
          v-if="isEditing"
          v-model="form.icon"
          placeholder="Иконка (эмодзи, например 🍕)"
          maxlength="2"
        />

        <!-- Тип отображения -->
        <div class="flex gap-2">
          <button
            v-for="type in ['days', 'calendar']"
            :key="type"
            class="flex-1 rounded-lg border p-2 text-center text-sm transition-all"
            :class="form.displayType === type
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'"
            @click="form.displayType = type"
          >
            <div class="flex items-center justify-center gap-1">
              <UIcon
                :name="type === 'days' ? 'i-lucide-calendar-days' : 'i-lucide-calendar'"
                class="h-4 w-4"
              />
              <span>{{ type === 'days' ? 'Дни' : 'Календарь' }}</span>
            </div>
          </button>
        </div>

        <!-- Предупреждение при смене типа (только для редактирования) -->
        <p
          v-if="isEditing && originalDisplayType !== form.displayType"
          class="flex items-center gap-1 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700"
        >
          <UIcon name="i-lucide-alert-triangle" class="h-3 w-3" />
          Изменение типа отображения может повлиять на существующие рецепты
        </p>

        <!-- Описание (только для редактирования) -->
        <UTextarea
          v-if="isEditing"
          v-model="form.description"
          placeholder="Описание (необязательно)"
          :rows="2"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal">Отмена</UButton>
        <UButton :loading="isSubmitting" @click="handleSubmit">
          {{ isEditing ? 'Сохранить' : 'Создать' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { MenuList, DisplayType } from '~/composables/useMenuPlannerApi'

const props = defineProps<{
  open: boolean
  list?: MenuList | null // Для редактирования передаём list, для создания - null
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'updated': []
  'created': [MenuList]
}>()

const isSubmitting = ref(false)
const originalDisplayType = ref<DisplayType>('days')

// Определяем, в каком режиме мы находимся
const isEditing = computed(() => !!props.list)

const form = reactive({
  title: '',
  icon: '',
  description: '',
  displayType: 'days' as DisplayType
})

const errors = reactive({
  title: ''
})

// Computed для v-model модального окна
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

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
  // Сбрасываем ошибки и форму
  errors.title = ''

  // Сбрасываем форму только если не в режиме редактирования
  if (!isEditing.value) {
    form.title = ''
    form.icon = ''
    form.description = ''
    form.displayType = 'days'
  }
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    const { useMenuPlannerStore } = await import('~/stores/menuPlannerStore')
    const store = useMenuPlannerStore()

    if (isEditing.value && props.list) {
      // Режим редактирования
      await store.updateMenuList(props.list.id, {
        title: form.title.trim(),
        icon: form.icon || undefined,
        description: form.description || undefined,
        displayType: form.displayType
      })
      emit('updated')
    } else {
      // Режим создания
      const newList = await store.createMenuList({
        title: form.title.trim(),
        displayType: form.displayType
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

// Заполняем форму при открытии
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.list) {
      // Режим редактирования
      form.title = props.list.title
      form.icon = props.list.icon || ''
      form.description = props.list.description || ''
      form.displayType = props.list.displayType
      originalDisplayType.value = props.list.displayType
    } else {
      // Режим создания
      form.title = ''
      form.icon = ''
      form.description = ''
      form.displayType = 'days'
    }
    errors.title = ''
  }
}, { immediate: true })
</script>
