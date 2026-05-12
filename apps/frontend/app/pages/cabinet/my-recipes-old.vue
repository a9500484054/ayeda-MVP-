<!-- apps/frontend/app/pages/cabinet/my-recipes.vue -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- HEADER -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Мои рецепты
        </h1>

        <p v-if="totalRecipes > 0" class="mt-2 text-sm text-zinc-500">
          {{ totalRecipes }} {{ getDeclension(totalRecipes, ['рецепт', 'рецепта', 'рецептов']) }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
        <!-- Search -->
        <div class="relative min-w-[280px]">
          <UIcon name="i-lucide-search" class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск моих рецептов..."
            class="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            @click="clearSearch"
          >
            <UIcon name="i-lucide-x" class="h-4 w-4" />
          </button>
        </div>

        <!-- View Switch -->
        <div class="hidden sm:block ml-auto">
          <div class="flex h-11 items-center rounded-2xl border border-zinc-200 bg-white p-1">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="currentView === 'grid-small' ? 'bg-green-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'"
              title="Компактная сетка"
              @click="setView('grid-small')"
            >
              <UIcon name="i-lucide-grid-3x3" class="h-4 w-4" />
            </button>
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="currentView === 'grid-large' ? 'bg-green-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'"
              title="Большая сетка"
              @click="setView('grid-large')"
            >
              <UIcon name="i-lucide-grid-2x2" class="h-4 w-4" />
            </button>
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="currentView === 'list' ? 'bg-green-600 text-white shadow-sm' : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'"
              title="Список"
              @click="setView('list')"
            >
              <UIcon name="i-lucide-list" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Create Button -->
        <button
          class="flex h-11 items-center gap-2 rounded-2xl bg-green-600 px-5 text-sm font-medium text-white transition-all hover:bg-green-700"
          @click="openCreateModal"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          <span>Создать рецепт</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-zinc-200">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-4 py-2 text-sm font-medium transition-all rounded-t-lg"
          :class="activeTab === tab.value ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'"
          @click="activeTab = tab.value; fetchRecipes(true)"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="text-xs text-zinc-400">({{ tab.count }})</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending && page === 1" class="flex flex-col items-center justify-center py-28">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      <p class="mt-4 text-sm text-zinc-500">Загрузка рецептов...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="recipes.length === 0" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24">
      <UIcon :name="activeTab === 'favorites' ? 'i-lucide-star' : 'i-lucide-cooking-pot'" class="h-16 w-16 text-zinc-300" />
      <h2 class="mt-5 text-xl font-semibold text-zinc-900">
        {{ emptyStateTitle }}
      </h2>
      <p class="mt-2 text-sm text-zinc-500">
        {{ emptyStateDescription }}
      </p>
      <button
        v-if="activeTab === 'my' && searchQuery"
        class="mt-6 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        @click="clearSearch"
      >
        Очистить поиск
      </button>
      <button
        v-if="activeTab === 'my' && !searchQuery"
        class="mt-6 rounded-2xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700"
        @click="openCreateModal"
      >
        Создать первый рецепт
      </button>
    </div>

    <!-- Recipes -->
    <div v-else :class="containerClass">
      <div
        v-for="recipe in recipes"
        :key="recipe.id"
        class="group relative rounded-xl border border-zinc-200 bg-white overflow-hidden transition-all hover:shadow-md"
      >
        <!-- Image -->
        <div class="relative aspect-video overflow-hidden bg-zinc-100 cursor-pointer" @click="goToRecipe(recipe)">
          <img
            :src="getImageUrl(recipe.photo?.src)"
            :alt="recipe.title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            @error="handleImageError"
          />
          <!-- Status Badge -->
          <div class="absolute left-2 top-2">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="statusBadgeClass(recipe.status)"
            >
              {{ getStatusLabel(recipe.status) }}
            </span>
          </div>
          <!-- Actions -->
          <div class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="rounded-lg bg-white p-1.5 text-zinc-600 shadow-sm transition hover:bg-zinc-100"
              @click.stop="openEditModal(recipe)"
            >
              <UIcon name="i-lucide-edit-2" class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded-lg bg-white p-1.5 text-red-500 shadow-sm transition hover:bg-red-50"
              @click.stop="confirmDelete(recipe)"
            >
              <UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <h3
              class="flex-1 cursor-pointer text-base font-semibold text-zinc-900 line-clamp-1 hover:text-green-600 transition"
              @click="goToRecipe(recipe)"
            >
              {{ recipe.title }}
            </h3>
            <button
              v-if="activeTab !== 'favorites'"
              class="flex-shrink-0 text-zinc-400 transition hover:text-amber-500"
              :class="{ 'text-amber-500': isFavorite(recipe.id) }"
              @click.stop="toggleFavoriteFromList(recipe.id)"
            >
              <UIcon :name="isFavorite(recipe.id) ? 'i-lucide-star' : 'i-lucide-star'" :class="{ 'fill-amber-500': isFavorite(recipe.id) }" class="h-4 w-4" />
            </button>
          </div>

          <p v-if="recipe.description" class="mt-1 text-sm text-zinc-500 line-clamp-2">
            {{ recipe.description }}
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
              <span>{{ recipe.cookingTime }} мин</span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-users" class="h-3 w-3" />
              <span>{{ recipe.servings }} порц</span>
            </div>
            <div v-if="recipe.calories" class="flex items-center gap-1">
              <UIcon name="i-lucide-flame" class="h-3 w-3" />
              <span>{{ recipe.calories }} ккал</span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-heart" class="h-3 w-3" />
              <span>{{ recipe.likes || 0 }}</span>
            </div>
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-message-circle" class="h-3 w-3" />
              <span>{{ recipe.commentsCount || 0 }}</span>
            </div>
          </div>

          <div v-if="recipe.categories?.length" class="mt-3 flex flex-wrap gap-1">
            <span
              v-for="cat in recipe.categories.slice(0, 3)"
              :key="cat.id"
              class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {{ cat.name }}
            </span>
            <span v-if="recipe.categories.length > 3" class="text-xs text-zinc-400">
              +{{ recipe.categories.length - 3 }}
            </span>
          </div>

          <div class="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
            <span class="text-zinc-400">
              {{ formatDate(recipe.createdAt) }}
            </span>
            <button
              v-if="recipe.status === 'draft'"
              class="text-green-600 hover:text-green-700 font-medium"
              @click.stop="submitForModeration(recipe)"
            >
              Отправить на модерацию
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasNext" class="mt-14 flex justify-center">
      <button
        class="flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-800 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <UIcon v-if="loadingMore" name="i-lucide-loader-circle" class="h-4 w-4 animate-spin" />
        <span>{{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}</span>
      </button>
    </div>

    <div v-else-if="recipes.length" class="mt-14 flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
      <UIcon name="i-lucide-check-check" class="h-4 w-4" />
      <span>Вы просмотрели все рецепты</span>
    </div>

    <!-- Recipe Form Slideover -->
    <USlideover
      :open="isModalOpen"
      @update:open="handleModalClose"
      :ui="{ content: 'max-w-4xl w-full overflow-y-auto' }"
    >
      <template #content>
        <div class="flex flex-col max-h-[100vh]">
          <!-- Header -->
          <div class="px-6 py-4 border-b flex items-center justify-between">
            <h2 class="text-2xl font-semibold">
              {{ modalTitle }}
            </h2>
            <button
              class="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
              @click="closeModal"
            >
              <UIcon name="i-lucide-x" class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form class="flex-1 overflow-y-auto" @submit.prevent="handleSubmit">
            <div class="p-6">
              <!-- Media -->
              <div class="rounded-2xl border p-5 space-y-4">
                <h3 class="text-lg font-medium">Обложка рецепта</h3>

                <UFormField label="Фото">
                  <div class="space-y-3">
                    <UButton
                      block
                      @click="mainFileInput?.click()"
                      color="neutral"
                      variant="outline"
                      :loading="isFileUploading"
                    >
                      Загрузить фото
                    </UButton>

                    <input
                      ref="mainFileInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleMainPhotoUpload"
                    />

                    <div v-if="formData.photo?.src" class="rounded-xl overflow-hidden border max-h-48 max-w-sm mx-auto">
                      <img :src="`${API_BASE_URL}${formData.photo.src}`" class="w-full h-auto object-cover" />
                    </div>
                  </div>
                </UFormField>
              </div>

              <!-- Main Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column (2/3) -->
                <div class="lg:col-span-2 space-y-6">
                  <!-- Basic Info -->
                  <div class="rounded-2xl border p-5 space-y-4">
                    <h3 class="text-lg font-medium">Основная информация</h3>

                    <UFormField label="Название" required :error="errors.title">
                      <UInput
                        v-model="formData.title"
                        placeholder="Введите название рецепта"
                        class="w-full"
                        @input="onTitleChange"
                      />
                    </UFormField>

                    <UFormField label="Описание" :error="errors.description">
                      <UTextarea v-model="formData.description" :rows="5" placeholder="Введите описание рецепта" />
                    </UFormField>

                    <UFormField label="URL путь" :error="errors.srcPath">
                      <UInput v-model="formData.srcPath" placeholder="автоматически генерируется" />
                      <div class="text-xs text-zinc-400 mt-1">Оставьте пустым для автогенерации</div>
                    </UFormField>
                  </div>

                  <!-- Categories -->
                  <div class="rounded-2xl border p-5">
                    <UFormField label="Категории" required :error="errors.categoryIds">
                      <div class="space-y-2">
                        <USelect
                          v-model="selectedCategory"
                          :items="categoryItems"
                          placeholder="Выберите категорию..."
                          class="w-full"
                          @update:model-value="addCategory"
                        />
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="catId in formData.categoryIds"
                            :key="catId"
                            class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                          >
                            {{ getCategoryName(catId) }}
                            <button type="button" @click="removeCategory(catId)" class="hover:text-green-900">
                              <UIcon name="i-lucide-x" class="h-3 w-3" />
                            </button>
                          </span>
                        </div>
                      </div>
                      <div class="text-xs text-zinc-400 mt-1">Можно выбрать до 5 категорий</div>
                    </UFormField>
                  </div>
                </div>

                <!-- Right Column (1/3) -->
                <div class="space-y-6">
                  <!-- Parameters -->
                  <div class="rounded-2xl border p-5 space-y-4">
                    <h3 class="text-lg font-medium">Параметры</h3>

                    <UFormField label="Сложность" required :error="errors.difficulty">
                      <USelect v-model="formData.difficulty" :items="difficultyItems" />
                    </UFormField>

                    <div class="grid grid-cols-2 gap-4">
                      <UFormField label="Время (мин)" :error="errors.cookingTime">
                        <UInput v-model.number="formData.cookingTime" type="number" min="1" />
                      </UFormField>

                      <UFormField label="Порции" :error="errors.servings">
                        <UInput v-model.number="formData.servings" type="number" min="1" />
                      </UFormField>
                    </div>

                    <UFormField label="Калории (ккал)" :error="errors.calories">
                      <UInput v-model.number="formData.calories" type="number" min="0" />
                    </UFormField>

                    <UFormField label="Тип">
                      <USelect v-model="formData.type" :items="typeItems" />
                    </UFormField>

                    <UFormField label="Статус" required :error="errors.status">
                      <USelect v-model="formData.status" :items="statusItems" />
                    </UFormField>
                  </div>

                  <!-- Media Extra -->
                  <div class="rounded-2xl border p-5">
                    <h3 class="text-lg font-medium mb-5">Медиа</h3>
                    <UFormField label="Видео">
                      <UInput v-model="formData.video" placeholder="https://youtube.com/..." />
                    </UFormField>
                  </div>
                </div>
              </div>

              <!-- Ingredients -->
              <div class="rounded-2xl border p-5 mt-5">
                <UFormField required :error="errors.ingredients">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-medium">Ингредиенты</h3>
                      <UButton size="sm" variant="ghost" @click="addIngredient">+ Добавить ингредиент</UButton>
                    </div>

                    <div v-for="(ing, idx) in formData.ingredients" :key="idx" class="flex flex-wrap gap-3 items-end p-3 bg-zinc-50 rounded-lg">
                      <div class="flex-1 min-w-[150px]">
                        <label class="text-xs font-medium text-zinc-600">Ингредиент</label>
                        <USelect
                          v-model="ing.ingredientId"
                          :items="ingredientItems"
                          placeholder="Выберите ингредиент"
                          @search="handleIngredientSearch"
                          searchable
                        />
                      </div>
                      <div class="w-24">
                        <label class="text-xs font-medium text-zinc-600">Кол-во</label>
                        <UInput v-model.number="ing.amount" type="number" step="0.1" />
                      </div>
                      <div class="w-24">
                        <label class="text-xs font-medium text-zinc-600">Ед. изм.</label>
                        <USelect v-model="ing.unitId" :items="unitItems" placeholder="Ед." />
                      </div>
                      <div class="flex-1 min-w-[120px]">
                        <label class="text-xs font-medium text-zinc-600">Примечание</label>
                        <UInput v-model="ing.notes" placeholder="по желанию" />
                      </div>
                      <UButton size="sm" color="neutral" variant="ghost" @click="removeIngredient(idx)">
                        <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                      </UButton>
                    </div>

                    <div v-if="formData.ingredients.length === 0" class="text-center py-8 text-zinc-400">
                      <UIcon name="i-lucide-package" class="h-10 w-10 mx-auto mb-2" />
                      <p class="text-sm">Добавьте ингредиенты</p>
                    </div>
                  </div>
                </UFormField>
              </div>

              <!-- Steps -->
              <div class="rounded-2xl border p-5 mt-5">
                <UFormField required :error="errors.steps">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-medium">Шаги приготовления</h3>
                      <UButton size="sm" variant="ghost" @click="addStep">+ Добавить шаг</UButton>
                    </div>

                    <div v-for="(step, idx) in formData.steps" :key="idx" class="p-4 border rounded-lg space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="font-medium">Шаг {{ idx + 1 }}</span>
                        <UButton size="sm" color="neutral" variant="ghost" @click="removeStep(idx)">
                          <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                        </UButton>
                      </div>
                      <UTextarea v-model="step.text" :rows="3" placeholder="Опишите шаг приготовления..." />
                      <div>
                        <UButton size="sm" variant="outline" @click="stepFileInputs[idx]?.click()" :loading="stepUploading[idx]">
                          {{ step.image ? 'Изменить фото' : 'Добавить фото' }}
                        </UButton>
                        <input
                          :ref="el => setStepFileInputRef(el, idx)"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleStepPhotoUpload($event, idx)"
                        />
                        <div v-if="step.image" class="mt-2 rounded-lg overflow-hidden max-h-32 w-32">
                          <img :src="`${API_BASE_URL}${step.image}`" class="w-full h-auto object-cover" />
                        </div>
                      </div>
                    </div>

                    <div v-if="formData.steps.length === 0" class="text-center py-8 text-zinc-400">
                      <UIcon name="i-lucide-clipboard-list" class="h-10 w-10 mx-auto mb-2" />
                      <p class="text-sm">Добавьте шаги приготовления</p>
                    </div>
                  </div>
                </UFormField>
              </div>

              <!-- SEO -->
              <div class="rounded-2xl border p-5 mt-5">
                <h3 class="text-lg font-medium mb-4">SEO настройки</h3>
                <UFormField label="SEO заголовок">
                  <UInput v-model="formData.seo.title" placeholder="Заголовок для поисковых систем" />
                  <div class="text-xs text-zinc-400 mt-1">Максимум 70 символов</div>
                </UFormField>
                <UFormField label="SEO описание" class="mt-4">
                  <UTextarea v-model="formData.seo.description" :rows="2" placeholder="Описание для поисковых систем" />
                  <div class="text-xs text-zinc-400 mt-1">Максимум 160 символов</div>
                </UFormField>
                <UFormField label="Ключевые слова" class="mt-4">
                  <div class="space-y-2">
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(keyword, idx) in formData.seo.keywords"
                        :key="idx"
                        class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-sm"
                      >
                        {{ keyword }}
                        <button type="button" @click="removeKeyword(idx)" class="hover:text-zinc-700">
                          <UIcon name="i-lucide-x" class="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <UInput v-model="newKeyword" placeholder="Добавить ключевое слово" @keyup.enter="addKeyword" />
                      <UButton @click="addKeyword">Добавить</UButton>
                    </div>
                  </div>
                </UFormField>
              </div>
            </div>

            <!-- Sticky Footer -->
            <div class="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur px-6 py-4">
              <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="ghost" @click="closeModal">Отмена</UButton>
                <UButton type="submit" color="primary" :loading="isSubmitting" :disabled="!isFormValid">
                  {{ mode === 'edit' ? 'Сохранить изменения' : 'Создать рецепт' }}
                </UButton>
              </div>
            </div>
          </form>
        </div>
      </template>
    </USlideover>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal" :ui="{ content: 'max-w-md' }">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold">Удалить рецепт?</h3>
          </div>
          <p class="text-zinc-600 mb-6">
            Вы уверены, что хотите удалить рецепт "{{ recipeToDelete?.title }}"? Это действие нельзя отменить.
          </p>
          <div class="flex gap-3 justify-end">
            <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Отмена</UButton>
            <UButton color="error" :loading="isDeleting" @click="deleteRecipe">Удалить</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRecipesApi, type RecipeResponse, type CreateRecipeDto, type UpdateRecipeDto } from '~/composables/useRecipesApi'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
import { useIngredientsApi } from '~/composables/useIngredientsApi'
import { useUnitsApi, type Unit } from '~/composables/useUnitsApi'
import { useFileUpload } from '~/composables/useFileUpload'
import transliterateRussian from '~/shared/utils/transliterateRussian'

definePageMeta({
  layout: 'cabinet',
})

const router = useRouter()
const config = useRuntimeConfig()
const { isAuthenticated, user } = useAuth()
const recipesApi = useRecipesApi()
const favoritesApi = useRecipesFavorites()
const categoriesApi = useCategoriesApi()
const ingredientsApi = useIngredientsApi()
const unitsApi = useUnitsApi()
const { upload, isUploading: isFileUploading } = useFileUpload()

const API_BASE_URL = 'http://localhost:3001'

// State
const recipes = ref<RecipeResponse[]>([])
const loadingMore = ref(false)
const searchQuery = ref('')
const currentView = ref<'grid-large' | 'grid-small' | 'list'>('grid-large')
const page = ref(1)
const total = ref(0)
const hasNext = ref(false)
const pending = ref(false)
const activeTab = ref<'my' | 'favorites'>('my')
const favoriteIds = ref<Set<string>>(new Set())

// Modal state
const isModalOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editingRecipe = ref<RecipeResponse | null>(null)
const isSubmitting = ref(false)
const selectedCategory = ref<string | null>(null)

// Delete modal
const showDeleteModal = ref(false)
const recipeToDelete = ref<RecipeResponse | null>(null)
const isDeleting = ref(false)

// Search debounce
let searchDebounceTimer: NodeJS.Timeout | null = null

// Tabs
const tabs = [
  { value: 'my', label: 'Мои рецепты', icon: 'i-lucide-book-open', count: computed(() => total.value) },
  { value: 'favorites', label: 'Избранное', icon: 'i-lucide-star' },
]

const emptyStateTitle = computed(() => {
  if (activeTab.value === 'favorites') return 'Нет избранных рецептов'
  if (searchQuery.value) return 'Рецепты не найдены'
  return 'У вас пока нет рецептов'
})

const emptyStateDescription = computed(() => {
  if (activeTab.value === 'favorites') return 'Добавляйте рецепты в избранное, чтобы они появлялись здесь'
  if (searchQuery.value) return 'Попробуйте изменить поисковый запрос'
  return 'Создайте свой первый рецепт и поделитесь им с сообществом'
})

// Form data
const formData = ref({
  title: '',
  description: '',
  categoryIds: [] as string[],
  cookingTime: 30,
  servings: 4,
  calories: 0,
  photo: { id: '', src: '' },
  video: '',
  ingredients: [] as any[],
  steps: [] as any[],
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  type: 'personal' as 'personal' | 'community',
  status: 'private' as 'draft' | 'private' | 'pending' | 'public' | 'rejected',
  srcPath: '',
  seo: {
    title: '',
    description: '',
    keywords: [] as string[]
  }
})

const errors = ref<Record<string, string>>({})
const newKeyword = ref('')

// Data for selects
const categories = ref<any[]>([])
const allIngredients = ref<any[]>([])
const units = ref<Unit[]>([])
const ingredientsLoading = ref(false)

const categoryItems = computed(() => categories.value.map(c => ({ label: c.name, value: c.id })))
const ingredientItems = computed(() => allIngredients.value.map(i => ({ label: i.name, value: i.id })))
const unitItems = computed(() => units.value.map(u => ({ label: u.shortName || u.name, value: u.id })))

const difficultyItems = [
  { label: 'Легко', value: 'easy' },
  { label: 'Средне', value: 'medium' },
  { label: 'Сложно', value: 'hard' }
]

const typeItems = [
  { label: 'Личный', value: 'personal' },
  { label: 'Сообщества', value: 'community' }
]

const statusItems = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Приватный', value: 'private' },
  { label: 'На модерации', value: 'pending' },
  { label: 'Опубликован', value: 'public' },
  { label: 'Отклонен', value: 'rejected' }
]

