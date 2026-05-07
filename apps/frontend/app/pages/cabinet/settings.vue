<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Настройки профиля</h1>
      <p class="text-gray-500 mt-2">Управляйте информацией о себе и настройками аккаунта</p>
    </div>

    <!-- Блок с аватаром и основной информацией -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Аватар -->
        <div class="relative">
          <div class="relative">
            <UAvatar
              :src="avatarPreview || undefined"
              :alt="userStore.user?.username"
              size="3xl"
              class="w-24 h-24 md:w-28 md:h-28 ring-4 ring-white shadow-lg"
            />
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
              :disabled="isUploadingAvatar"
            />
            <UButton
              @click="avatarInput?.click()"
              icon="i-lucide-camera"
              size="lg"
              color="primary"
              :loading="isUploadingAvatar"
              :disabled="isUploadingAvatar"
              class="absolute bottom-0 right-0 rounded-full shadow-lg cursor-pointer"
            />
          </div>
          <div v-if="avatarPreview && !isUploadingAvatar" class="text-center mt-2">
            <UButton
              @click="removeAvatar"
              size="xs"
              color="error"
              variant="outline"
              :loading="isDeletingAvatar"
              class="cursor-pointer"
            >
              Удалить
            </UButton>
          </div>
        </div>

        <!-- Информация -->
        <div class="flex-1 text-center md:text-left">
          <div class="flex items-center gap-2 justify-center md:justify-start mb-2">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ userStore.user?.firstName || userStore.user?.username }}
            </h2>
            <UBadge :color="roleBadge.color" variant="subtle" size="md">
              {{ roleBadge.label }}
            </UBadge>
          </div>
          <p class="text-gray-600 mb-1">{{ userStore.user?.email }}</p>
          <p class="text-sm text-gray-400">
            Присоединился {{ new Date(userStore.user?.createdAt).toLocaleDateString('ru-RU') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Личная информация -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">Личная информация</h3>
        <p class="text-sm text-gray-500 mt-1">Обновите информацию о себе</p>
      </div>

      <form @submit.prevent="updateProfile" class="p-6">
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Имя</label>
            <UInput
              v-model="firstName"
              v-bind="firstNameAttrs"
              placeholder="Ваше имя"
              size="lg"
              class="w-full"
            />
            <p v-if="profileErrors.firstName" class="text-xs text-red-500 mt-1">{{ profileErrors.firstName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
            <UInput
              v-model="lastName"
              v-bind="lastNameAttrs"
              placeholder="Ваша фамилия"
              size="lg"
              class="w-full"
            />
            <p v-if="profileErrors.lastName" class="text-xs text-red-500 mt-1">{{ profileErrors.lastName }}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Имя пользователя</label>
          <UInput
            :model-value="userStore.user?.username"
            disabled
            size="lg"
            class="w-full bg-gray-50"
          />
          <p class="text-xs text-gray-400 mt-1">Имя пользователя нельзя изменить</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <UInput
            :model-value="userStore.user?.email"
            disabled
            size="lg"
            class="w-full bg-gray-50"
          />
          <p class="text-xs text-gray-400 mt-1">Email нельзя изменить</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">О себе</label>
          <UTextarea
            v-model="bio"
            v-bind="bioAttrs"
            rows="4"
            placeholder="Расскажите немного о себе..."
            class="w-full"
          />
          <div class="flex justify-between mt-1">
            <p v-if="profileErrors.bio" class="text-xs text-red-500">{{ profileErrors.bio }}</p>
            <p class="text-xs text-gray-400 ml-auto">{{ bio?.length || 0 }}/500 символов</p>
          </div>
        </div>

        <div>
          <UButton
            type="submit"
            :loading="isLoadingProfile"
            color="primary"
            size="lg"
            class="w-full md:w-auto cursor-pointer"
          >
            <UIcon name="i-lucide-save" class="mr-2" />
            Сохранить изменения
          </UButton>
        </div>
      </form>
    </div>

    <!-- Безопасность -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div class="border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">Безопасность</h3>
        <p class="text-sm text-gray-500 mt-1">Измените пароль для защиты аккаунта</p>
      </div>

      <form @submit.prevent="changePassword" class="p-6">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
            <div class="relative">
              <UInput
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Введите текущий пароль"
                size="lg"
                class="w-full"
                :class="{ 'border-red-500': submitted && !currentPassword }"
              />
              <UButton
                @click="showCurrentPassword = !showCurrentPassword"
                :icon="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                size="xs"
                color="primary"
                variant="ghost"
                class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              />
            </div>
            <p v-if="submitted && !currentPassword" class="text-xs text-red-500 mt-1">Введите текущий пароль</p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <div class="relative">
                <UInput
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Новый пароль (минимум 6 символов)"
                  size="lg"
                  class="w-full"
                  :class="{ 'border-red-500': submitted && newPasswordError }"
                />
                <UButton
                  @click="showNewPassword = !showNewPassword"
                  :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  size="xs"
                  color="primary"
                  variant="ghost"
                  class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              </div>
              <p v-if="submitted && newPasswordError" class="text-xs text-red-500 mt-1">{{ newPasswordError }}</p>
              <p class="text-xs text-gray-400 mt-1">Пароль должен содержать минимум 6 символов</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Подтвердите пароль</label>
              <div class="relative">
                <UInput
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Подтвердите новый пароль"
                  size="lg"
                  class="w-full"
                  :class="{ 'border-red-500': submitted && confirmPasswordError }"
                />
                <UButton
                  @click="showConfirmPassword = !showConfirmPassword"
                  :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  size="xs"
                  color="primary"
                  variant="ghost"
                  class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              </div>
              <p v-if="submitted && confirmPasswordError" class="text-xs text-red-500 mt-1">{{ confirmPasswordError }}</p>
            </div>
          </div>

          <div>
            <UButton
              type="submit"
              :loading="isLoadingPassword"
              color="primary"
              size="lg"
              class="w-full md:w-auto"
            >
              <UIcon name="i-lucide-key" class="mr-2" />
              Сменить пароль
            </UButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/userStore";
import { useAuth } from "~/composables/useAuth";
import { useApi } from "~/composables/useApi";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({ layout: "cabinet" });

const userStore = useUserStore();
const { user } = useAuth();

// Базовый URL API
const config = useRuntimeConfig();
const API_BASE_URL = 'http://localhost:3001';

// Роли пользователя
const roleBadge = computed(() => {
  const roles: Record<string, { label: string; color: string }> = {
    admin: { label: 'Администратор', color: 'error' },
    moderator: { label: 'Модератор', color: 'secondary' },
    user: { label: 'Пользователь', color: 'success' }
  };
  return roles[userStore.user?.role || 'user'];
});

// Функция для получения полного URL аватара
const getFullAvatarUrl = (avatarPath: string | null | undefined) => {
  if (!avatarPath) return null;

  if (avatarPath.startsWith('http')) {
    if (avatarPath.includes('localhost:4000')) {
      return avatarPath.replace('localhost:4000', 'localhost:3001');
    }
    return avatarPath;
  }

  if (avatarPath.startsWith('/')) {
    return `${API_BASE_URL}${avatarPath}`;
  }

  return `${API_BASE_URL}/${avatarPath}`;
};

// Схема валидации для профиля
const profileSchema = toTypedSchema(z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500, "Максимум 500 символов").optional()
}));

// Форма профиля
const { handleSubmit: handleProfileSubmit, defineField: defineProfileField, errors: profileErrors } = useForm({
  validationSchema: profileSchema
});

// Поля профиля
const [firstName, firstNameAttrs] = defineProfileField("firstName");
const [lastName, lastNameAttrs] = defineProfileField("lastName");
const [bio, bioAttrs] = defineProfileField("bio");

// Простые reactive переменные для паролей (без vee-validate)
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const isLoadingProfile = ref(false);
const isLoadingPassword = ref(false);
const isUploadingAvatar = ref(false);
const isDeletingAvatar = ref(false);
const submitted = ref(false);
const toast = useToast();

// Avatar states
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);

