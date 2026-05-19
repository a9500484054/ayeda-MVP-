<template>
  <div
    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
    :class="bgColorClass"
  >
    <UIcon :name="iconName" class="h-4 w-4" :class="iconColorClass" />
  </div>
</template>

<script setup lang="ts">
import type { ShoppingCategory } from '~/shared/types/shopping.types';

const props = defineProps<{
  category: ShoppingCategory | null;
}>();

const categoryColors: Record<string, { bg: string; icon: string }> = {
  vegetables: { bg: 'bg-green-100', icon: 'text-green-600' },
  fruits: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  meat: { bg: 'bg-red-100', icon: 'text-red-600' },
  fish: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  dairy: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  eggs: { bg: 'bg-amber-100', icon: 'text-amber-600' },
  bakery: { bg: 'bg-stone-100', icon: 'text-stone-600' },
  grocery: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  beverages: { bg: 'bg-cyan-100', icon: 'text-cyan-600' },
  sauces: { bg: 'bg-rose-100', icon: 'text-rose-600' },
  frozen: { bg: 'bg-sky-100', icon: 'text-sky-600' },
  ready_meals: { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
  household: { bg: 'bg-gray-100', icon: 'text-gray-600' },
  other: { bg: 'bg-gray-100', icon: 'text-gray-500' },
};

const defaultColors = { bg: 'bg-gray-100', icon: 'text-gray-500' };

const colors = computed(() => {
  if (!props.category) return defaultColors;
  return categoryColors[props.category.code] || defaultColors;
});

const bgColorClass = computed(() => colors.value.bg);
const iconColorClass = computed(() => colors.value.icon);
const iconName = computed(() => {
  if (!props.category) return 'i-lucide-package';
  return `i-lucide-${props.category.icon}`;
});
</script>
