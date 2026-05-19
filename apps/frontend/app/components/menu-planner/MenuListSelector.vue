<template>
  <div class="menu-list-selector">
    <!-- Заголовок -->
    <div class="mb-3 flex items-center justify-between">
      <label class="text-sm font-medium text-zinc-700">Список меню</label>
    </div>

    <!-- Список карточек -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="list in sortedLists"
        :key="list.id"
        class="menu-list-card group relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all cursor-pointer"
        :class="[
          isActive(list.id)
            ? 'bg-green-50 border border-green-200 shadow-sm'
            : 'bg-white border border-transparent hover:border-zinc-200 hover:bg-zinc-50/50'
        ]"
        @click="emit('select', list.id)"
      >
        <!-- Иконка -->
        <span class="text-xl">
          {{ list.icon || (list.displayType === 'calendar' ? '📅' : '📋') }}
        </span>

        <!-- Название -->
        <span class="font-medium text-zinc-800">
          {{ list.title }}
        </span>

        <!-- Тип (бейдж) -->
        <span
          class="text-xs px-1.5 py-0.5 rounded-full"
          :class="list.displayType === 'calendar'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'"
        >
          {{ list.displayType === 'calendar' ? 'Календарь' : 'Дни' }}
        </span>

        <!-- Кнопка меню (редактировать/удалить) -->
        <button
          class="absolute -top-2 -right-2 hidden rounded-full bg-white p-1 shadow-md transition-all group-hover:flex cursor-pointer"
          @click.stop="openMenu($event, list)"
        >
          <UIcon name="i-lucide-more-vertical" class="h-3.5 w-3.5 text-zinc-500" />
        </button>
      </button>

      <!-- Кнопка "Создать" если нет списков -->
      <button
        v-if="lists.length === 0"
        class="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-transparent px-4 py-2.5 text-zinc-500 transition-all hover:border-zinc-400 hover:text-zinc-700"
        @click="emit('create')"
      >
        <UIcon name="i-lucide-plus" class="h-4 w-4" />
        <span>Создать первый список</span>
      </button>
    </div>

    <!-- Контекстное меню -->
    <div
      v-if="contextMenu.visible"
      ref="contextMenuRef"
      class="fixed z-50 min-w-[160px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <button
        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer"
        @click="handleEdit"
      >
        <UIcon name="i-lucide-pencil" class="h-4 w-4" />
        Редактировать
      </button>
      <button
        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
        @click="handleDelete"
      >
        <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { MenuList } from '~/composables/useMenuPlannerApi';

const props = defineProps<{
  lists: MenuList[];
  activeId: string | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  edit: [list: MenuList];
  delete: [list: MenuList];
  create: [];
}>();

// Сортировка списков: старые в начале, новые в конце
const sortedLists = computed(() => {
  return [...props.lists].sort((a, b) => {
    // Если есть поле createdAt, сортируем по дате создания
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    // Если нет createdAt, но есть updatedAt
    if (a.updatedAt && b.updatedAt) {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }

    // Если есть поле order (порядок)
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }

    // Fallback: сортируем по ID (предполагая, что ID генерируются в порядке возрастания)
    if (a.id && b.id) {
      return a.id.localeCompare(b.id);
    }

    return 0;
  });
});

// Context menu state
const contextMenu = ref<{
  visible: boolean;
  x: number;
  y: number;
  list: MenuList | null;
}>({
  visible: false,
  x: 0,
  y: 0,
  list: null,
});

const contextMenuRef = ref<HTMLElement | null>(null);

function isActive(id: string): boolean {
  return props.activeId === id;
}

function openMenu(event: MouseEvent, list: MenuList) {
  event.preventDefault();
  event.stopPropagation();

  // Корректируем позицию, чтобы меню не выходило за пределы экрана
  let x = event.clientX;
  let y = event.clientY;

  if (x + 160 > window.innerWidth) {
    x = window.innerWidth - 160 - 10;
  }

  if (y + 100 > window.innerHeight) {
    y = window.innerHeight - 100 - 10;
  }

  contextMenu.value = {
    visible: true,
    x,
    y,
    list,
  };
}

function handleEdit() {
  if (contextMenu.value.list) {
    emit('edit', contextMenu.value.list);
  }
  closeMenu();
}

function handleDelete() {
  if (contextMenu.value.list) {
    emit('delete', contextMenu.value.list);
  }
  closeMenu();
}

function closeMenu() {
  contextMenu.value = {
    visible: false,
    x: 0,
    y: 0,
    list: null,
  };
}

// Закрыть меню при клике вне
function handleClickOutside(event: MouseEvent) {
  if (contextMenu.value.visible && contextMenuRef.value) {
    if (!contextMenuRef.value.contains(event.target as Node)) {
      closeMenu();
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.menu-list-card {
  transition: all 0.2s ease;
}

.menu-list-card:hover {
  transform: translateY(-1px);
}
</style>
