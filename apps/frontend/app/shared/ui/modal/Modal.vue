<template>
  <UModal
    :open="open"
    :ui="{
      overlay: 'bg-black/50 backdrop-blur-sm',
      container: 'flex items-center justify-center p-4',
      content: 'bg-white rounded-xl shadow-xl max-w-md w-full dark:bg-darkMode-100'
    }"
    @update:open="handleClose"
  >
    <template #content>
      <div class="p-6">
        <slot />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const handleClose = (value: boolean) => {
  if (!value && props.closeOnOverlay) {
    emit('update:open', false)
  }
}
</script>
