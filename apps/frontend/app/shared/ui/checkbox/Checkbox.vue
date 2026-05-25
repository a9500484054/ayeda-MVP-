<template>
  <label class="inline-flex cursor-pointer items-start group">
    <div class="relative flex items-center">
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
      />
      <div
        class="h-5 w-5 rounded border transition-all duration-200"
        :class="[
          modelValue
            ? 'bg-emerald-600 border-emerald-600'
            : 'border-gray-300 bg-white dark:border-darkMode-300 dark:bg-darkMode-100',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer peer-hover:border-emerald-400',
          error ? 'border-red-500' : ''
        ]"
      >
        <UIcon
          v-if="modelValue"
          name="i-lucide-check"
          class="h-4 w-4 text-white absolute left-0.5 top-0.5"
        />
      </div>
    </div>

    <div v-if="$slots.default || label" class="ml-3">
      <span
        class="text-sm"
        :class="[
          disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300',
          error ? 'text-red-600' : ''
        ]"
      >
        <slot>{{ label }}</slot>
      </span>
      <p v-if="hint" class="text-xs text-gray-400 mt-0.5">{{ hint }}</p>
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  error: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [value: boolean]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!props.disabled) {
    emit('update:modelValue', target.checked)
    emit('change', target.checked)
  }
}
</script>
