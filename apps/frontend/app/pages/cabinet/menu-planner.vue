<script setup lang="ts">
import { useMenuPlannerStore } from "~/stores/menuPlannerStore";

definePageMeta({ layout: "cabinet" });
const store = useMenuPlannerStore();
</script>

<template>
  <section class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-black">Планировщик меню</h1>
      <button class="btn-primary" type="button">Создать список покупок</button>
    </div>
    <MenuListSelector />
    <WeeklyPlanner />
    <div class="panel p-4">
      <h2 class="font-bold">Добавленные слоты</h2>
      <p class="mt-2 text-gray-700">{{ store.slots.length }} рецептов в текущем плане</p>
    </div>
  </section>
</template>
