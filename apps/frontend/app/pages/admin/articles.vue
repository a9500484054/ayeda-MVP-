<!-- pages/admin/articles.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useArticlesApi, type Article, type CreateArticleDto, type UpdateArticleDto } from '~/composables/useArticlesApi'

definePageMeta({
  layout: 'admin',
  title: 'Статьи'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const articlesApi = useArticlesApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string>('')
const typeFilter = ref<string>('')
const categoryFilter = ref<string>('')

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedArticle = ref<Article | null>(null)
const isLoading = ref(false)
const categoriesList = ref<string[]>([])

// Данные
const articles = ref<Article[]>([])
const totalArticlesCount = ref(0)

// Форма
const formData = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image: '',
  categories: [] as string[],
  type: 'article' as const,
  status: 'draft' as const,
  seo: {
    title: '',
    description: '',
    keywords: [] as string[],
    og_image: '',
    canonical_url: ''
  }
})

// Загрузка статей
const loadArticles = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.type = typeFilter.value
    if (categoryFilter.value) params.category = categoryFilter.value

    const response = await articlesApi.getArticles(params)
    articles.value = response.items
    totalArticlesCount.value = response.total
  } catch (error: any) {
    console.error('Error loading articles:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить статьи',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузка категорий
const loadCategories = async () => {
  try {
    categoriesList.value = await articlesApi.getCategories()
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Таблица
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'title',
    header: 'Заголовок',
    meta: {
      class: {
        td: 'font-medium'
      }
    }
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const labelMap: Record<string, string> = {
        article: 'Статья',
        recipe: 'Рецепт',
        news: 'Новость'
      }
      return h(UBadge, { variant: 'subtle' }, () => labelMap[type] || type)
    }
  },
  {
    accessorKey: 'categories',
    header: 'Категории',
    cell: ({ row }) => {
      const categories = row.getValue('categories') as string[]
      if (!categories || categories.length === 0) return '—'
      return categories.join(', ')
    }
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const colorMap: Record<string, string> = {
        published: 'success',
        draft: 'warning',
        archived: 'neutral'
      }
      const labelMap: Record<string, string> = {
        published: 'Опубликовано',
        draft: 'Черновик',
        archived: 'Архив'
      }
      return h(UBadge, {
        color: colorMap[status] || 'neutral',
        variant: 'subtle'
      }, () => labelMap[status] || status)
    }
  },
  {
    accessorKey: 'views',
    header: 'Просмотры',
    meta: {
      class: {
        th: 'text-center w-24',
        td: 'text-center'
      }
    },
    cell: ({ row }) => {
      const views = row.getValue('views') as number
      return views || 0
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Дата создания',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return new Date(date).toLocaleDateString('ru-RU')
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: {
      class: {
        th: 'text-right w-32',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const article = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(article)
        }),
        h(UButton, {
          icon: article.status === 'published' ? 'i-lucide-eye-off' : 'i-lucide-eye',
          size: 'sm',
          color: article.status === 'published' ? 'warning' : 'success',
          variant: 'ghost',
          onClick: () => togglePublish(article)
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(article)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() =>
  Math.ceil(totalArticlesCount.value / pageSize.value)
)

// Методы
const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
  loadArticles()
}


const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[ё]/g, 'e')
}

const resetForm = () => {
  formData.value = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    categories: [],
    type: 'article',
    status: 'draft',
    seo: {
      title: '',
      description: '',
      keywords: [],
      og_image: '',
      canonical_url: ''
    }
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (article: Article) => {
  selectedArticle.value = article
  formData.value = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || '',
    featured_image: article.featured_image || '',
    categories: article.categories || [],
    type: article.type,
    status: article.status,
    seo: {
      title: article.seo?.title || '',
      description: article.seo?.description || '',
      keywords: article.seo?.keywords || [],
      og_image: article.seo?.og_image || '',
      canonical_url: article.seo?.canonical_url || ''
    }
  }
  isEditModalOpen.value = true
}

const openDeleteModal = (article: Article) => {
  selectedArticle.value = article
  isDeleteModalOpen.value = true
}

const togglePublish = async (article: Article) => {
  isLoading.value = true
  try {
    if (article.status === 'published') {
      await articlesApi.unpublishArticle(article.id)
      toast.add({
        title: 'Успех',
        description: 'Статья снята с публикации',
        color: 'success'
      })
    } else {
      await articlesApi.publishArticle(article.id)
      toast.add({
        title: 'Успех',
        description: 'Статья опубликована',
        color: 'success'
      })
    }
    await loadArticles()
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось изменить статус',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const createArticle = async () => {
  isLoading.value = true
  try {
    const createData: CreateArticleDto = {
      title: formData.value.title,
      slug: formData.value.slug || generateSlug(formData.value.title),
      content: formData.value.content,
      excerpt: formData.value.excerpt || undefined,
      featured_image: formData.value.featured_image || undefined,
      categories: formData.value.categories.length ? formData.value.categories : undefined,
      type: formData.value.type,
      status: formData.value.status,
      seo: formData.value.seo
    }

    await articlesApi.createArticle(createData)
    isCreateModalOpen.value = false
    await loadArticles()

    toast.add({
      title: 'Успех',
      description: 'Статья создана',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error creating article:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось создать статью',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const updateArticle = async () => {
  if (!selectedArticle.value) return

  isLoading.value = true
  try {
    const updateData: UpdateArticleDto = {
      title: formData.value.title,
      slug: formData.value.slug,
      content: formData.value.content,
      excerpt: formData.value.excerpt || undefined,
      featured_image: formData.value.featured_image || undefined,
      categories: formData.value.categories.length ? formData.value.categories : undefined,
      type: formData.value.type,
      status: formData.value.status,
      seo: formData.value.seo
    }

    await articlesApi.updateArticle(selectedArticle.value.id, updateData)
    isEditModalOpen.value = false
    await loadArticles()

    toast.add({
      title: 'Успех',
      description: 'Статья обновлена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error updating article:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось обновить статью',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const deleteArticle = async () => {
  if (!selectedArticle.value) return

  isLoading.value = true
  try {
    await articlesApi.deleteArticle(selectedArticle.value.id)
    isDeleteModalOpen.value = false
    await loadArticles()

    toast.add({
      title: 'Успех',
      description: 'Статья удалена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting article:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить статью',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Валидация формы
const isFormValid = computed(() => {
  return !!(formData.value.title && formData.value.content)
})

// Наблюдение за пагинацией и фильтрами
// Наблюдение за пагинацией и фильтрами
watch([currentPage, pageSize, statusFilter, typeFilter, categoryFilter], () => {
  loadArticles()
}, { deep: true })

// Загрузка при монтировании
onMounted(() => {
  loadArticles()
  loadCategories()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Статьи
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление статьями и публикациями
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Новая статья
      </UButton>
    </div>

    <!-- Фильтры и поиск -->
    <UCard>
      <div class="flex flex-wrap items-center gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по заголовку..."
          icon="i-lucide-search"
          class="max-w-md w-full"
          @update:model-value="handleSearch"
        />

        <USelect
          v-model="statusFilter"
          placeholder="Все статусы"
          :items="[
            { label: 'Опубликовано', value: 'published' },
            { label: 'Черновик', value: 'draft' },
            { label: 'Архив', value: 'archived' }
          ]"
          :clearable="true"
          class="w-40"
        />

        <USelect
          v-model="typeFilter"
          placeholder="Все типы"
          :items="[
            { label: 'Статья', value: 'article' },
            { label: 'Рецепт', value: 'recipe' },
            { label: 'Новость', value: 'news' }
          ]"
          :clearable="true"
          class="w-32"
        />

        <div class="flex-1"></div>

        <div class="text-sm text-muted-foreground whitespace-nowrap">
          Всего: {{ totalArticlesCount }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="articles"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      />

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t px-4 py-4"
      >
        <div class="text-sm text-muted-foreground">
          Показано
          {{ ((currentPage - 1) * pageSize) + 1 }}
          -
          {{ Math.min(currentPage * pageSize, totalArticlesCount) }}
          из
          {{ totalArticlesCount }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalArticlesCount"
        />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal
      v-model:open="isCreateModalOpen"
      :ui="{ content: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Создание статьи
            </h2>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="createArticle"
          >
            <UFormField label="Заголовок" name="title" required>
              <UInput
                v-model="formData.title"
                placeholder="Введите заголовок"
                @blur="formData.slug = formData.slug || generateSlug(formData.title)"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Slug" name="slug">
                <UInput
                  v-model="formData.slug"
                  placeholder="url-адрес"
                />
              </UFormField>

              <UFormField label="Тип" name="type">
                <USelect
                  v-model="formData.type"
                  :items="[
                    { label: 'Статья', value: 'article' },
                    { label: 'Рецепт', value: 'recipe' },
                    { label: 'Новость', value: 'news' }
                  ]"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Статус" name="status">
                <USelect
                  v-model="formData.status"
                  :items="[
                    { label: 'Черновик', value: 'draft' },
                    { label: 'Опубликовано', value: 'published' },
                    { label: 'Архив', value: 'archived' }
                  ]"
                />
              </UFormField>

              <UFormField label="Изображение" name="featured_image">
                <UInput
                  v-model="formData.featured_image"
                  placeholder="URL изображения"
                />
              </UFormField>
            </div>

            <UFormField label="Категории" name="categories">
              <USelect
                v-model="formData.categories"
                :items="categoriesList.map(c => ({ label: c, value: c }))"
                multiple
                placeholder="Выберите категории"
              />
            </UFormField>

            <UFormField label="Краткое описание" name="excerpt">
              <UTextarea
                v-model="formData.excerpt"
                placeholder="Краткое описание статьи"
                :rows="2"
              />
            </UFormField>

            <UFormField label="Содержание" name="content" required>
              <UTextarea
                v-model="formData.content"
                placeholder="Содержание статьи..."
                :rows="10"
              />
            </UFormField>

            <div class="border-t pt-4">
              <h3 class="text-lg font-medium mb-4">SEO настройки</h3>

              <div class="space-y-4">
                <UFormField label="SEO Заголовок" name="seo.title">
                  <UInput v-model="formData.seo.title" placeholder="SEO заголовок" />
                </UFormField>

                <UFormField label="SEO Описание" name="seo.description">
                  <UTextarea v-model="formData.seo.description" placeholder="SEO описание" :rows="2" />
                </UFormField>

                <UFormField label="Ключевые слова" name="seo.keywords">
                  <UInput
                    v-model="formData.seo.keywords"
                    placeholder="ключевое слово1, ключевое слово2"
                    @update:model-value="(val: string) => formData.seo.keywords = val.split(',').map(k => k.trim())"
                  />
                </UFormField>

                <UFormField label="OG изображение" name="seo.og_image">
                  <UInput v-model="formData.seo.og_image" placeholder="URL OG изображения" />
                </UFormField>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isCreateModalOpen = false"
              >
                Отмена
              </UButton>

              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Создать
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal (аналогично Create Modal) -->
    <UModal
      v-model:open="isEditModalOpen"
      :ui="{ content: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Редактирование статьи
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ selectedArticle?.slug }}
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="updateArticle"
          >
            <!-- Те же поля что и в Create Modal -->
            <UFormField label="Заголовок" name="title" required>
              <UInput v-model="formData.title" placeholder="Введите заголовок" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Slug" name="slug">
                <UInput v-model="formData.slug" placeholder="url-адрес" />
              </UFormField>

              <UFormField label="Тип" name="type">
                <USelect
                  v-model="formData.type"
                  :items="[
                    { label: 'Статья', value: 'article' },
                    { label: 'Рецепт', value: 'recipe' },
                    { label: 'Новость', value: 'news' }
                  ]"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Статус" name="status">
                <USelect
                  v-model="formData.status"
                  :items="[
                    { label: 'Черновик', value: 'draft' },
                    { label: 'Опубликовано', value: 'published' },
                    { label: 'Архив', value: 'archived' }
                  ]"
                />
              </UFormField>

              <UFormField label="Изображение" name="featured_image">
                <UInput v-model="formData.featured_image" placeholder="URL изображения" />
              </UFormField>
            </div>

            <UFormField label="Категории" name="categories">
              <USelect
                v-model="formData.categories"
                :items="categoriesList.map(c => ({ label: c, value: c }))"
                multiple
                placeholder="Выберите категории"
              />
            </UFormField>

            <UFormField label="Краткое описание" name="excerpt">
              <UTextarea v-model="formData.excerpt" placeholder="Краткое описание статьи" :rows="2" />
            </UFormField>

            <UFormField label="Содержание" name="content" required>
              <UTextarea v-model="formData.content" placeholder="Содержание статьи..." :rows="10" />
            </UFormField>

            <!-- SEO блок -->
            <div class="border-t pt-4">
              <h3 class="text-lg font-medium mb-4">SEO настройки</h3>

              <div class="space-y-4">
                <UFormField label="SEO Заголовок" name="seo.title">
                  <UInput v-model="formData.seo.title" placeholder="SEO заголовок" />
                </UFormField>

                <UFormField label="SEO Описание" name="seo.description">
                  <UTextarea v-model="formData.seo.description" placeholder="SEO описание" :rows="2" />
                </UFormField>

                <UFormField label="Ключевые слова" name="seo.keywords">
                  <UInput
                    :model-value="formData.seo.keywords?.join(', ')"
                    placeholder="ключевое слово1, ключевое слово2"
                    @update:model-value="(val: string) => formData.seo.keywords = val.split(',').map(k => k.trim()).filter(Boolean)"
                  />
                </UFormField>

                <UFormField label="OG изображение" name="seo.og_image">
                  <UInput v-model="formData.seo.og_image" placeholder="URL OG изображения" />
                </UFormField>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isEditModalOpen = false"
              >
                Отмена
              </UButton>

              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Сохранить
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      :ui="{ content: 'max-w-md w-full' }"
    >
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">
            Подтверждение удаления
          </h2>

          <p>
            Вы уверены, что хотите удалить статью
            <strong>{{ selectedArticle?.title }}</strong>?
          </p>

          <p class="text-sm text-muted-foreground mt-2">
            Это действие нельзя отменить.
          </p>

          <div class="flex justify-end gap-2 pt-6">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isDeleteModalOpen = false"
            >
              Отмена
            </UButton>

            <UButton
              color="error"
              :loading="isLoading"
              @click="deleteArticle"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
