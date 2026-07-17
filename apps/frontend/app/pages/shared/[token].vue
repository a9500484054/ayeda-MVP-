<template>
  <div class="min-h-screen bg-gray-50 dark:bg-darkMode-50">
    <div class="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <!-- Хедер с кнопкой копирования -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Общий список покупок
        </h1>

        <Button
          v-if="userStore.isAuthenticated && !isCopied"
          color="primary"
          size="sm"
          :loading="isCopying"
          @click="copyToList"
        >
          <UIcon name="i-lucide-copy" class="mr-1 h-4 w-4" />
          Скопировать в мои списки
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
        <p class="mt-4 text-sm text-gray-500">Загрузка...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
        <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-red-500" />
        <p class="mt-3 text-gray-600">{{ error }}</p>
        <Button class="mt-4" @click="router.back()">
          Вернуться назад
        </Button>
      </div>

      <!-- Список -->
      <template v-else-if="sharedList">
        <!-- Заголовок -->
        <div class="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-darkMode-400 dark:bg-darkMode-50">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ sharedList.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            {{ sharedList.items?.length || 0 }} позиций
          </p>
        </div>

        <!-- Позиции (только чтение) -->
        <div class="space-y-1">
          <div
            v-for="item in sharedList.items"
            :key="item.id"
            class="flex items-center gap-3 rounded-lg bg-white p-3 dark:bg-darkMode-50"
          >
            <UCheckbox :model-value="item.isChecked" disabled />
            <CategoryIcon :category="item.category" />
            <div class="flex-1">
              <span :class="{ 'line-through text-gray-400': item.isChecked }">
                {{ item.name }}
              </span>
              <span class="ml-2 text-sm text-gray-400">
                {{ item.quantity }} {{ item.unit }}
              </span>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-if="!sharedList.items?.length" class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-shopping-cart" class="h-12 w-12 text-gray-300" />
            <p class="mt-3 text-gray-500">Список пуст</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShoppingListsStore } from '~/stores/shoppingListsStore';
import { useUserStore } from '~/stores/userStore';
import type { ShoppingList } from '~/shared/types/shopping.types';
import Button from '~/shared/ui/button/Button.vue';
import CategoryIcon from '~/components/shopping/list/shared/CategoryIcon.vue';

const route = useRoute();
const router = useRouter();
const store = useShoppingListsStore();
const userStore = useUserStore();
const toast = useToast();

const token = computed(() => route.params.token as string);

const isLoading = ref(true);
const error = ref<string | null>(null);
const sharedList = ref<ShoppingList | null>(null);
const isCopying = ref(false);
const isCopied = ref(false);

// 🔥 FIX: Move useHead to a separate function or use with careful computed
const pageTitle = computed(() => sharedList.value?.title || 'Список покупок');
const pageDescription = computed(() =>
  sharedList.value
    ? `Просмотр списка "${sharedList.value.title}" с ${sharedList.value.items?.length || 0} позициями`
    : 'Просмотр общего списка покупок'
);

// Use useHead with computed values
useHead({
  title: pageTitle,
  meta: [
    {
      name: 'description',
      content: pageDescription,
      key: 'description'
    },
    {
      name: 'robots',
      content: 'noindex, follow',
      key: 'robots'
    },
    {
      property: 'og:title',
      content: () => `${pageTitle.value} | АуЕда`,
      key: 'og:title'
    },
    {
      property: 'og:description',
      content: pageDescription,
      key: 'og:description'
    },
    {
      property: 'og:type',
      content: 'website',
      key: 'og:type'
    },
    {
      property: 'og:image',
      content: 'https://ayeda.ru/logo.png',
      key: 'og:image'
    },
    {
      property: 'og:image:alt',
      content: 'Общий список покупок',
      key: 'og:image:alt'
    },
    {
      property: 'og:url',
      content: `https://ayeda.ru/share/${token.value}`,
      key: 'og:url'
    },
    {
      property: 'og:site_name',
      content: 'АуЕда',
      key: 'og:site_name'
    },
  ],
});

async function loadSharedList() {
  isLoading.value = true;
  error.value = null;
  try {
    sharedList.value = await store.fetchSharedList(token.value);
  } catch (err: any) {
    error.value = err.message || 'Список не найден или ссылка недействительна';
  } finally {
    isLoading.value = false;
  }
}

async function copyToList() {
  if (!sharedList.value || !userStore.isAuthenticated) return;

  isCopying.value = true;
  try {
    // Создаем новый список
    const newList = await store.createList(`${sharedList.value.title} (копия)`);

    // Добавляем все позиции
    if (sharedList.value.items) {
      for (const item of sharedList.value.items) {
        await store.addItem(newList.id, {
          name: item.name,
          categoryId: item.category?.id,
          quantity: item.quantity,
          unit: item.unit,
          note: item.note,
        });
      }
    }

    isCopied.value = true;
    toast.add({
      title: 'Успех',
      description: 'Список скопирован в ваши списки покупок',
      color: 'success',
    });

    // Предлагаем перейти к списку
    setTimeout(() => {
      router.push(`/cabinet/shopping-lists/${newList.id}`);
    }, 1500);
  } catch (err: any) {
    toast.add({
      title: 'Ошибка',
      description: err.message || 'Не удалось скопировать список',
      color: 'error',
    });
  } finally {
    isCopying.value = false;
  }
}

// Load data only on client side to avoid hydration issues
onMounted(() => {
  loadSharedList();
});
</script>

<style scoped>
/* Добавьте любые стили, если необходимо */
</style>
