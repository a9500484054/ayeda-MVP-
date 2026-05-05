<script setup lang="ts">
definePageMeta({ layout: "cabinet" });
</script>

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