// Password visibility states
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Валидация паролей
const newPasswordError = computed(() => {
  if (!submitted.value) return '';
  if (!newPassword.value) return 'Введите новый пароль';
  if (newPassword.value.length < 6) return 'Пароль должен содержать минимум 6 символов';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!submitted.value) return '';
  if (!confirmPassword.value) return 'Подтвердите пароль';
  if (newPassword.value !== confirmPassword.value) return 'Пароли не совпадают';
  return '';
});

const api = useApi();

// Загружаем данные пользователя
onMounted(() => {
  if (userStore.user) {
    firstName.value = userStore.user.firstName || '';
    lastName.value = userStore.user.lastName || '';
    bio.value = userStore.user.bio || '';
    avatarPreview.value = getFullAvatarUrl(userStore.user.avatar);
  }
});

// Очистка input
const resetAvatarInput = () => {
  if (avatarInput.value) {
    avatarInput.value.value = '';
  }
};

// Обработка загрузки аватара
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Ошибка', description: 'Пожалуйста, выберите изображение', color: 'error' });
    resetAvatarInput();
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Ошибка', description: 'Размер изображения не должен превышать 5MB', color: 'error' });
    resetAvatarInput();
    return;
  }

  avatarFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  await uploadAvatar(file);
  resetAvatarInput();
};

