<!-- apps/frontend/components/cabinet/recipes/RecipeFormMedia.vue -->
<template>
  <div class="rounded-2xl border p-5 space-y-4">
    <h3 class="text-lg font-medium">Обложка рецепта</h3>

    <UFormField label="Фото">
      <div class="space-y-3">
        <UButton
          block
          @click="mainFileInput?.click()"
          color="neutral"
          variant="outline"
          :loading="isUploading"
        >
          Загрузить фото
        </UButton>

        <input
          ref="mainFileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="emit('upload', $event)"
        />

        <div v-if="photo?.src" class="rounded-xl overflow-hidden border max-h-48 max-w-sm mx-auto">
          <img :src="`${API_BASE_URL}${photo.src}`" class="w-full h-auto object-cover" />
        </div>
      </div>
    </UFormField>
  </div>
</template>

<script setup lang="ts">
const API_BASE_URL = 'http://localhost:3001'

const props = defineProps<{
  photo: { id: string; src: string }
  isUploading: boolean
}>()

const emit = defineEmits<{
  upload: [event: Event]
}>()

const mainFileInput = ref<HTMLInputElement>()
</script>
