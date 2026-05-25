<template>
  <USlideover
    :open="open"
    :ui="slideoverUi"
    @update:open="handleClose"
  >
    <template #content>
      <div class="flex flex-col max-h-[100vh] bg-gray-50 dark:bg-darkMode-100">
        <!-- Header -->
        <div v-if="$slots.header || title" class="sticky top-0 z-20" :class="headerClass">
          <div class="flex items-center justify-between px-6 py-4">
            <h2 class="text-xl font-semibold" :class="titleClass">
              <slot name="title">{{ title }}</slot>
            </h2>
            <Button
              @click="handleClose"
              variant="ghost"
              :color="closeButtonColor"
              size="sm"
              icon="i-lucide-x"
              icon-only
              :class="closeButtonClass"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto">
          <slot name="body">
            <div class="p-6">
              <slot />
            </div>
          </slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="sticky bottom-0 z-10 border-t border-gray-200 dark:border-darkMode-300 bg-white dark:bg-darkMode-100 px-6 py-4">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from '../button/Button.vue'

interface Props {
  open: boolean
  title?: string
  closeOnOverlay?: boolean
  // Стилизация
  headerClass?: string
  titleClass?: string
  closeButtonColor?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral' | 'white'
  closeButtonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  closeOnOverlay: true,
  headerClass: 'bg-gradient-to-br from-emerald-700 to-teal-800',
  titleClass: 'text-white',
  closeButtonColor: 'neutral',
  closeButtonClass: 'bg-white hover:bg-white/20 text-gray-700 hover:text-gray-900'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const slideoverUi = computed(() => ({
  content: 'max-w-2xl w-full overflow-y-auto',
  overlay: 'bg-black/80 backdrop-blur-sm',
  base: 'relative',
  container: 'relative'
}))

const handleClose = () => {
  if (props.closeOnOverlay) {
    emit('update:open', false)
  }
}
</script>
