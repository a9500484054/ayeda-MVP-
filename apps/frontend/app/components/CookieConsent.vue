<script setup lang="ts">
const showBanner = ref(true)

onMounted(() => {
  if (localStorage.getItem('cookies-accepted')) {
    showBanner.value = false
  }
})

const accept = () => {
  localStorage.setItem('cookies-accepted', 'true')
  showBanner.value = false
}
</script>

<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <p class="text-gray-600 text-center sm:text-left">
        🍪 Мы используем cookies для улучшения работы сайта.
        <NuxtLink to="/policy" class="text-emerald-600 hover:underline ml-1">Подробнее</NuxtLink>
      </p>
      <button
        @click="accept"
        class="px-5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition whitespace-nowrap"
      >
        Принять
      </button>
    </div>
  </div>
</template>
