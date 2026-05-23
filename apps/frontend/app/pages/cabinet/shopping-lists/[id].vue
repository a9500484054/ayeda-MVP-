<!-- apps\frontend\app\pages\cabinet\shopping-lists\[id].vue -->
<template>
  <div class="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
    <!-- Loading -->
    <!-- <div  class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      <p class="mt-4 text-sm text-gray-500">Загрузка...</p>
    </div> -->

    <div>
      <!-- Desktop: 2 колонки -->
      <div class="hidden lg:grid lg:grid-cols-20 lg:gap-6">
        <!-- Левая колонка: список покупок (65% = 13/20) -->
        <UCard class="lg:col-span-13">
          <!-- Хедер списка (sticky) - без UCard, просто sticky элемент -->
          <div class="bg-white pb-4 dark:bg-darkMode-900">
            <ShoppingListHeader
              :title="store.currentList?.title"
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
          </div>

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

        <!-- Правая колонка: добавление продуктов (35% = 7/20) -->
        <div class="lg:col-span-7">
          <div class="sticky top-6">
            <UCard class="add-item-block">
              <AddItemBlock
                :popular-items="popularItems"
                @quick-add="handleQuickAdd"
                @add-popular="handleAddPopular"
                @scroll-to-bottom="scrollToBottom"
              />
            </UCard>
          </div>
        </div>
      </div>

      <!-- Mobile/Tablet: одна колонка + плавающая кнопка -->
      <div class="lg:hidden">
        <ShoppingListHeader
          :title="store.currentList?.title"
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

        <ShoppingListItems
          :items="store.currentItems"
          :filter-type="filterType"
          :sort-by="sortBy"
          :search-query="searchQuery"
          @edit-item="openItemModal"
          @delete-item="handleDeleteItem"
          @toggle-item="handleToggleItem"
        />
      </div>
    </div>

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

    <!-- Модалка для добавления продуктов (Mobile/Tablet) -->
    <UModal v-model:open="isAddItemModalOpen">
      <!-- <template #title>
        Добавить продукты
      </template> -->
      <template #body>
        <AddItemBlock
          :popular-items="popularItems"
          @quick-add="handleQuickAddMobile"
          @add-popular="handleAddPopularMobile"
        />
      </template>
      <template #footer>
        <UButton variant="ghost" @click="isAddItemModalOpen = false">
          Закрыть
        </UButton>
      </template>
    </UModal>

    <!-- Плавающая кнопка добавления (Mobile/Tablet) -->
    <button
      class="lg:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
      @click="isAddItemModalOpen = true"
    >
      <UIcon name="i-lucide-plus" class="h-6 w-6 text-white" />
    </button>
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

const listId = computed(() => route.params.id as string);

// Состояние фильтрации и сортировки
const filterType = ref<'all' | 'checked' | 'unchecked'>('all');
const sortBy = ref<'name' | 'category' | 'status' | 'order'>('order');
const searchQuery = ref('');

// Состояние модалок
const isItemModalOpen = ref(false);
const isShareModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isAddItemModalOpen = ref(false);
const editingItem = ref<ShoppingListItem | null>(null);

// Категории для выбора
const categories = ref<ShoppingCategory[]>([]);

// Популярные ингредиенты
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
    await store.updateItem(listId.value, editingItem.value.id, data);
  } else {
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

// Desktop добавление
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

// Mobile добавление (закрываем модалку после добавления)
async function handleQuickAddMobile(name: string) {
  await store.addItem(listId.value, { name, quantity: 1, unit: 'шт' });
  isAddItemModalOpen.value = false;
}

async function handleAddPopularMobile(item: { name: string; categoryId?: string; unit?: string }) {
  await store.addItem(listId.value, {
    name: item.name,
    categoryId: item.categoryId,
    quantity: 1,
    unit: item.unit || 'шт',
  });
  isAddItemModalOpen.value = false;
}

// Функция для скролла вниз
function scrollToBottom() {
  nextTick(() => {
    // Находим контейнер со списком продуктов
    const container = document.querySelector('.shopping-list-container');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      // Или скроллим всю страницу
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
}
</script>

<style scoped>
/* Анимация для плавающей кнопки */
.fixed {
  animation: fade-in-up 0.3s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
