<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <USkeleton class="w-full h-48 rounded-none" />
    <div class="p-5 space-y-3">
      <div class="flex items-center gap-2">
        <USkeleton class="h-4 w-24 rounded" />
        <USkeleton class="h-4 w-4 rounded-full" />
        <USkeleton class="h-4 w-20 rounded" />
      </div>
      <USkeleton class="h-6 w-3/4 rounded" />
      <div class="space-y-2">
        <USkeleton class="h-4 w-full rounded" />
        <USkeleton class="h-4 w-2/3 rounded" />
        <USkeleton class="h-4 w-1/2 rounded" />
      </div>
      <USkeleton class="h-4 w-24 rounded" />
    </div>
  </div>
</template>
