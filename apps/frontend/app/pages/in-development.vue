<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4">
    <div class="text-center max-w-lg mx-auto">
      <!-- Акцентный элемент -->
      <div class="mb-10">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
          <!-- <UIcon name="i-lucide-codesandbox" class="w-8 h-8 text-white" /> -->
          <UIcon name="i-lucide-utensils" class="w-12 h-12 text-white" />
        </div>
      </div>

      <!-- Заголовок -->
      <h1 class="text-4xl md:text-5xl font-black mb-4">
        <span class="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">В</span>
        <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> разработке</span>
      </h1>

      <p class="text-gray-500 text-lg mb-8 leading-relaxed">
        Мы работаем над этим разделом,<br>
        чтобы сделать его полезным для вас.
      </p>

      <!-- Прогресс -->
      <!-- <div class="max-w-xs mx-auto mb-10">
        <div class="flex justify-between text-sm text-gray-400 mb-2">
          <span>Готовность</span>
          <span class="text-emerald-600 font-semibold">73%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full" style="width: 73%"></div>
        </div>
      </div> -->

      <!-- Кнопка -->
      <ULink to="/">
        <UButton class="!rounded-full !bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white hover:!shadow-lg !px-8 !py-2.5 cursor-pointer transition">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          На главную
        </UButton>
      </ULink>
    </div>
  </div>
</template>
