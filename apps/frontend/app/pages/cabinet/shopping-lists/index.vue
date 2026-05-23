<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
    <ShoppingListsHeader @create="openCreateModal" />

    <!-- Loading -->
    <div v-if="store.isLoading && store.lists.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
      <p class="mt-4 text-sm text-gray-500">Загрузка...</p>
    </div>

    <!-- Список списков -->
    <ShoppingListsGrid
      v-else-if="store.lists.length > 0"
      :lists="store.lists"
      @reorder="handleReorder"
      @navigate="handleNavigate"
      @rename="openRenameModal"
      @share="openShareModal"
      @copy="handleCopyList"
      @delete="openDeleteModal"
    />

    <!-- Пустое состояние -->
    <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg">
        <UIcon name="i-lucide-shopping-basket" class="h-8 w-8 text-white" />
      </div>
      <p class="mt-3 text-gray-500">Нет списков покупок</p>
      <p class="text-sm text-gray-400">Создайте свой первый список</p>
    </div>

    <!-- Модалка подтверждения удаления -->
    <DeleteConfirmationModal
      :open="isDeleteModalOpen"
      title="Удалить список?"
      @update:open="isDeleteModalOpen = $event"
      @confirm="handleConfirmDelete"
    />

    <!-- Объединенная модалка для создания/редактирования -->
    <ListFormModal
      v-model:open="isFormModalOpen"
      :list="selectedList"
      @submit="handleListSubmit"
      @delete="handleDeleteFromModal"
    />

    <!-- Модалка шаринга -->
    <ShareListModal
      v-model:open="isShareModalOpen"
      :list="selectedList"
      @generate="handleGenerateShareToken"
      @revoke="handleRevokeShareToken"
    />
  </div>
</template>

<script setup lang="ts">
import { useShoppingListsStore } from '~/stores/shoppingListsStore';
import type { ShoppingList } from '~/shared/types/shopping.types';
import ShoppingListsHeader from '~/components/shopping/lists/ShoppingListsHeader.vue';
import ShoppingListsGrid from '~/components/shopping/lists/ShoppingListsGrid.vue';
import ListFormModal from '~/components/shopping/lists/ListFormModal.vue';
import ShareListModal from '~/components/shopping/lists/ShareListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';

definePageMeta({ layout: 'cabinet' });

const router = useRouter();
const store = useShoppingListsStore();
const toast = useToast();

// Состояния модалок
const isFormModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedList = ref<ShoppingList | null>(null);

// Загрузка данных
onMounted(() => {
  store.fetchLists();
});

// Навигация
function handleNavigate(listId: string) {
  router.push(`/cabinet/shopping-lists/${listId}`);
}

// Drag & Drop сортировка с обновлением sortOrder
async function handleReorder(dragIndex: number, dropIndex: number) {
  const items = [...store.lists];
  const [removed] = items.splice(dragIndex, 1);
  items.splice(dropIndex, 0, removed);

  // Обновляем sortOrder для всех списков
  const reorderData = items.map((item, idx) => ({
    id: item.id,
    sortOrder: idx * 1000, // Используем множитель для возможности вставки между
  }));

  // Отправляем запросы на обновление sortOrder
  try {
    await Promise.all(
      reorderData.map(async (item) => {
        await store.updateListSortOrder(item.id, item.sortOrder);
      })
    );

    // Обновляем локальный порядок
    await store.fetchLists();

    toast.add({
      title: 'Успех',
      description: 'Порядок списков сохранен',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to reorder lists:', error);
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось сохранить порядок списков',
      color: 'error',
    });
  }
}

// Создание списка
function openCreateModal() {
  selectedList.value = null;
  isFormModalOpen.value = true;
}

// Редактирование списка
function openRenameModal(list: ShoppingList) {
  selectedList.value = list;
  isFormModalOpen.value = true;
}

// Открытие модалки удаления
function openDeleteModal(list: ShoppingList) {
  selectedList.value = list;
  isDeleteModalOpen.value = true;
}

// Подтверждение удаления
async function handleConfirmDelete() {
  if (selectedList.value) {
    await store.deleteList(selectedList.value.id);
    isDeleteModalOpen.value = false;
    toast.add({
      title: 'Успех',
      description: `Список "${selectedList.value.title}" удален`,
      color: 'success',
    });
    selectedList.value = null;
  }
}

// Удаление из модалки редактирования
async function handleDeleteFromModal(id: string) {
  await store.deleteList(id);
  isFormModalOpen.value = false;
  selectedList.value = null;
  toast.add({
    title: 'Успех',
    description: 'Список удален',
    color: 'success',
  });
}

// Обработчик отправки формы (создание/редактирование)
async function handleListSubmit(title: string) {
  if (selectedList.value) {
    // Редактирование
    await store.updateList(selectedList.value.id, { title });
    toast.add({
      title: 'Успех',
      description: 'Список переименован',
      color: 'success',
    });
  } else {
    // Создание с sortOrder
    const maxSortOrder = Math.max(...store.lists.map(l => l.sortOrder || 0), 0);
    const newList = await store.createList(title, maxSortOrder + 1000);
    router.push(`/cabinet/shopping-lists/${newList.id}`);
  }
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
</script>
