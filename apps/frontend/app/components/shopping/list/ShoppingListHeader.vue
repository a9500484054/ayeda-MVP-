<template>
  <div class="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-4 dark:border-darkMode-400">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {{ title }}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          class="!p-1"
          @click="isEditing = true"
        >
          <UIcon name="i-lucide-pencil" class="h-4 w-4" />
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <UInput
          v-model="searchValue"
          placeholder="Поиск..."
          icon="i-lucide-search"
          class="w-48 sm:w-64"
          size="sm"
        />

        <Button
          variant="ghost"
          color="white"
          size="sm"
          @click="emit('share')"
        >
          <UIcon name="i-lucide-share-2" class="h-4 w-4" />
          <span class="hidden sm:inline ml-1">Поделиться</span>
        </Button>

        <ShoppingListHeaderMenu
          :filter-type="filterType"
          :sort-by="sortBy"
          :has-checked-items="hasCheckedItems"
          @uncheck-all="emit('uncheckAll')"
          @delete="emit('delete')"
          @print="emit('print')"
          @share="emit('share')"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange"
        />
      </div>
    </div>

    <!-- Режим редактирования названия -->
    <div v-if="isEditing" class="flex items-center gap-2">
      <UInput
        ref="inputRef"
        v-model="editTitle"
        class="flex-1 max-w-md"
        @keyup.enter="saveTitle"
        @keyup.esc="cancelEdit"
      />
      <Button size="sm" color="primary" @click="saveTitle">
        Сохранить
      </Button>
      <Button size="sm" variant="ghost" @click="cancelEdit">
        Отмена
      </Button>
    </div>

    <!-- Прогресс -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <span>{{ checkedCount }}/{{ totalCount }} куплено</span>
      <span>{{ Math.round(progress) }}%</span>
    </div>
    <ProgressBar :progress="progress" />
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';
import ProgressBar from './shared/ProgressBar.vue';
import ShoppingListHeaderMenu from './ShoppingListHeaderMenu.vue';

const props = defineProps<{
  title: string;
  totalCount: number;
  checkedCount: number;
  progress: number;
  filterType: 'all' | 'checked' | 'unchecked';
  sortBy: 'name' | 'category' | 'status' | 'order';
  searchQuery: string;
}>();

const emit = defineEmits<{
  rename: [newTitle: string];
  share: [];
  delete: [];
  print: [];
  uncheckAll: [];
  filterChange: [type: 'all' | 'checked' | 'unchecked'];
  sortChange: [by: 'name' | 'category' | 'status' | 'order'];
  searchChange: [query: string];
}>();

const isEditing = ref(false);
const editTitle = ref(props.title);
const inputRef = ref<HTMLInputElement | null>(null);

const searchValue = computed({
  get: () => props.searchQuery,
  set: (value) => emit('searchChange', value),
});

const hasCheckedItems = computed(() => props.checkedCount > 0);

function handleFilterChange(type: 'all' | 'checked' | 'unchecked') {
  emit('filterChange', type);
}

function handleSortChange(by: 'name' | 'category' | 'status' | 'order') {
  emit('sortChange', by);
}

async function saveTitle() {
  if (editTitle.value.trim() && editTitle.value.trim() !== props.title) {
    emit('rename', editTitle.value.trim());
  }
  isEditing.value = false;
}

function cancelEdit() {
  editTitle.value = props.title;
  isEditing.value = false;
}

watch(() => props.title, (newTitle) => {
  editTitle.value = newTitle;
});

watch(isEditing, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});
</script>
