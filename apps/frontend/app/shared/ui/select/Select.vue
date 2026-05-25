<!-- В шаблон Select.vue добавим отображение множественного выбора -->
<template>
  <div class="group">
    <label v-if="label" class="mb-1.5 block text-sm font-medium" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <Input
        :model-value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :error="error"
        :readonly="true"
        @click="toggleDropdown"
      >
        <template #rightIcon>
          <UIcon
            name="i-lucide-chevron-down"
            class="h-4 w-4 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </template>
      </Input>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div
          v-if="isOpen && !disabled"
          class="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-darkMode-300 dark:bg-darkMode-100"
        >
          <div class="max-h-60 overflow-y-auto p-1">
            <slot name="header" />

            <slot name="options" :options="options" :isSelected="isSelected" :selectOption="selectOption">
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-darkMode-200"
                :class="{
                  'bg-emerald-50 dark:bg-emerald-900/20': isSelected(option.value)
                }"
                @click="() => selectOption(option)"
              >
                <div class="flex items-center gap-2">
                  <div
                    v-if="multiple"
                    class="w-4 h-4 rounded border flex items-center justify-center"
                    :class="isSelected(option.value)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-300'"
                  >
                    <UIcon v-if="isSelected(option.value)" name="i-lucide-check" class="h-3 w-3" />
                  </div>
                  <span class="text-gray-700 dark:text-darkMode-600">{{ option.label }}</span>
                </div>
                <UIcon
                  v-if="!multiple && isSelected(option.value)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-emerald-600"
                />
              </button>
            </slot>

            <slot name="footer" />

            <div
              v-if="options.length === 0 && !$slots.empty"
              class="px-3 py-3 text-center text-sm text-gray-400"
            >
              Нет данных
            </div>
            <div v-else-if="options.length === 0 && $slots.empty">
              <slot name="empty" />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import Input from '../input/Input.vue'

export interface SelectOption {
  value: string | number
  label: string
  [key: string]: any
}

interface Props {
  modelValue: string | number | null | string[] | number[]
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Выберите...',
  required: false,
  disabled: false,
  multiple: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | string[] | number[]]
  'change': [value: string | number | null | string[] | number[]]
}>()

const isOpen = ref(false)

// Вычисляем отображаемое значение
const displayValue = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const selectedLabels = props.modelValue
      .map(val => props.options.find(opt => opt.value === val)?.label)
      .filter(Boolean)
    if (selectedLabels.length === 0) return ''
    if (selectedLabels.length === 1) return selectedLabels[0]
    return `${selectedLabels[0]} +${selectedLabels.length - 1}`
  }

  if (!props.multiple && props.modelValue !== null && props.modelValue !== undefined) {
    const selected = props.options.find(opt => opt.value === props.modelValue)
    return selected?.label || ''
  }

  return ''
})

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

const isSelected = (value: string | number) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value)
  }
  return props.modelValue === value
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: SelectOption) => {
  if (props.disabled) return

  let newValue: string | number | null | string[] | number[]

  if (props.multiple) {
    const currentValue = (Array.isArray(props.modelValue) ? props.modelValue : []) as (string | number)[]
    if (currentValue.includes(option.value)) {
      newValue = currentValue.filter(v => v !== option.value)
    } else {
      newValue = [...currentValue, option.value]
    }
  } else {
    newValue = option.value === props.modelValue ? null : option.value
    isOpen.value = false
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

// Close on escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})

defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false },
  toggle: toggleDropdown
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
