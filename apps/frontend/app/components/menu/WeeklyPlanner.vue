<script setup lang="ts">
import { useMenuPlannerStore } from "~/stores/menuPlannerStore";

const store = useMenuPlannerStore();
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const meals = [
  { key: "breakfast", label: "Завтрак" },
  { key: "lunch", label: "Обед" },
  { key: "dinner", label: "Ужин" },
] as const;
</script>

<template>
  <div class="overflow-x-auto">
    <div class="grid min-w-[860px] grid-cols-[120px_repeat(7,1fr)] gap-2">
      <div />
      <div v-for="day in days" :key="day" class="font-bold">{{ day }}</div>
      <template v-for="meal in meals" :key="meal.key">
        <div class="py-4 font-semibold">{{ meal.label }}</div>
        <button
          v-for="day in days"
          :key="`${meal.key}-${day}`"
          class="panel min-h-24 p-3 text-left text-sm"
          type="button"
          @click="store.addSlot('1', day, meal.key)"
        >
          <span class="text-gray-500">Добавить рецепт</span>
        </button>
      </template>
    </div>
  </div>
</template>
