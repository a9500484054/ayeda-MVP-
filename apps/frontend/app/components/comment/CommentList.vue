<script setup lang="ts">
import type { CommentDto } from "~/shared/types/domain";

const props = defineProps<{
  comments: CommentDto[];
}>();
</script>

<template>
  <section class="panel p-5">
    <h2 class="text-2xl font-bold">Комментарии</h2>
    <CommentItem v-for="comment in props.comments" :key="comment.id" :comment="comment" />
  </section>
</template>
