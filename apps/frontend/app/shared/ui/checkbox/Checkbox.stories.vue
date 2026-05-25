<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkbox - Демонстрация</h1>

      <div class="space-y-6">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Базовый Checkbox</h3>
          <Checkbox v-model="basicValue" label="Согласен с условиями" />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ basicValue }}</p>
        </div>

        <!-- Группа -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Группа чекбоксов</h3>
          <div class="space-y-3">
            <Checkbox v-model="interests.tech" label="Технологии" />
            <Checkbox v-model="interests.sports" label="Спорт" />
            <Checkbox v-model="interests.music" label="Музыка" />
          </div>
          <p class="text-sm text-gray-500 mt-2">Выбрано: {{ Object.entries(interests).filter(([, v]) => v).map(([k]) => k).join(', ') || 'ничего' }}</p>
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С ошибкой</h3>
          <Checkbox v-model="errorValue" label="Согласен с условиями" error="Необходимо согласие" />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disabled</h3>
          <div class="space-y-3">
            <Checkbox v-model="disabledChecked" label="Активный (включен)" disabled />
            <Checkbox v-model="disabledUnchecked" label="Неактивный (выключен)" disabled />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Checkbox from './Checkbox.vue'

const basicValue = ref(false)
const errorValue = ref(false)
const disabledChecked = ref(true)
const disabledUnchecked = ref(false)

const interests = ref({
  tech: true,
  sports: false,
  music: false
})
</script>
