<script setup lang="ts">
import type { ShoppingListItemDto } from "~/shared/types/domain";

const props = defineProps<{
  title: string;
  items: ShoppingListItemDto[];
}>();
</script>

<template>
  <section class="panel p-4">
    <h3 class="font-bold">{{ props.title }}</h3>
    <label v-for="item in props.items" :key="item.id" class="mt-3 flex items-center gap-3">
      <input :checked="item.checked" type="checkbox" class="size-4">
      <span>{{ item.name }} - {{ item.amount }} {{ item.unit }}</span>
    </label>
  </section>
</template>
