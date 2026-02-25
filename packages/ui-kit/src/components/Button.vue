<template>
  <button
    class="ayeda-button"
    :class="[`ayeda-button--${variant}`, `ayeda-button--${size}`]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<style scoped>
.ayeda-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.ayeda-button--primary {
  background-color: #3b82f6;
  color: white;
}

.ayeda-button--primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.ayeda-button--secondary {
  background-color: #6b7280;
  color: white;
}

.ayeda-button--secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.ayeda-button--outline {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: transparent;
}

.ayeda-button--outline:hover:not(:disabled) {
  background-color: #eff6ff;
}

.ayeda-button--ghost {
  color: #3b82f6;
  background-color: transparent;
}

.ayeda-button--ghost:hover:not(:disabled) {
  background-color: #eff6ff;
}

.ayeda-button--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.ayeda-button--md {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.ayeda-button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.ayeda-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
