<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Демо стенд</h1>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="demo in demos"
        :key="demo.path"
        :to="demo.path"
        class="block p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <UIcon :name="demo.icon" class="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{{ demo.name }}</h3>
            <p class="text-xs text-gray-500">{{ demo.path }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'cabinet' })

const demos = [
  { name: 'Button', path: '/demo/button', icon: 'i-lucide-square' },
  { name: 'Input', path: '/demo/input', icon: 'i-lucide-square' },
  { name: 'Textarea', path: '/demo/textarea', icon: 'i-lucide-square' },
  { name: 'Select', path: '/demo/select', icon: 'i-lucide-square' },
  { name: 'Checkbox', path: '/demo/checkbox', icon: 'i-lucide-square' },
  { name: 'Modal', path: '/demo/modal', icon: 'i-lucide-square' },
  { name: 'Slideover', path: '/demo/slideover', icon: 'i-lucide-square' },
  { name: 'Confirm Modal', path: '/demo/confirm-modal', icon: 'i-lucide-square' },
  { name: 'Empty State', path: '/demo/empty-state', icon: 'i-lucide-square' },
  { name: 'Skeleton', path: '/demo/skeleton', icon: 'i-lucide-square' },
  { name: 'Loader', path: '/demo/loader', icon: 'i-lucide-square' },
  { name: 'View Toggle', path: '/demo/view-toggle', icon: 'i-lucide-square' },
  { name: 'Search Input', path: '/demo/search-input', icon: 'i-lucide-square' },
  { name: 'Category Select', path: '/demo/category-select', icon: 'i-lucide-square' },
  { name: 'Ingredients List', path: '/demo/ingredients-list', icon: 'i-lucide-square' },
  { name: 'Steps List', path: '/demo/steps-list', icon: 'i-lucide-square' },
  { name: 'Image Uploader', path: '/demo/image-uploader', icon: 'i-lucide-square' },
  { name: 'Number Stepper', path: '/demo/number-stepper', icon: 'i-lucide-square' },
  { name: 'Icons', path: '/demo/icons', icon: 'i-lucide-square' },
]
</script>
