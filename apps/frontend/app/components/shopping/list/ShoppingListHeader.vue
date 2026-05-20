<template>
  <div class="mb-8">
    <!-- Верхняя панель с названием -->
    <div class="flex flex-col gap-4">
      <!-- Левая часть: название и статистика -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-3">
          <!-- Иконка -->
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
            <UIcon name="i-lucide-shopping-basket" class="h-6 w-6 text-white" />
          </div>

          <!-- Название с inline-редактированием -->
          <div class="min-w-0 flex-1">
            <div v-if="!isEditing" class="group flex items-center gap-2">
              <h1
                class="cursor-text text-2xl font-bold tracking-tight text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400 truncate max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px]"
                @click="startEditing"
              >
                {{ title }}
              </h1>
              <button
                class="rounded-full p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-darkMode-100"
                @click="startEditing"
              >
                <UIcon name="i-lucide-pencil" class="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div v-else class="flex items-center gap-2">
              <UInput
                ref="inputRef"
                v-model="editTitle"
                class="flex-1"
                :ui="{
                  input: 'text-2xl font-bold border-0 border-b-2 rounded-none px-0 focus:ring-0 focus:border-primary-500'
                }"
                @keyup.enter="saveTitle"
                @keyup.esc="cancelEditing"
                @blur="saveTitle"
              />
              <div class="flex items-center gap-1">
                <button
                  class="rounded-full p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  @click="saveTitle"
                >
                  <UIcon name="i-lucide-check" class="h-4 w-4" />
                </button>
                <button
                  class="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-darkMode-100"
                  @click="cancelEditing"
                >
                  <UIcon name="i-lucide-x" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Статистика -->
            <div class="mt-1.5 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1.5">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-darkMode-100">
                  <UIcon name="i-lucide-package" class="h-3.5 w-3.5" />
                </div>
                <span class="font-medium">{{ totalCount }} {{ getCountText(totalCount) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <UIcon name="i-lucide-check-circle" class="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <span class="font-medium">{{ checkedCount }} куплено</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Отдельная строка: поиск и кнопки действий -->
    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <!-- Поиск -->
      <div class="flex-1">
        <div class="relative">
          <UIcon
            name="i-lucide-search"
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <UInput
            v-model="searchValue"
            placeholder="Поиск по списку..."
            class="w-full"
            size="md"
            :ui="{
              input: 'pl-9 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-primary-400/20 dark:bg-darkMode-100 dark:border-darkMode-300'
            }"
          />
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex items-center gap-2">
        <!-- Кнопка поделиться -->
        <UTooltip text="Поделиться">
          <UButton
            variant="ghost"
            size="md"
            class="!rounded-xl !px-3 !py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-darkMode-100 dark:text-darkMode-700 dark:hover:bg-darkMode-200"
            @click="emit('share')"
          >
            <UIcon name="i-lucide-share-2" class="h-4 w-4" />
            <!-- <span class="ml-1.5 hidden sm:inline">Поделиться</span> -->
          </UButton>
        </UTooltip>

        <!-- Меню действий -->
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

    <!-- Прогресс-бар -->
    <div class="mt-6">
      <div class="mb-2 flex items-center justify-between text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Общий прогресс</span>
        <span class="font-semibold text-primary-600 dark:text-primary-400">
          {{ Math.round(progress) }}%
        </span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-darkMode-200">
        <div
          class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';
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

function getCountText(count: number): string {
  if (count === 0) return 'позиций';
  if (count === 1) return 'позиция';
  if (count >= 2 && count <= 4) return 'позиции';
  return 'позиций';
}

function startEditing() {
  editTitle.value = props.title;
  isEditing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
}

async function saveTitle() {
  const newTitle = editTitle.value.trim();
  if (newTitle && newTitle !== props.title) {
    emit('rename', newTitle);
  }
  isEditing.value = false;
}

function cancelEditing() {
  editTitle.value = props.title;
  isEditing.value = false;
}

function handleFilterChange(type: 'all' | 'checked' | 'unchecked') {
  emit('filterChange', type);
}

function handleSortChange(by: 'name' | 'category' | 'status' | 'order') {
  emit('sortChange', by);
}

watch(() => props.title, (newTitle) => {
  editTitle.value = newTitle;
});
</script>
