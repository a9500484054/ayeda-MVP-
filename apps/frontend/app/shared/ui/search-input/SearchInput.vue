<template>
  <Input
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    icon="i-lucide-search"
    @update:model-value="handleInput"
    @keyup.enter="handleEnter"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template #rightIcon>
      <button
        v-if="modelValue && clearable"
        type="button"
        class="rounded-full hover:bg-gray-100 dark:hover:bg-darkMode-200"
        :class="buttonSizeClass"
        @click="clear"
      >
        <UIcon :name="iconName" :class="iconSizeClass" class="text-gray-400" />
      </button>
    </template>
  </Input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Input from '../input/Input.vue'

type InputSize = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
  modelValue: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: InputSize;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск...',
  id: 'search-input',
  disabled: false,
  clearable: true,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
  (e: 'enter', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'clear'): void;
}>()

// Размеры для кнопки очистки
const buttonSizeMap: Record<InputSize, string> = {
  xs: 'p-0.5',
  sm: 'p-1',
  md: 'p-1',
  lg: 'p-1.5'
}

// Размеры для иконки очистки
const iconSizeMap: Record<InputSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4'
}

const buttonSizeClass = computed(() => buttonSizeMap[props.size])
const iconSizeClass = computed(() => iconSizeMap[props.size])
const iconName = computed(() => 'i-lucide-x')

function handleInput(value: string) {
  emit('update:modelValue', value)
  emit('search', value)
}

function handleEnter(event: Event) {
  const target = event.target as HTMLInputElement
  emit('enter', target.value)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function clear() {
  emit('update:modelValue', '')
  emit('search', '')
  emit('clear')
}
</script>
