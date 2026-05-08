<template>
  <div class="space-y-2">
    <label class="text-sm font-medium">Ключевые слова</label>

    <!-- Контейнер с тегами -->
    <div class="min-h-[40px] p-2 border border-gray-200 dark:border-gray-800 rounded-lg focus-within:border-gray-400 dark:focus-within:border-gray-600 transition-colors">
      <div class="flex flex-wrap gap-2">
        <!-- Существующие теги -->
        <span
          v-for="(keyword, idx) in localKeywords"
          :key="idx"
          class="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md"
        >
          {{ keyword }}
          <button
            type="button"
            @click="removeKeyword(idx)"
            class="hover:text-red-500 transition-colors"
          >
            <UIcon name="i-lucide-x" class="w-3 h-3" />
          </button>
        </span>

        <!-- Поле ввода -->
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          placeholder="Введите слово и нажмите Enter"
          class="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
          @keydown.enter.prevent="addKeyword"
          @keydown.comma.prevent="addKeyword"
          @blur="addKeyword"
        />
      </div>
    </div>

    <!-- <div class="text-xs text-gray-400">
      Введите слово и нажмите Enter или запятую для добавления
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const localKeywords = ref<string[]>([...props.modelValue])
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

// Синхронизация с родителем
watch(() => props.modelValue, (newVal) => {
  localKeywords.value = [...newVal]
}, { deep: true })

watch(localKeywords, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const addKeyword = () => {
  const keyword = inputValue.value.trim().toLowerCase()

  if (keyword && !localKeywords.value.includes(keyword)) {
    localKeywords.value.push(keyword)
  }

  inputValue.value = ''
}

const removeKeyword = (index: number) => {
  localKeywords.value.splice(index, 1)
}

// Фокус на поле ввода при клике на контейнер
const focusInput = () => {
  inputRef.value?.focus()
}
</script>

<style scoped>
.min-h-\[40px\] {
  min-height: 40px;
}
</style>
