<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <UIcon name="i-lucide-wifi-off" class="h-24 w-24 text-zinc-400 mb-4" />
    <h1 class="text-2xl font-bold text-zinc-900 mb-2">Нет соединения</h1>
    <p class="text-zinc-600 mb-6">Проверьте подключение к интернету</p>
    <Button @click="() => window.location.reload()">
      Попробовать снова
    </Button>
  </div>
</template>
