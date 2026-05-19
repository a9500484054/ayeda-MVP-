<template>
  <UDropdownMenu :items="menuItems" :ui="{ content: 'w-56' }">
    <Button variant="ghost" color="white" size="sm" class="!p-1.5">
      <UIcon name="i-lucide-more-vertical" class="h-5 w-5" />
    </Button>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';

const props = defineProps<{
  filterType: 'all' | 'checked' | 'unchecked';
  sortBy: 'name' | 'category' | 'status' | 'order';
  hasCheckedItems: boolean;
}>();

const emit = defineEmits<{
  uncheckAll: [];
  delete: [];
  print: [];
  share: [];
  filterChange: [type: 'all' | 'checked' | 'unchecked'];
  sortChange: [by: 'name' | 'category' | 'status' | 'order'];
}>();

const filterLabel = computed(() => {
  switch (props.filterType) {
    case 'all': return 'Все';
    case 'checked': return 'Купленные';
    case 'unchecked': return 'Не купленные';
    default: return 'Все';
  }
});

const sortLabel = computed(() => {
  switch (props.sortBy) {
    case 'name': return 'По названию';
    case 'category': return 'По категории';
    case 'status': return 'По статусу';
    case 'order': return 'По порядку';
    default: return 'По порядку';
  }
});

const menuItems = computed(() => [
  [
    {
      label: 'Снять отметки',
      icon: 'i-lucide-check-square',
      onSelect: () => emit('uncheckAll'),
      disabled: !props.hasCheckedItems,
    },
    {
      label: 'Удалить список',
      icon: 'i-lucide-trash-2',
      class: 'text-red-600',
      iconClass: 'text-red-600',
      onSelect: () => emit('delete'),
    },
  ],
  [
    {
      label: 'Распечатать / PDF',
      icon: 'i-lucide-printer',
      onSelect: () => emit('print'),
    },
    {
      label: 'Поделиться',
      icon: 'i-lucide-share-2',
      onSelect: () => emit('share'),
    },
  ],
  [
    {
      label: `Фильтр: ${filterLabel.value}`,
      icon: 'i-lucide-filter',
      children: [
        { label: 'Все', onSelect: () => emit('filterChange', 'all') },
        { label: 'Не купленные', onSelect: () => emit('filterChange', 'unchecked') },
        { label: 'Купленные', onSelect: () => emit('filterChange', 'checked') },
      ],
    },
    {
      label: `Сортировка: ${sortLabel.value}`,
      icon: 'i-lucide-arrow-up-down',
      children: [
        { label: 'По порядку', onSelect: () => emit('sortChange', 'order') },
        { label: 'По названию', onSelect: () => emit('sortChange', 'name') },
        { label: 'По категории', onSelect: () => emit('sortChange', 'category') },
        { label: 'По статусу', onSelect: () => emit('sortChange', 'status') },
      ],
    },
  ],
]);
</script>
