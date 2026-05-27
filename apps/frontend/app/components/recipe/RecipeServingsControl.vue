<template>
  <NumberStepper
    :model-value="modelValue"
    :min="1"
    :max="20"
    unit="порций"
    :editable="false"
    @update:model-value="$emit('update:modelValue', $event)"
    full-width
  />
</template>

<script setup lang="ts">
import NumberStepper from '~/shared/ui/number-stepper/NumberStepper.vue'

interface Props {
  modelValue: number
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
