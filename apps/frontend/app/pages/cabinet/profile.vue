<template>
  <section class="grid gap-5">
    <h1 class="text-3xl font-black">Профиль</h1>
    <form class="panel grid max-w-2xl gap-4 p-5">
      <input class="h-11 rounded-lg border border-gray-300 px-3" placeholder="Username">
      <input class="h-11 rounded-lg border border-gray-300 px-3" placeholder="Имя">
      <input class="h-11 rounded-lg border border-gray-300 px-3" placeholder="Фамилия">
      <textarea class="min-h-28 rounded-lg border border-gray-300 p-3" placeholder="Bio" />
      <button class="btn-primary w-fit" type="button">Сохранить</button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: "cabinet" });

useHead({
  title: 'Профиль',
  meta: [
    { name: 'description', content: 'Управляйте своим профилем: редактируйте личную информацию, имя, фамилию и биографию.', key: 'description' },
    { name: 'robots', content: 'noindex, follow', key: 'robots' },
    // OG теги для соцсетей
    { property: 'og:title', content: 'Профиль | АуЕда', key: 'og:title' },
    { property: 'og:description', content: 'Управляйте своим профилем на АуЕда', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/logo.png', key: 'og:image' },
    { property: 'og:image:alt', content: 'Профиль пользователя на АуЕда', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/cabinet/profile', key: 'og:url' },
    { property: 'og:site_name', content: 'АуЕда', key: 'og:site_name' },
  ],
})
</script>
