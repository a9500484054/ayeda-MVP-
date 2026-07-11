<!-- pages/admin/articles.vue -->
<script setup lang="ts">
import { h, resolveComponent, ref, computed, watch, onMounted } from 'vue'
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
const api = useApi()
const config = useRuntimeConfig()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string>('')
const typeFilter = ref<string>('')
const categoryFilter = ref<string>('')

const isFormModalOpen = ref(false)
const formModalMode = ref<'create' | 'edit'>('create')
const isDeleteModalOpen = ref(false)

const selectedArticle = ref<Article | null>(null)
const isLoading = ref(false)
const isUploading = ref(false)
const categoriesList = ref<string[]>([])

// Данные
const articles = ref<Article[]>([])
const totalArticlesCount = ref(0)

// Форма
const formData = ref({
  title: '',
  slug: '',
  content: '',
  steps: [] as Array<{ id?: string; text: string; image: string | null; sort: number }>,
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

// Полный URL изображения (apiUrl + path)
const getFullImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  // Если путь уже полный URL — возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${config.public.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

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

// Загрузка изображения
const uploadImage = async (file: File): Promise<string | null> => {
  isUploading.value = true
  try {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    const response = await api('/uploads', {
      method: 'POST',
      body: formDataUpload
    })

    return response.path
  } catch (error: any) {
    console.error('Error uploading image:', error)
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message || 'Не удалось загрузить изображение',
      color: 'error'
    })
    return null
  } finally {
    isUploading.value = false
  }
}

// Универсальная функция загрузки
const handleImageUpload = async (callback: (path: string) => void) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const path = await uploadImage(file)
    if (path) callback(path)
  }
  input.click()
}

// Обработчики загрузки
const handleFeaturedImageUpload = () => {
  handleImageUpload((path) => {
    formData.value.featured_image = path
    toast.add({
      title: 'Успех',
      description: 'Главное изображение загружено',
      color: 'success',
      timeout: 2000
    })
  })
}

const handleSeoImageUpload = () => {
  handleImageUpload((path) => {
    formData.value.seo.og_image = path
    toast.add({
      title: 'Успех',
      description: 'SEO изображение загружено',
      color: 'success',
      timeout: 2000
    })
  })
}

const uploadStepImage = (stepIndex: number) => {
  handleImageUpload((path) => {
    formData.value.steps[stepIndex].image = path
    toast.add({
      title: 'Успех',
      description: 'Изображение шага загружено',
      color: 'success',
      timeout: 2000
    })
  })
}

const insertImageIntoContent = () => {
  handleImageUpload((path) => {
    const imageMarkdown = `\n![image](${path})\n`
    formData.value.content += imageMarkdown
    toast.add({
      title: 'Успех',
      description: 'Изображение вставлено в контент',
      color: 'success',
      timeout: 2000
    })
  })
}

// Управление шагами
const addStep = () => {
  formData.value.steps.push({
    text: '',
    image: null,
    sort: formData.value.steps.length
  })
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  formData.value.steps.forEach((step, i) => step.sort = i)
}

const moveStepUp = (index: number) => {
  if (index === 0) return
  const temp = formData.value.steps[index]
  formData.value.steps[index] = formData.value.steps[index - 1]
  formData.value.steps[index - 1] = temp
  formData.value.steps.forEach((step, i) => step.sort = i)
}

const moveStepDown = (index: number) => {
  if (index === formData.value.steps.length - 1) return
  const temp = formData.value.steps[index]
  formData.value.steps[index] = formData.value.steps[index + 1]
  formData.value.steps[index + 1] = temp
  formData.value.steps.forEach((step, i) => step.sort = i)
}

// Таблица
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'title',
    header: 'Заголовок',
    meta: { class: { td: 'font-medium' } }
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const labelMap: Record<string, string> = {
        article: 'Статья',
        tip: 'Совет',
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
    meta: { class: { th: 'text-center w-24', td: 'text-center' } },
    cell: ({ row }) => row.getValue('views') || 0
  },
  {
    accessorKey: 'created_at',
    header: 'Дата создания',
    cell: ({ row }) => new Date(row.getValue('created_at') as string).toLocaleDateString('ru-RU')
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: { class: { th: 'text-right w-32', td: 'text-right' } },
    cell: ({ row }) => {
      const article = row.original
      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'info',
          variant: 'ghost',
          onClick: () => viewArticle(article)
        }),
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

