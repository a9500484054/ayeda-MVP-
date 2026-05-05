<script setup lang="ts">
import type { ShoppingListDto } from "~/shared/types/domain";
import { useShoppingList } from "~/composables/useShoppingList";

definePageMeta({ layout: "cabinet" });

const list = ref<ShoppingListDto>({
  id: "demo",
  title: "Покупки на неделю",
  archived: false,
  items: [
    { id: "1", ingredientId: "curd", name: "Творог", categoryName: "Молочные продукты", unit: "г", amount: 360, checked: false },
    { id: "2", ingredientId: "rice", name: "Рис", categoryName: "Бакалея", unit: "г", amount: 180, checked: true },
  ],
});

const { groupedItems } = useShoppingList(list);
</script>

<template>
  <section class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-black">Списки покупок</h1>
      <button class="btn-primary" type="button">Добавить позицию</button>
    </div>
    <ShoppingListGroup v-for="group in groupedItems" :key="group.categoryName" :title="group.categoryName" :items="group.items" />
  </section>
</template>
