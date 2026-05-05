<script setup lang="ts">
import { useMenuPlannerStore } from "~/stores/menuPlannerStore";

const store = useMenuPlannerStore();
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-for="list in store.menuLists"
      :key="list.id"
      class="btn-secondary"
      :class="{ 'border-green-700 text-green-800': store.activeMenuListId === list.id }"
      type="button"
      @click="store.activeMenuListId = list.id"
    >
      {{ list.title }}
    </button>
    <button class="btn-primary" type="button" @click="store.addMenuList('Новое меню')">
      Добавить меню
    </button>
  </div>
</template>
