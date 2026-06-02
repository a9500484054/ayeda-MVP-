<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-darkMode-700">Настройки профиля</h1>
      <p class="text-gray-500 dark:text-darkMode-500 mt-2">Управляйте информацией о себе и настройками аккаунта</p>
    </div>

    <!-- Блок с аватаром и основной информацией -->
    <div class="bg-white dark:bg-darkMode-100 rounded-2xl shadow-sm border border-gray-100 dark:border-darkMode-300 p-6 mb-6">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Аватар -->
        <div class="relative">
          <div class="relative">
            <div class="w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-white dark:ring-darkMode-200 shadow-lg overflow-hidden bg-gray-100 dark:bg-darkMode-200">
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                :alt="userStore.user?.username"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                <span class="text-white text-3xl font-medium">
                  {{ userStore.user?.firstName?.[0] || userStore.user?.username?.[0] || '?' }}
                </span>
              </div>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
              :disabled="isUploadingAvatar"
            />
            <Button
              @click="avatarInput?.click()"
              icon="i-lucide-camera"
              size="md"
              color="primary"
              :loading="isUploadingAvatar"
              :disabled="isUploadingAvatar"
              class="absolute bottom-0 right-0 rounded-full shadow-lg"
              icon-only
            />
          </div>
          <div v-if="avatarPreview && !isUploadingAvatar" class="text-center mt-2">
            <Button
              @click="removeAvatar"
              size="sm"
              color="danger"
              variant="outline"
              :loading="isDeletingAvatar"
            >
              Удалить
            </Button>
          </div>
        </div>

        <!-- Информация -->
        <div class="flex-1 text-center md:text-left">
          <div class="flex items-center gap-2 justify-center md:justify-start mb-2">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-darkMode-700">
              {{ userStore.user?.firstName || userStore.user?.username }}
            </h2>
            <div :class="roleBadgeClass" class="px-2 py-0.5 rounded-md text-xs font-medium">
              {{ roleBadge.label }}
            </div>
          </div>
          <p class="text-gray-600 dark:text-darkMode-500 mb-1">{{ userStore.user?.email }}</p>
          <p class="text-sm text-gray-400 dark:text-darkMode-400">
            Присоединился {{ formatDate(userStore.user?.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Личная информация -->
    <div class="bg-white dark:bg-darkMode-100 rounded-2xl shadow-sm border border-gray-100 dark:border-darkMode-300 mb-6 overflow-hidden">
      <div class="border-b border-gray-100 dark:border-darkMode-300 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-darkMode-700">Личная информация</h3>
        <p class="text-sm text-gray-500 dark:text-darkMode-500 mt-1">Обновите информацию о себе</p>
      </div>

      <form @submit.prevent="updateProfile" class="p-6">
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя</label>
            <Input
              v-model="firstName"
              placeholder="Ваше имя"
              :error="profileErrors.firstName"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фамилия</label>
            <Input
              v-model="lastName"
              placeholder="Ваша фамилия"
              :error="profileErrors.lastName"
            />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя пользователя</label>
          <Input
            :model-value="userStore.user?.username"
            disabled
            class="bg-gray-50 dark:bg-darkMode-200"
          />
          <p class="text-xs text-gray-400 dark:text-darkMode-400 mt-1">Имя пользователя нельзя изменить</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <Input
            :model-value="userStore.user?.email"
            disabled
            class="bg-gray-50 dark:bg-darkMode-200"
          />
          <p class="text-xs text-gray-400 dark:text-darkMode-400 mt-1">Email нельзя изменить</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">О себе</label>
          <Textarea
            v-model="bio"
            :rows="4"
            placeholder="Расскажите немного о себе..."
            :error="profileErrors.bio"
            :hint="`${bio?.length || 0}/500 символов`"
          />
        </div>

        <div>
          <Button
            type="submit"
            :loading="isLoadingProfile"
            color="primary"
            size="lg"
            icon="i-lucide-save"
            class="w-full md:w-auto"
          >
            Сохранить изменения
          </Button>
        </div>
      </form>
    </div>

    <!-- Безопасность -->
    <div class="bg-white dark:bg-darkMode-100 rounded-2xl shadow-sm border border-gray-100 dark:border-darkMode-300 mb-6 overflow-hidden">
      <div class="border-b border-gray-100 dark:border-darkMode-300 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-darkMode-700">Безопасность</h3>
        <p class="text-sm text-gray-500 dark:text-darkMode-500 mt-1">Измените пароль для защиты аккаунта</p>
      </div>

      <form @submit.prevent="changePassword" class="p-6">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Текущий пароль</label>
            <div class="relative">
              <Input
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Введите текущий пароль"
                :error="submitted && !currentPassword ? 'Введите текущий пароль' : ''"
              >
                <template #rightIcon>
                  <Button
                    @click="showCurrentPassword = !showCurrentPassword"
                    :icon="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon-only
                  />
                </template>
              </Input>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Новый пароль</label>
              <div class="relative">
                <Input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Новый пароль (минимум 6 символов)"
                  :error="submitted && newPasswordError"
                  hint="Пароль должен содержать минимум 6 символов"
                >
                  <template #rightIcon>
                    <Button
                      @click="showNewPassword = !showNewPassword"
                      :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon-only
                    />
                  </template>
                </Input>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Подтвердите пароль</label>
              <div class="relative">
                <Input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Подтвердите новый пароль"
                  :error="submitted && confirmPasswordError"
                >
                  <template #rightIcon>
                    <Button
                      @click="showConfirmPassword = !showConfirmPassword"
                      :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon-only
                    />
                  </template>
                </Input>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              :loading="isLoadingPassword"
              color="primary"
              size="lg"
              icon="i-lucide-key"
              class="w-full md:w-auto"
            >
              Сменить пароль
            </Button>
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
import Button from "~/shared/ui/button/Button.vue";
import Input from "~/shared/ui/input/Input.vue";
import Textarea from "~/shared/ui/textarea/Textarea.vue";

definePageMeta({ layout: "cabinet" });

useHead({
  title: 'Настройки профиля',
  meta: [
    { name: 'description', content: 'Управляйте своим профилем: редактируйте личную информацию, меняйте аватар, обновляйте пароль и настройки аккаунта.', key: 'description' },
    { name: 'robots', content: 'noindex, follow', key: 'robots' },
    // OG теги для соцсетей
    { property: 'og:title', content: 'Настройки профиля | АУеда', key: 'og:title' },
    { property: 'og:description', content: 'Управляйте своим профилем на АУеда: информация, аватар, безопасность', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/logo.png', key: 'og:image' },
    { property: 'og:image:alt', content: 'Настройки профиля на АУеда', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/cabinet/profile', key: 'og:url' },
    { property: 'og:site_name', content: 'АУеда', key: 'og:site_name' },
  ],
})

const userStore = useUserStore();
const { user } = useAuth();

// Базовый URL API
const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Роли пользователя
const roleBadge = computed(() => {
  const roles: Record<string, { label: string; color: string }> = {
    admin: { label: 'Администратор', color: 'error' },
    moderator: { label: 'Модератор', color: 'secondary' },
    user: { label: 'Пользователь', color: 'success' }
  };
  return roles[userStore.user?.role || 'user'];
});

const roleBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  };
  return classes[roleBadge.value.color] || classes.success;
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

// Форматирование даты
const formatDate = (date: string | undefined) => {
  if (!date) return 'неизвестно';
  return new Date(date).toLocaleDateString('ru-RU');
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
