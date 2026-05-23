<!-- components/ui/SearchInput.vue -->
<template>
  <div class="relative">
    <UIcon
      name="i-lucide-search"
      class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors"
      :class="{ 'text-primary-500': modelValue }"
    />
    <input
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      class="h-8 w-full rounded-lg border border-gray-200 pl-9 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-sm placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500 dark:focus:ring-primary-900/20"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      autocomplete="off"
      @input="handleInput"
      @keyup.enter="handleEnter"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <button
      v-if="modelValue && clearable"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-darkMode-200"
      @click="clear"
    >
      <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  clearable?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
  (e: 'enter', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск...',
  id: 'search-input',
  disabled: false,
  clearable: true,
});

const emit = defineEmits<Emits>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit('update:modelValue', value);
  emit('search', value);
}

function handleEnter(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('enter', target.value);
}

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function clear() {
  emit('update:modelValue', '');
  emit('search', '');
  emit('clear');
}
</script>

<style scoped>
input {
  transition: all 0.2s ease;
}

input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

input:not(:placeholder-shown) {
  background-color: transparent;
}
</style>