const totalPages = computed(() => Math.ceil(totalArticlesCount.value / pageSize.value))

const handleSearch = () => {
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
    steps: [],
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
  formModalMode.value = 'create'
  selectedArticle.value = null
  isFormModalOpen.value = true
}

const openEditModal = (article: Article) => {
  selectedArticle.value = article
  formModalMode.value = 'edit'
  formData.value = {
    title: article.title,
    slug: article.slug,
    content: article.content || '',
    steps: article.steps ? [...article.steps] : [],
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
  isFormModalOpen.value = true
}

const viewArticle = (article: Article) => {
  navigateTo(`/articles/${article.slug}`)
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
      toast.add({ title: 'Успех', description: 'Статья снята с публикации', color: 'success' })
    } else {
      await articlesApi.publishArticle(article.id)
      toast.add({ title: 'Успех', description: 'Статья опубликована', color: 'success' })
    }
    await loadArticles()
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось изменить статус', color: 'error' })
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
      content: formData.value.content || undefined,
      steps: formData.value.steps.length > 0 ? formData.value.steps.map(s => ({
        text: s.text,
        image: s.image,
        sort: s.sort
      })) : undefined,
      excerpt: formData.value.excerpt || undefined,
      featured_image: formData.value.featured_image || undefined,
      categories: formData.value.categories.length ? formData.value.categories : undefined,
      type: formData.value.type,
      status: formData.value.status,
      seo: formData.value.seo
    }

    await articlesApi.createArticle(createData)
    isFormModalOpen.value = false
    await loadArticles()
    toast.add({ title: 'Успех', description: 'Статья создана', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось создать статью', color: 'error' })
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
      content: formData.value.content || undefined,
      steps: formData.value.steps.length > 0 ? formData.value.steps.map(s => ({
        id: s.id,
        text: s.text,
        image: s.image,
        sort: s.sort
      })) : undefined,
      excerpt: formData.value.excerpt || undefined,
      featured_image: formData.value.featured_image || undefined,
      categories: formData.value.categories.length ? formData.value.categories : undefined,
      type: formData.value.type,
      status: formData.value.status,
      seo: formData.value.seo
    }

    await articlesApi.updateArticle(selectedArticle.value.id, updateData)
    isFormModalOpen.value = false
    await loadArticles()
    toast.add({ title: 'Успех', description: 'Статья обновлена', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось обновить статью', color: 'error' })
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
    toast.add({ title: 'Успех', description: 'Статья удалена', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось удалить статью', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const isFormValid = computed(() => {
  return !!formData.value.title && (!!formData.value.content || formData.value.steps.length > 0)
})

// Наблюдатели
watch([currentPage, pageSize, statusFilter, typeFilter, categoryFilter], () => {
  loadArticles()
}, { deep: true })

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
        <h1 class="text-3xl font-bold">Статьи</h1>
        <p class="text-sm text-muted-foreground mt-1">Управление статьями и публикациями</p>
      </div>
      <UButton icon="i-lucide-plus" color="primary" @click="openCreateModal">
        Новая статья
      </UButton>
    </div>

    <!-- Фильтры -->
    <UCard>
      <div class="flex flex-wrap items-center gap-3 p-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по заголовку..."
          icon="i-lucide-search"
          class="flex-1 min-w-[280px]"
          @keyup.enter="handleSearch"
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
            { label: 'Совет', value: 'tip' },
            { label: 'Новость', value: 'news' }
          ]"
          :clearable="true"
          class="w-36"
        />

        <UButton color="primary" variant="outline" @click="handleSearch">
          Поиск
        </UButton>

        <div class="flex-1"></div>

        <div class="text-sm text-muted-foreground whitespace-nowrap">
          Всего: {{ totalArticlesCount }}
        </div>
      </div>
    </UCard>

    <!-- Таблица -->
    <UCard class="overflow-hidden">
      <UTable
        :data="articles"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-12">
            <UIcon name="i-lucide-file-text" class="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <p class="text-lg font-medium text-muted-foreground">Нет статей</p>
            <p class="text-sm text-muted-foreground mt-1">Создайте первую статью</p>
            <UButton class="mt-4" color="primary" variant="outline" @click="openCreateModal">
              <UIcon name="i-lucide-plus" class="mr-1" />
              Создать статью
            </UButton>
          </div>
        </template>
      </UTable>

      <div v-if="totalPages > 1" class="flex items-center justify-between border-t px-4 py-4">
        <div class="text-sm text-muted-foreground">
          Показано {{ ((currentPage - 1) * pageSize) + 1 }} — {{ Math.min(currentPage * pageSize, totalArticlesCount) }} из {{ totalArticlesCount }}
        </div>
        <UPagination v-model:page="currentPage" :items-per-page="pageSize" :total="totalArticlesCount" />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal
      v-model:open="isFormModalOpen"
      :ui="{ content: 'max-w-5xl w-full max-h-[92vh] overflow-y-auto' }"
    >
      <template #content>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">
              {{ formModalMode === 'edit' ? 'Редактирование' : 'Создание' }} статьи
            </h2>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isFormModalOpen = false" />
          </div>

          <UForm
            :state="formData"
            class="space-y-8"
            @submit="formModalMode === 'edit' ? updateArticle() : createArticle()"
          >
            <!-- Основная информация -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UFormField label="Заголовок" name="title" required>
                <UInput
                  v-model="formData.title"
                  placeholder="Введите заголовок"
                  @blur="formData.slug = formData.slug || generateSlug(formData.title)"
                />
              </UFormField>

              <UFormField label="Slug" name="slug">
                <UInput v-model="formData.slug" placeholder="url-адрес" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UFormField label="Тип" name="type">
                <USelect
                  v-model="formData.type"
                  :items="[
                    { label: 'Статья', value: 'article' },
                    { label: 'Совет', value: 'tip' },
                    { label: 'Новость', value: 'news' }
                  ]"
                />
              </UFormField>

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

              <UFormField label="Категории" name="categories">
                <USelect
                  v-model="formData.categories"
                  :items="categoriesList.map(c => ({ label: c, value: c }))"
                  multiple
                  placeholder="Выберите категории"
                />
              </UFormField>
            </div>

            <!-- Изображения -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Главное изображение">
                <div class="space-y-3">
                  <UButton
                    type="button"
                    color="primary"
                    variant="outline"
                    :loading="isUploading"
                    @click="handleFeaturedImageUpload"
                  >
                    <UIcon name="i-lucide-upload" class="mr-2" />
                    Загрузить главное изображение
                  </UButton>
                  <div v-if="formData.featured_image" class="relative w-48 h-48 rounded-xl overflow-hidden border shadow-sm">
                    <img
                      :src="getFullImageUrl(formData.featured_image)"
                      alt="Featured"
                      class="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      class="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                      @click="formData.featured_image = ''"
                    >
                      <UIcon name="i-lucide-x" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </UFormField>

              <UFormField label="OG изображение (соцсети)">
                <div class="space-y-3">
                  <UButton
                    type="button"
                    color="primary"
                    variant="outline"
                    :loading="isUploading"
                    @click="handleSeoImageUpload"
                  >
                    <UIcon name="i-lucide-upload" class="mr-2" />
                    Загрузить OG изображение
                  </UButton>
                  <div v-if="formData.seo.og_image" class="relative w-48 h-48 rounded-xl overflow-hidden border shadow-sm">
                    <img
                      :src="getFullImageUrl(formData.seo.og_image)"
                      alt="OG"
                      class="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      class="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                      @click="formData.seo.og_image = ''"
                    >
                      <UIcon name="i-lucide-x" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </UFormField>
            </div>

            <UFormField label="Краткое описание" name="excerpt">
              <UTextarea
                v-model="formData.excerpt"
                placeholder="Краткое описание статьи"
                :rows="3"
              />
            </UFormField>

            <!-- Шаги статьи -->
            <div class="border-t pt-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold">Шаги статьи</h3>
                  <p class="text-sm text-muted-foreground">Пошаговая инструкция</p>
                </div>
                <UButton type="button" @click="addStep">
                  <UIcon name="i-lucide-plus" class="mr-2" />
                  Добавить шаг
                </UButton>
              </div>

              <div v-if="formData.steps.length === 0" class="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
                Нет шагов. Нажмите "Добавить шаг"
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(step, index) in formData.steps"
                  :key="index"
                  class="border rounded-2xl p-5 bg-gray-50 dark:bg-gray-900/50"
                >
                  <div class="flex gap-4">
                    <div class="flex flex-col items-center gap-1 pt-1">
                      <span class="text-lg font-bold text-muted-foreground">#{{ index + 1 }}</span>
                      <div class="flex flex-col">
                        <button type="button" @click="moveStepUp(index)" :disabled="index === 0">
                          <UIcon name="i-lucide-chevron-up" class="w-5 h-5" />
                        </button>
                        <button type="button" @click="moveStepDown(index)" :disabled="index === formData.steps.length - 1">
                          <UIcon name="i-lucide-chevron-down" class="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div class="flex-1 space-y-4">
                      <UTextarea
                        v-model="step.text"
                        placeholder="Описание шага"
                        :rows="3"
                      />

                      <div>
                        <UButton
                          type="button"
                          size="sm"
                          variant="outline"
                          :loading="isUploading"
                          @click="uploadStepImage(index)"
                        >
                          <UIcon name="i-lucide-upload" class="mr-2" />
                          Загрузить изображение
                        </UButton>

                        <div v-if="step.image" class="mt-3 relative inline-block w-40 h-40 rounded-xl overflow-hidden border">
                          <img
                            :src="getFullImageUrl(step.image)"
                            :alt="`Шаг ${index + 1}`"
                            class="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            @click="step.image = null"
                            class="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                          >
                            <UIcon name="i-lucide-x" class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <UButton
                      type="button"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      @click="removeStep(index)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Markdown контент -->
            <div class="border-t pt-6">
              <UFormField label="Дополнительный контент (Markdown)">
                <div class="flex flex-wrap gap-2 mb-3">
                  <UButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon="i-lucide-image"
                    @click="insertImageIntoContent"
                  >
                    Вставить изображение
                  </UButton>
                </div>
                <UTextarea
                  v-model="formData.content"
                  placeholder="Полный текст статьи в формате Markdown"
                  :rows="10"
                  class="font-mono text-sm"
                />
              </UFormField>
            </div>

            <!-- SEO -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">SEO настройки</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField label="SEO Заголовок">
                  <UInput v-model="formData.seo.title" maxlength="70" />
                </UFormField>
                <UFormField label="SEO Описание">
                  <UTextarea v-model="formData.seo.description" :rows="2" maxlength="160" />
                </UFormField>
              </div>

              <UFormField label="Ключевые слова" class="mt-6">
                <UInput
                  :model-value="formData.seo.keywords.join(', ')"
                  placeholder="слово1, слово2, слово3"
                  @update:model-value="(val) => formData.seo.keywords = val.split(',').map(k => k.trim()).filter(Boolean)"
                />
              </UFormField>
            </div>

            <!-- Кнопки -->
            <div class="flex justify-end gap-3 pt-6 border-t">
              <UButton color="neutral" variant="ghost" @click="isFormModalOpen = false">
                Отмена
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                {{ formModalMode === 'edit' ? 'Сохранить изменения' : 'Создать статью' }}
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="isDeleteModalOpen" :ui="{ content: 'max-w-md w-full' }">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2.5 rounded-full bg-error/10">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error" />
            </div>
            <h2 class="text-xl font-bold">Подтверждение удаления</h2>
          </div>

          <p class="text-muted-foreground">
            Вы действительно хотите удалить статью <strong>{{ selectedArticle?.title }}</strong>?
          </p>
          <p class="text-sm text-muted-foreground mt-2">Это действие нельзя отменить.</p>

          <div class="flex justify-end gap-3 mt-6">
            <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">
              Отмена
            </UButton>
            <UButton color="error" :loading="isLoading" @click="deleteArticle">
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
