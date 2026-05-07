<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useUsersApi, type CreateUserDto, type UpdateUserDto, type UserDto } from '~/composables/useUsersApi'

definePageMeta({
  layout: 'admin',
  title: 'Пользователи'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const usersApi = useUsersApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedUser = ref<UserDto | null>(null)
const isLoading = ref(false)

// Данные
const users = ref<UserDto[]>([])
const totalUsersCount = ref(0)

// Форма
const formData = ref({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  bio: '',
  role: 'user' as const,
  password: ''
})

// Загрузка пользователей
const loadUsers = async () => {
  isLoading.value = true
  try {
    const response = await usersApi.getUsers(currentPage.value, pageSize.value)
    users.value = response.data
    totalUsersCount.value = response.total
  } catch (error: any) {
    console.error('Error loading users:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить пользователей',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Таблица
const columns: TableColumn<any>[] = [
  // {
  //   accessorKey: 'id',
  //   header: 'ID',
  //   meta: {
  //     class: {
  //       th: 'w-32',
  //       td: 'font-mono text-xs'
  //     }
  //   }
  // },
  {
    accessorKey: 'username',
    header: 'Username',
    meta: {
      class: {
        td: 'font-medium'
      }
    }
  },
  {
    accessorKey: 'firstName',
    header: 'Имя',
    cell: ({ row }) => {
      const firstName = row.getValue('firstName') as string | null
      const lastName = row.getValue('lastName') as string | null
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      return fullName || '—'
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'role',
    header: 'Роль',
    cell: ({ row }) => {
      const role = row.getValue('role') as string

      const colorMap: Record<string, string> = {
        admin: 'primary',
        moderator: 'warning',
        user: 'neutral'
      }

      const labelMap: Record<string, string> = {
        admin: 'Администратор',
        moderator: 'Модератор',
        user: 'Пользователь'
      }

      return h(
        UBadge,
        {
          color: colorMap[role] || 'neutral',
          variant: 'subtle'
        },
        () => labelMap[role] || role
      )
    }
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Верификация',
    cell: ({ row }) => {
      const isVerified = row.getValue('isEmailVerified') as boolean

      return h(UBadge, {
        color: isVerified ? 'success' : 'warning',
        variant: 'subtle'
      }, () => isVerified ? 'Верифицирован' : 'Не верифицирован')
    }
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Последний вход',
    cell: ({ row }) => {
      const date = row.getValue('lastLoginAt') as string | null
      return date ? new Date(date).toLocaleDateString('ru-RU') : '—'
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата регистрации',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return new Date(date).toLocaleDateString('ru-RU')
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: {
      class: {
        th: 'text-right w-28',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const user = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(user)
        }),

        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(user)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() =>
  Math.ceil(totalUsersCount.value / pageSize.value)
)

const paginatedUsers = computed(() => users.value)

// Фильтрация на клиенте (так как API поддерживает пагинацию, фильтруем только текущую страницу)
const filteredUsers = computed(() => {
  if (!searchQuery.value) return paginatedUsers.value

  const query = searchQuery.value.toLowerCase()

  return paginatedUsers.value.filter(
    user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query))
  )
})

// Методы
const handleSearch = (value: string) => {
  searchQuery.value = value
}

const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    role: 'user',
    password: ''
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (user: UserDto) => {
  selectedUser.value = user

  formData.value = {
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    role: user.role,
    password: ''
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (user: UserDto) => {
  selectedUser.value = user
  isDeleteModalOpen.value = true
}

const createUser = async () => {
  isLoading.value = true

  try {
    const createData: CreateUserDto = {
      email: formData.value.email,
      password: formData.value.password,
      username: formData.value.username
    }

    await usersApi.createUser(createData)

    isCreateModalOpen.value = false
    await loadUsers()

    toast.add({
      title: 'Успех',
      description: 'Пользователь создан',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error creating user:', error)

    let errorMessage = 'Не удалось создать пользователя'
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      errorMessage = 'Пользователь с таким email или username уже существует'
    }

    toast.add({
      title: 'Ошибка',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const updateUser = async () => {
  if (!selectedUser.value) return

  isLoading.value = true

  try {
    const updateData: UpdateUserDto = {
      username: formData.value.username,
      firstName: formData.value.firstName || undefined,
      lastName: formData.value.lastName || undefined,
      bio: formData.value.bio || undefined,
      role: formData.value.role
    }

    await usersApi.updateUser(selectedUser.value.id, updateData)

    isEditModalOpen.value = false
    await loadUsers()

    toast.add({
      title: 'Успех',
      description: 'Пользователь обновлен',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось обновить пользователя',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async () => {
  if (!selectedUser.value) return

  isLoading.value = true

  try {
    await usersApi.deleteUser(selectedUser.value.id)

    isDeleteModalOpen.value = false
    await loadUsers()

    toast.add({
      title: 'Успех',
      description: 'Пользователь удален',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить пользователя',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Валидация формы
const isFormValid = computed(() => {
  if (isCreateModalOpen.value) {
    return !!(formData.value.username && formData.value.email && formData.value.password)
  }
  return !!(formData.value.username && formData.value.email)
})

// Наблюдение за пагинацией
watch([currentPage, pageSize], () => {
  loadUsers()
})

// Загрузка при монтировании
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Пользователи
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление пользователями системы
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Новый пользователь
      </UButton>
    </div>

    <!-- Search -->
    <UCard>
      <div class="flex items-center justify-between gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по имени, email или username..."
          icon="i-lucide-search"
          class="max-w-md w-full"
          @update:model-value="handleSearch"
        />

        <div class="text-sm text-muted-foreground whitespace-nowrap">
          Всего: {{ totalUsersCount }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="filteredUsers"
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
          {{ Math.min(currentPage * pageSize, totalUsersCount) }}
          из
          {{ totalUsersCount }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalUsersCount"
        />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal
      v-model:open="isCreateModalOpen"
      :ui="{
        content: 'max-w-lg w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Создание пользователя
            </h2>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="createUser"
          >
            <UFormField label="Username" name="username" required>
              <UInput
                v-model="formData.username"
                placeholder="john_doe"
              />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput
                v-model="formData.email"
                type="email"
                placeholder="user@example.com"
              />
            </UFormField>

            <UFormField label="Имя" name="firstName">
              <UInput
                v-model="formData.firstName"
                placeholder="Введите имя"
              />
            </UFormField>

            <UFormField label="Фамилия" name="lastName">
              <UInput
                v-model="formData.lastName"
                placeholder="Введите фамилию"
              />
            </UFormField>

            <UFormField label="Пароль" name="password" required>
              <UInput
                v-model="formData.password"
                type="password"
                placeholder="Введите пароль"
              />
            </UFormField>

            <UFormField label="Роль" name="role">
              <USelect
                v-model="formData.role"
                :items="[
                  { label: 'Пользователь', value: 'user' },
                  { label: 'Администратор', value: 'admin' }
                ]"
              />
            </UFormField>

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

    <!-- Edit Modal -->
    <UModal
      v-model:open="isEditModalOpen"
      :ui="{
        content: 'max-w-lg w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Редактирование пользователя
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ selectedUser?.email }}
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="updateUser"
          >
            <UFormField label="Username" name="username" required>
              <UInput v-model="formData.username" />
            </UFormField>

            <UFormField label="Email" name="email" required>
              <UInput
                v-model="formData.email"
                type="email"
              />
            </UFormField>

            <UFormField label="Имя" name="firstName">
              <UInput v-model="formData.firstName" />
            </UFormField>

            <UFormField label="Фамилия" name="lastName">
              <UInput v-model="formData.lastName" />
            </UFormField>

            <UFormField label="О себе" name="bio">
              <UTextarea
                v-model="formData.bio"
                placeholder="Расскажите о себе"
                :rows="3"
              />
            </UFormField>

            <UFormField label="Роль" name="role">
              <USelect
                v-model="formData.role"
                :items="[
                  { label: 'Пользователь', value: 'user' },
                  { label: 'Администратор', value: 'admin' }
                ]"
              />
            </UFormField>

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
      :ui="{
        content: 'max-w-md w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">
            Подтверждение удаления
          </h2>

          <p>
            Вы уверены, что хотите удалить пользователя
            <strong>{{ selectedUser?.username }}</strong>?
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
              @click="deleteUser"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
