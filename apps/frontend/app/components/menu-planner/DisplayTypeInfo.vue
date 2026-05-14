<template>
  <div class="display-type-info rounded-xl bg-blue-50 p-4">
    <div class="flex items-start gap-3">
      <UIcon :name="icon" class="mt-0.5 h-5 w-5 text-blue-600" />
      <div class="flex-1">
        <h3 class="font-medium text-blue-800">
          {{ title }}
        </h3>
        <p class="mt-1 text-sm text-blue-700">
          {{ description }}
        </p>
        <div class="mt-2 flex flex-wrap gap-4 text-xs text-blue-600">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-info" class="h-3 w-3" />
            <span>{{ tip1 }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-grip-vertical" class="h-3 w-3" />
            <span>{{ tip2 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DisplayType } from '~/composables/useMenuPlannerApi';

const props = defineProps<{
  displayType: DisplayType;
}>();

const isDays = computed(() => props.displayType === 'days');

const icon = computed(() => isDays.value ? 'i-lucide-calendar-days' : 'i-lucide-calendar');
const title = computed(() => isDays.value ? 'Режим "Дни"' : 'Режим "Календарь"');
const description = computed(() => isDays.value
  ? 'Создавайте меню на 1-30 дней без привязки к конкретным датам. Удобно для планирования рациона на несколько дней вперед.'
  : 'Привязывайте рецепты к реальным датам. Идеально для планирования на месяц вперед с учетом конкретных дней.'
);
const tip1 = computed(() => isDays.value
  ? 'Максимум 30 дней в одном списке'
  : 'Кликните на день, чтобы добавить рецепты'
);
const tip2 = computed(() => isDays.value
  ? 'Добавляйте до 10 рецептов в один прием пищи'
  : 'До 10 рецептов на один прием пищи'
);
</script>
