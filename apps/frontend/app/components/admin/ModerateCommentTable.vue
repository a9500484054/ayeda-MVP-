<script setup lang="ts">
import { demoComments } from "~/composables/useDemoContent";
</script>

<template>
  <div class="panel overflow-x-auto">
    <table class="w-full text-left">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="p-3">Автор</th>
          <th class="p-3">Комментарий</th>
          <th class="p-3">Статус</th>
          <th class="p-3">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in demoComments" :key="comment.id" class="border-b border-gray-100">
          <td class="p-3">{{ comment.author.username }}</td>
          <td class="p-3">{{ comment.text }}</td>
          <td class="p-3">{{ comment.isHidden ? "Скрыт" : "Виден" }}</td>
          <td class="p-3"><button class="btn-secondary" type="button">Скрыть</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