// Функция загрузки аватара
const uploadAvatar = async (file: File) => {
  isUploadingAvatar.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await api('/uploads', {
      method: 'POST',
      params: {
        entity: 'avatars'
      },
      body: formData
    });

    const avatarPath = uploadResponse.path || uploadResponse.url;

    const updateResponse = await api(`/users/${userStore.user?.id}`, {
      method: 'PATCH',
      body: {
        avatar: avatarPath
      }
    });

    userStore.setUser(updateResponse);
    avatarPreview.value = getFullAvatarUrl(updateResponse.avatar);
    avatarFile.value = null;

    toast.add({ title: 'Успех!', description: 'Аватар обновлен', color: 'success' });
  } catch (error: any) {
    console.error('Upload error:', error);
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || error.message || 'Не удалось обновить аватар',
      color: 'error'
    });
    avatarPreview.value = getFullAvatarUrl(userStore.user?.avatar);
    resetAvatarInput();
  } finally {
    isUploadingAvatar.value = false;
  }
};

// Удаление аватара
const removeAvatar = async () => {
  isDeletingAvatar.value = true;

  try {
    const response = await api(`/users/${userStore.user?.id}`, {
      method: 'PATCH',
      body: {
        avatar: ''
      }
    });

    userStore.setUser(response);
    avatarPreview.value = null;
    avatarFile.value = null;

    toast.add({
      title: 'Успех!',
      description: 'Аватар удален',
      color: 'success'
    });
  } catch (error: any) {
    console.error('Ошибка при удалении аватара:', error);
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || error.message || 'Не удалось удалить аватар',
      color: 'error'
    });
  } finally {
    isDeletingAvatar.value = false;
  }
};

// Обновление профиля
const updateProfile = handleProfileSubmit(async (values) => {
  isLoadingProfile.value = true;

  try {
    const response = await api(`/users/${userStore.user?.id}`, {
      method: 'PATCH',
      body: {
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio
      }
    });
    userStore.setUser(response);
    toast.add({ title: 'Успех!', description: 'Профиль обновлен', color: 'success' });
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || error.message || 'Не удалось обновить профиль',
      color: 'error'
    });
  } finally {
    isLoadingProfile.value = false;
  }
});

// Смена пароля
const changePassword = async () => {
  submitted.value = true;

  // Проверяем валидацию
  if (!currentPassword.value || !newPassword.value || newPassword.value.length < 6 || !confirmPassword.value || newPassword.value !== confirmPassword.value) {
    return;
  }

  isLoadingPassword.value = true;

  try {
    await api('/auth/change-password', {
      method: 'POST',
      body: {
        oldPassword: currentPassword.value,
        newPassword: newPassword.value
      }
    });

    toast.add({ title: 'Успех!', description: 'Пароль успешно изменен', color: 'success' });

    // Очищаем форму
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    submitted.value = false;

    // Сбросить состояние показа паролей
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || error.message || 'Не удалось изменить пароль',
      color: 'error'
    });
  } finally {
    isLoadingPassword.value = false;
  }
};
</script>

<style scoped>


/* Дополнительные стили для плавности */
:deep(.u-button) {
  transition: all 0.2s ease;
}

:deep(.u-input),
:deep(.u-textarea) {
  transition: all 0.2s ease;
}
</style>
