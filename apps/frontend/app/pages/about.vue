<template>
  <div class="min-h-screen bg-white">

    <main class="pt-16 pb-20">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <!-- Заголовок -->
        <div class="mb-12">
          <div class="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-4">
            <UIcon name="i-lucide-heart" class="w-4 h-4 text-emerald-600" />
            <span class="text-sm font-semibold text-emerald-600">О нас</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-black mb-4">
            О
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">проекте</span>
          </h1>
        </div>

        <!-- Миссия -->
        <div class="mb-12">
          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
            <div class="text-4xl mb-3">🎯</div>
            <h2 class="text-2xl font-bold mb-3">Наша миссия</h2>
            <p class="text-gray-700 text-lg leading-relaxed">
              Сделать планирование питания простым, быстрым и приятным для каждой семьи.
              Мы верим, что правильное питание не должно быть источником стресса.
            </p>
          </div>
        </div>

        <!-- История -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-4">История создания</h2>
          <div class="prose prose-gray max-w-none">
            <p class="text-gray-600 mb-4">
              АуЕда родилась из личного опыта. Основатели проекта, как и многие, сталкивались
              с ежедневной проблемой: "Что приготовить?". Бесконечные походы в магазин,
              спонтанные заказы доставки и портящиеся продукты в холодильнике.
            </p>
            <p class="text-gray-600 mb-4">
              Мы поняли, что проблема не в отсутствии рецептов, а в отсутствии системы.
              Так появилась идея создать сервис, который поможет планировать питание
              легко и без лишних усилий.
            </p>
            <p class="text-gray-600">
              Сегодня АуЕда помогает тысячам семей экономить время, деньги и нервы,
              наслаждаясь вкусной и здоровой едой каждый день.
            </p>
          </div>
        </div>

        <!-- Ценности -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Наши ценности</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="text-3xl mb-3">⚡</div>
              <h3 class="font-bold mb-2">Простота</h3>
              <p class="text-sm text-gray-500">Интуитивно понятный интерфейс без лишних сложностей</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="text-3xl mb-3">🕐</div>
              <h3 class="font-bold mb-2">Экономия времени</h3>
              <p class="text-sm text-gray-500">Автоматизация рутинных процессов планирования</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="text-3xl mb-3">💚</div>
              <h3 class="font-bold mb-2">Здоровье</h3>
              <p class="text-sm text-gray-500">Помощь в формировании здоровых привычек питания</p>
            </div>
          </div>
        </div>

        <!-- Команда -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Наша команда</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div v-for="member in team" :key="member.name" class="text-center">
              <div class="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-3">
                {{ member.name[0] }}
              </div>
              <h3 class="font-bold">{{ member.name }}</h3>
              <p class="text-sm text-gray-500">{{ member.role }}</p>
            </div>
          </div>
        </div>

        <!-- Цифры -->
        <div class="mb-12">
          <div class="bg-gray-900 rounded-2xl p-8 text-white">
            <div class="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-3xl font-black text-emerald-400">15,000+</div>
                <div class="text-sm text-gray-400">пользователей</div>
              </div>
              <div>
                <div class="text-3xl font-black text-emerald-400">500+</div>
                <div class="text-sm text-gray-400">рецептов</div>
              </div>
              <div>
                <div class="text-3xl font-black text-emerald-400">94%</div>
                <div class="text-sm text-gray-400">остаются с нами</div>
              </div>
              <div>
                <div class="text-3xl font-black text-emerald-400">5★</div>
                <div class="text-sm text-gray-400">средняя оценка</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center">
          <h3 class="text-2xl font-bold text-white mb-3">Присоединяйтесь к нам</h3>
          <p class="text-emerald-100 mb-6">Начните планировать питание с удовольствием уже сегодня</p>
          <ULink to="/register">
            <UButton class="!rounded-full !bg-white !text-emerald-600 hover:!bg-gray-100 !px-6">
              Начать бесплатно
              <UIcon name="i-lucide-arrow-right" class="ml-2 w-4 h-4" />
            </UButton>
          </ULink>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const team = [
  { name: 'Алексей Иванов', role: 'Основатель' },
  { name: 'Мария Петрова', role: 'Product Manager' },
  { name: 'Дмитрий Сидоров', role: 'Lead Developer' }
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #10b981, #14b8a6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #059669, #0d9488);
}
</style>
