<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<template>
  <section class="grid gap-5">
    <h1 class="text-3xl font-black">Модерация комментариев</h1>
    <ModerateCommentTable />
  </section>
</template>
