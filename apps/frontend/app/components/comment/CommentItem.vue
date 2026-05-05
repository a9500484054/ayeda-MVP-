<script setup lang="ts">
import type { CommentDto } from "~/shared/types/domain";
import { formatDate } from "~/utils/formatDate";

const props = defineProps<{
  comment: CommentDto;
}>();
</script>

<template>
  <article class="border-b border-gray-200 py-4 last:border-b-0">
    <div class="flex items-center justify-between gap-4">
      <strong>{{ props.comment.author.username }}</strong>
      <time class="text-sm text-gray-500">{{ formatDate(props.comment.createdAt) }}</time>
    </div>
    <p class="mt-2 text-gray-700">{{ props.comment.text }}</p>
  </article>
</template>
