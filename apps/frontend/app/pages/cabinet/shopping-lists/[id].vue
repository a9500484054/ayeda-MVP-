<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
    <!-- Loading -->
    <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      <p class="mt-4 text-sm text-gray-500">Загрузка...</p>
    </div>

    <template v-else-if="store.currentList">
      <UCard>
        <!-- Хедер -->
        <ShoppingListHeader
          :title="store.currentList.title"
          :total-count="store.totalItemsCount"
          :checked-count="store.checkedItemsCount"
          :progress="store.progressPercentage"
          :filter-type="filterType"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @rename="handleRename"
          @share="openShareModal"
          @delete="openDeleteModal"
          @print="handlePrint"
          @uncheck-all="handleUncheckAll"
          @filter-change="filterType = $event"
          @sort-change="sortBy = $event"
          @search-change="searchQuery = $event"
        />

        <!-- Список позиций -->
        <ShoppingListItems
          :items="store.currentItems"
          :filter-type="filterType"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @edit-item="openItemModal"
          @delete-item="handleDeleteItem"
          @toggle-item="handleToggleItem"
        />
      </UCard>

      <!-- Блок добавления -->
      <AddItemBlock
        :popular-items="popularItems"
        @quick-add="handleQuickAdd"
        @add-popular="handleAddPopular"
      />
    </template>

    <!-- Модалки -->
    <ShoppingListItemModal
      v-model:open="isItemModalOpen"
      :item="editingItem"
      :categories="categories"
      @save="handleSaveItem"
      @delete="handleDeleteItemFromModal"
    />

    <ShareListModal
      v-model:open="isShareModalOpen"
      :list="store.currentList"
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
import type { ShoppingListItem, ShoppingCategory } from '~/shared/types/shopping.types';
import ShoppingListHeader from '~/components/shopping/list/ShoppingListHeader.vue';
import ShoppingListItems from '~/components/shopping/list/ShoppingListItems.vue';
import AddItemBlock from '~/components/shopping/list/AddItemBlock.vue';
import ShoppingListItemModal from '~/components/shopping/list/ShoppingListItemModal.vue';
import ShareListModal from '~/components/shopping/lists/ShareListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';
import { useShoppingListPrint } from '~/composables/useShoppingListPrint';
import { useApi } from "~/composables/useApi";

definePageMeta({ layout: 'cabinet' });

const route = useRoute();
const router = useRouter();
const store = useShoppingListsStore();
const { print } = useShoppingListPrint();
const toast = useToast();

const listId = computed(() => route.params.id as string);

// Состояние фильтрации и сортировки
const filterType = ref<'all' | 'checked' | 'unchecked'>('all');
const sortBy = ref<'name' | 'category' | 'status' | 'order'>('order');
const searchQuery = ref('');

// Состояние модалок
const isItemModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingItem = ref<ShoppingListItem | null>(null);

// Категории для выбора
const categories = ref<ShoppingCategory[]>([]);

// Популярные ингредиенты (можно расширить позже)
const popularItems = ref([
  { name: 'Молоко', unit: 'л' },
  { name: 'Хлеб', unit: 'шт' },
  { name: 'Яйца', unit: 'шт' },
  { name: 'Масло сливочное', unit: 'г' },
  { name: 'Сыр', unit: 'г' },
  { name: 'Помидоры', unit: 'кг' },
  { name: 'Огурцы', unit: 'кг' },
  { name: 'Курица', unit: 'кг' },
]);

// Загрузка данных
async function loadCategories() {
  try {
    const api = useApi();
    categories.value = await api<ShoppingCategory[]>('/shopping-categories');
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchList(listId.value),
    loadCategories(),
  ]);
});

// Действия со списком
async function handleRename(newTitle: string) {
  await store.updateList(listId.value, { title: newTitle });
}

async function handleUncheckAll() {
  await store.uncheckAll(listId.value);
}

function handlePrint() {
  if (store.currentList) {
    print(store.currentList);
  }
}

async function handleGenerateShareToken(id: string) {
  await store.generateShareToken(id);
}

async function handleRevokeShareToken(id: string) {
  await store.revokeShareToken(id);
}

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

async function handleConfirmDelete() {
  await store.deleteList(listId.value);
  router.push('/cabinet/shopping-lists');
}

// Действия с позициями
function openItemModal(item?: ShoppingListItem) {
  editingItem.value = item || null;
  isItemModalOpen.value = true;
}

async function handleSaveItem(data: {
  name: string;
  categoryId?: string | null;
  quantity: number;
  unit: string;
  price?: number | null;
  note?: string | null;
}) {
  if (editingItem.value) {
    // Редактирование
    await store.updateItem(listId.value, editingItem.value.id, data);
  } else {
    // Создание
    await store.addItem(listId.value, data);
  }
  isItemModalOpen.value = false;
  editingItem.value = null;
}

async function handleDeleteItem(itemId: string) {
  await store.deleteItem(listId.value, itemId);
}

async function handleDeleteItemFromModal() {
  if (editingItem.value) {
    await store.deleteItem(listId.value, editingItem.value.id);
    isItemModalOpen.value = false;
    editingItem.value = null;
  }
}

async function handleToggleItem(itemId: string) {
  await store.toggleItem(listId.value, itemId);
}

async function handleQuickAdd(name: string) {
  await store.addItem(listId.value, { name, quantity: 1, unit: 'шт' });
}

async function handleAddPopular(item: { name: string; categoryId?: string; unit?: string }) {
  await store.addItem(listId.value, {
    name: item.name,
    categoryId: item.categoryId,
    quantity: 1,
    unit: item.unit || 'шт',
  });
}
</script>
