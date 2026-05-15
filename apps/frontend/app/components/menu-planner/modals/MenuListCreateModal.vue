<template>
  <UModal v-model:open="isOpen" title="Создать список меню">
    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="title"
          placeholder="Название"
          :color="titleError ? 'error' : 'neutral'"
        />
        <p v-if="titleError" class="text-xs text-red-500">{{ titleError }}</p>

        <div class="flex gap-2">
          <button
            v-for="type in ['days', 'calendar']"
            :key="type"
            class="flex-1 rounded-lg border p-2 text-center text-sm"
            :class="displayType === type ? 'border-green-500 bg-green-50' : ''"
            @click="displayType = type"
          >
            {{ type === 'days' ? 'Дни' : 'Календарь' }}
          </button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal">Отмена</UButton>
        <UButton :loading="loading" @click="handleSubmit">Создать</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const title = ref('')
const displayType = ref<'days' | 'calendar'>('days')
const loading = ref(false)
const titleError = ref('')

const closeModal = () => {
  isOpen.value = false
  title.value = ''
  titleError.value = ''
}

const handleSubmit = async () => {
  if (!title.value.trim()) {
    titleError.value = 'Обязательное поле'
    return
  }

  loading.value = true
  // Your submit logic here
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
  closeModal()
}
</script>