const modalTitle = computed(() => mode.value === 'edit' ? 'Редактировать рецепт' : 'Создать рецепт')
const isFormValid = computed(() => {
  return !!(formData.value.title &&
    formData.value.categoryIds.length > 0 &&
    formData.value.ingredients.length > 0 &&
    formData.value.steps.length > 0)
})

const containerClass = computed(() => {
  if (currentView.value === 'list') return 'grid grid-cols-1 gap-4 md:grid-cols-2'
  if (currentView.value === 'grid-small') return 'grid grid-cols-1 gap-5 sm:grid-cols-3 xl:grid-cols-4'
  return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-3'
})

// Step photo upload refs
const stepFileInputs = ref<(HTMLInputElement | null)[]>([])
const stepUploading = ref<boolean[]>([])
const mainFileInput = ref<HTMLInputElement>()

const setStepFileInputRef = (el: any, idx: number) => {
  if (el) stepFileInputs.value[idx] = el
}

// Computed
const totalRecipes = computed(() => total.value)

// Methods
const getDeclension = (count: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2]
  return words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[count % 10 < 5 ? count % 10 : 5]]
}

const getImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
}

const statusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    private: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-blue-100 text-blue-700',
    public: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return classes[status] || classes.draft
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    private: 'Приватный',
    pending: 'На модерации',
    public: 'Опубликован',
    rejected: 'Отклонен'
  }
  return labels[status] || status
}

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes} мин назад`
    }
    return `${hours} ч назад`
  } else if (days === 1) {
    return 'вчера'
  } else if (days < 7) {
    return `${days} дн назад`
  }
  return d.toLocaleDateString('ru-RU')
}

const getCategoryName = (id: string) => {
  const cat = categories.value.find(c => c.id === id)
  return cat?.name || id
}

const isFavorite = (recipeId: string) => favoriteIds.value.has(recipeId)

// API Calls
const fetchRecipes = async (reset = false) => {
  if (reset) {
    page.value = 1
    recipes.value = []
  }

  const isLoadingMore = !reset && page.value > 1

  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    pending.value = true
  }

  try {
    let response

    if (activeTab.value === 'favorites') {
      // For favorites, we need to get favorites first then fetch recipes
      const favorites = await favoritesApi.getUserFavorites(user.value?.id || '')
      const favoriteRecipes = favorites.data || favorites
      if (reset || page.value === 1) {
        recipes.value = favoriteRecipes
      } else {
        recipes.value.push(...favoriteRecipes)
      }
      total.value = favoriteRecipes.length
      hasNext.value = false
    } else {
      response = await recipesApi.getRecipes({
        page: page.value,
        limit: 12,
        search: searchQuery.value || undefined,
      })
      if (reset || page.value === 1) {
        recipes.value = response.data
      } else {
        recipes.value.push(...response.data)
      }
      total.value = response.total
      hasNext.value = response.hasNext
    }
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    if (isLoadingMore) {
      loadingMore.value = false
    } else {
      pending.value = false
    }
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value) return
  page.value++
  await fetchRecipes(false)
}

const onSearchInput = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => fetchRecipes(true), 400)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchRecipes(true)
}

const setView = (view: 'grid-large' | 'grid-small' | 'list') => {
  currentView.value = view
  if (process.client) localStorage.setItem('recipesView', view)
}

const goToRecipe = (recipe: RecipeResponse) => {
  if (recipe.srcPath) {
    navigateTo(`/recipes/${recipe.srcPath}`)
  } else {
    navigateTo(`/recipes/${recipe.id}`)
  }
}

const toggleFavoriteFromList = async (recipeId: string) => {
  if (!isAuthenticated.value) {
    alert('Пожалуйста, войдите в аккаунт')
    return
  }
  try {
    await favoritesApi.toggleFavorite(recipeId)
    if (favoriteIds.value.has(recipeId)) {
      favoriteIds.value.delete(recipeId)
      if (activeTab.value === 'favorites') {
        await fetchRecipes(true)
      }
    } else {
      favoriteIds.value.add(recipeId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const loadFavoriteIds = async () => {
  if (!isAuthenticated.value) return
  try {
    const favorites = await favoritesApi.getUserFavorites(user.value?.id || '')
    const favoriteRecipes = favorites.data || favorites
    favoriteIds.value = new Set(favoriteRecipes.map((r: any) => r.id))
  } catch (error) {
    console.error('Error loading favorites:', error)
  }
}

const submitForModeration = async (recipe: RecipeResponse) => {
  try {
    await recipesApi.submitForModeration(recipe.id)
    await fetchRecipes(true)
  } catch (error) {
    console.error('Error submitting for moderation:', error)
  }
}

// Modal methods
const openCreateModal = () => {
  mode.value = 'create'
  editingRecipe.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (recipe: RecipeResponse) => {
  mode.value = 'edit'
  editingRecipe.value = recipe
  loadRecipeToForm(recipe)
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const handleModalClose = (open: boolean) => {
  if (!open) closeModal()
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    categoryIds: [],
    cookingTime: 30,
    servings: 4,
    calories: 0,
    photo: { id: '', src: '' },
    video: '',
    ingredients: [],
    steps: [],
    difficulty: 'medium',
    type: 'personal',
    status: 'private',
    srcPath: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  }
  errors.value = {}
  selectedCategory.value = null
}

const loadRecipeToForm = (recipe: RecipeResponse) => {
  formData.value = {
    title: recipe.title || '',
    description: recipe.description || '',
    categoryIds: recipe.categories?.map(c => c.id) || [],
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    calories: recipe.calories || 0,
    photo: recipe.photo || { id: '', src: '' },
    video: recipe.video || '',
    ingredients: recipe.ingredients?.map((ing: any) => ({
      ingredientId: ing.ingredient?.id || ing.ingredientId,
      amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 0),
      unitId: ing.unitId || ing.ingredient?.unitId,
      notes: ing.notes || ''
    })) || [],
    steps: recipe.steps?.map((step: any, idx: number) => ({
      sort: step.sort || idx + 1,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: recipe.difficulty || 'medium',
    type: recipe.type === 'community' ? 'community' : 'personal',
    status: recipe.status || 'private',
    srcPath: recipe.srcPath || '',
    seo: recipe.seo || {
      title: '',
      description: '',
      keywords: []
    }
  }
}

const onTitleChange = () => {
  if (formData.value.title && mode.value === 'create') {
    formData.value.srcPath = transliterateRussian(formData.value.title)
    if (!formData.value.seo.title) {
      formData.value.seo.title = formData.value.title
    }
  }
}

// Categories
const addCategory = () => {
  if (selectedCategory.value && !formData.value.categoryIds.includes(selectedCategory.value) && formData.value.categoryIds.length < 5) {
    formData.value.categoryIds.push(selectedCategory.value)
    selectedCategory.value = null
  }
}

const removeCategory = (id: string) => {
  formData.value.categoryIds = formData.value.categoryIds.filter(c => c !== id)
}

// Ingredients
const addIngredient = () => {
  formData.value.ingredients.push({
    ingredientId: '',
    amount: 1,
    unitId: '',
    notes: ''
  })
}

const removeIngredient = (index: number) => {
  formData.value.ingredients.splice(index, 1)
}

// Steps
const addStep = () => {
  stepUploading.value.push(false)
  stepFileInputs.value.push(null)
  formData.value.steps.push({
    sort: formData.value.steps.length + 1,
    text: '',
    image: ''
  })
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  stepUploading.value.splice(index, 1)
  stepFileInputs.value.splice(index, 1)
  // Re-sort steps
  formData.value.steps.forEach((step, idx) => { step.sort = idx + 1 })
}

// Keywords
const addKeyword = () => {
  if (newKeyword.value.trim() && formData.value.seo.keywords.length < 10) {
    formData.value.seo.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
  }
}

const removeKeyword = (index: number) => {
  formData.value.seo.keywords.splice(index, 1)
}

// File uploads
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    alert('Можно загружать только изображения')
    return false
  }
  if (!isLt5M) {
    alert('Размер изображения не должен превышать 5MB')
    return false
  }
  return true
}

const handleMainPhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !beforeUpload(file)) return

  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.photo = {
        id: response.id || '',
        src: response.path
      }
    }
  } catch (error: any) {
    alert(error.message || 'Не удалось загрузить фото')
  }
  target.value = ''
}

const handleStepPhotoUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !beforeUpload(file)) return

  stepUploading.value[index] = true
  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.steps[index].image = response.path
    }
  } catch (error: any) {
    alert(error.message || 'Не удалось загрузить фото')
  } finally {
    stepUploading.value[index] = false
  }
  target.value = ''
}

// Search ingredients
const handleIngredientSearch = async (query: string) => {
  if (!query || query.length < 2) return
  ingredientsLoading.value = true
  try {
    const response = await ingredientsApi.searchIngredients(query, 1, 20)
    allIngredients.value = response.data || []
  } catch (error) {
    console.error('Error searching ingredients:', error)
  } finally {
    ingredientsLoading.value = false
  }
}

// Submit form
const handleSubmit = async () => {
  if (!validateForm()) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  isSubmitting.value = true

  const submitData = {
    title: formData.value.title,
    description: formData.value.description || undefined,
    categoryIds: formData.value.categoryIds,
    cookingTime: formData.value.cookingTime,
    servings: formData.value.servings,
    calories: formData.value.calories || undefined,
    difficulty: formData.value.difficulty,
    type: formData.value.type,
    status: formData.value.status,
    photo: formData.value.photo.src ? formData.value.photo : undefined,
    video: formData.value.video || undefined,
    steps: formData.value.steps.map(step => ({
      sort: step.sort,
      text: step.text,
      image: step.image || undefined
    })),
    srcPath: formData.value.srcPath || undefined,
    ingredients: formData.value.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount,
      unitId: ing.unitId || undefined,
      notes: ing.notes || undefined
    })),
  }

  try {
    if (mode.value === 'edit' && editingRecipe.value) {
      await recipesApi.updateRecipe(editingRecipe.value.id, submitData as UpdateRecipeDto)
    } else {
      await recipesApi.createRecipe(submitData as CreateRecipeDto)
    }
    closeModal()
    await fetchRecipes(true)
    await loadFavoriteIds()
  } catch (error: any) {
    console.error('Error saving recipe:', error)
    alert(error.message || 'Ошибка при сохранении рецепта')
  } finally {
    isSubmitting.value = false
  }
}

const validateForm = () => {
  if (!formData.value.title) return false
  if (formData.value.categoryIds.length === 0) return false
  if (formData.value.ingredients.length === 0) return false
  for (const ing of formData.value.ingredients) {
    if (!ing.ingredientId) return false
    if (!ing.amount || ing.amount <= 0) return false
  }
  if (formData.value.steps.length === 0) return false
  for (const step of formData.value.steps) {
    if (!step.text) return false
  }
  return true
}

// Delete recipe
const confirmDelete = (recipe: RecipeResponse) => {
  recipeToDelete.value = recipe
  showDeleteModal.value = true
}

const deleteRecipe = async () => {
  if (!recipeToDelete.value) return
  isDeleting.value = true
  try {
    await recipesApi.deleteRecipe(recipeToDelete.value.id)
    showDeleteModal.value = false
    await fetchRecipes(true)
    await loadFavoriteIds()
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    alert(error.message || 'Ошибка при удалении рецепта')
  } finally {
    isDeleting.value = false
    recipeToDelete.value = null
  }
}

// Load initial data
const loadInitialData = async () => {
  // Load categories
  try {
    const catsResponse = await categoriesApi.getCategories(1, 100)
    categories.value = catsResponse.data || catsResponse.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  // Load units
  try {
    units.value = await unitsApi.getUnits()
  } catch (error) {
    console.error('Error loading units:', error)
  }

  // Initial load of ingredients
  try {
    const ingredientsResponse = await ingredientsApi.getIngredients(1, 100)
    allIngredients.value = ingredientsResponse.data || []
  } catch (error) {
    console.error('Error loading ingredients:', error)
  }
}

// Watch active tab
watch(activeTab, () => {
  fetchRecipes(true)
})

onMounted(async () => {
  const savedView = localStorage.getItem('recipesView')
  if (savedView === 'grid-large' || savedView === 'grid-small' || savedView === 'list') {
    currentView.value = savedView
  }

  await loadInitialData()
  await loadFavoriteIds()
  await fetchRecipes(true)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
