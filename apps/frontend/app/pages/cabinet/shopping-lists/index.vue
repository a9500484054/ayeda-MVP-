<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <ShoppingListsHeader @create="openCreateModal" />

    <!-- Loading -->
    <div v-if="store.isLoading && store.lists.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      <p class="mt-4 text-sm text-gray-500">Загрузка...</p>
    </div>

    <!-- Список списков -->
    <ShoppingListsGrid
      v-else-if="store.lists.length > 0"
      :lists="store.lists"
      @reorder="handleReorder"
      @rename="openRenameModal"
      @share="openShareModal"
      @copy="handleCopyList"
      @delete="openDeleteModal"
    />

    <!-- Пустое состояние -->
    <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
      <UIcon name="i-lucide-shopping-cart" class="h-12 w-12 text-gray-300" />
      <p class="mt-3 text-gray-500">Нет списков покупок</p>
      <p class="text-sm text-gray-400">Создайте свой первый список</p>
    </div>

    <!-- Модалки -->
    <CreateListModal
      v-model:open="isCreateModalOpen"
      @created="handleCreateList"
    />

    <RenameListModal
      v-model:open="isRenameModalOpen"
      :list="selectedList"
      @renamed="handleRenameList"
    />

    <ShareListModal
      v-model:open="isShareModalOpen"
      :list="selectedList"
      @generate="handleGenerateShareToken"
      @revoke="handleRevokeShareToken"
    />

    <DeleteConfirmationModal
      :open="isDeleteModalOpen"
      title="Удалить список?"
      @update:open="isDeleteModalOpen = $event"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { useShoppingListsStore } from '~/stores/shoppingListsStore';
import type { ShoppingList } from '~/shared/types/shopping.types';
import ShoppingListsHeader from '~/components/shopping/lists/ShoppingListsHeader.vue';
import ShoppingListsGrid from '~/components/shopping/lists/ShoppingListsGrid.vue';
import CreateListModal from '~/components/shopping/lists/CreateListModal.vue';
import RenameListModal from '~/components/shopping/lists/RenameListModal.vue';
import ShareListModal from '~/components/shopping/lists/ShareListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';

definePageMeta({ layout: 'cabinet' });

const store = useShoppingListsStore();
const router = useRouter();
const toast = useToast();

// Состояния модалок
const isCreateModalOpen = ref(false);
const isRenameModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedList = ref<ShoppingList | null>(null);

// Загрузка данных
onMounted(() => {
  store.fetchLists();
});

// Drag & Drop сортировка
async function handleReorder(dragIndex: number, dropIndex: number) {
  const items = [...store.lists];
  const [removed] = items.splice(dragIndex, 1);
  items.splice(dropIndex, 0, removed);

  const reorderData = items.map((item, idx) => ({
    id: item.id,
    sortOrder: idx * 1000,
  }));

  await store.reorderLists(reorderData);
}

// Создание списка
function openCreateModal() {
  isCreateModalOpen.value = true;
}

async function handleCreateList(title: string) {
  const newList = await store.createList(title);
  router.push(`/cabinet/shopping-lists/${newList.id}`);
}

// Переименование
function openRenameModal(list: ShoppingList) {
  selectedList.value = list;
  isRenameModalOpen.value = true;
}

async function handleRenameList(id: string, title: string) {
  await store.updateList(id, { title });
  isRenameModalOpen.value = false;
  selectedList.value = null;
}

// Копирование
async function handleCopyList(list: ShoppingList) {
  const copied = await store.copyList(list.id);
  toast.add({
    title: 'Успех',
    description: `Список "${copied.title}" скопирован`,
    color: 'success',
  });
}

// Шаринг
function openShareModal(list: ShoppingList) {
  selectedList.value = list;
  isShareModalOpen.value = true;

  if (!list.shareToken) {
    handleGenerateShareToken(list.id);
  }
}

async function handleGenerateShareToken(id: string) {
  const token = await store.generateShareToken(id);
  if (selectedList.value && selectedList.value.id === id) {
    selectedList.value.shareToken = token;
  }
}

async function handleRevokeShareToken(id: string) {
  await store.revokeShareToken(id);
  if (selectedList.value && selectedList.value.id === id) {
    selectedList.value.shareToken = null;
  }
}

// Удаление
function openDeleteModal(list: ShoppingList) {
  selectedList.value = list;
  isDeleteModalOpen.value = true;
}

async function handleConfirmDelete() {
  if (selectedList.value) {
    await store.deleteList(selectedList.value.id);
    isDeleteModalOpen.value = false;
    selectedList.value = null;
  }
}
</script>
