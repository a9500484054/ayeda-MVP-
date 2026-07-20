<!-- d:\Новая папка\Работа\ayeda-MVP-\apps\frontend\app\pages\pricing.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-emerald-50/20">
    <!-- Основной контент -->
    <main class="pt-16 pb-20">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <!-- Заголовок -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-4">
            <UIcon name="i-lucide-credit-card" class="w-4 h-4 text-emerald-600" />
            <span class="text-sm font-semibold text-emerald-600">Выберите свой план</span>
          </div>
          <h1 class="text-4xl lg:text-6xl font-black mb-4">
            Простые и прозрачные
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">тарифы</span>
          </h1>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto">
            Начните бесплатно, а когда будете готовы — выберите тариф, который подходит именно вам
          </p>
        </div>

        <!-- Переключатель периода -->
        <div class="flex justify-center mb-12">
          <div class="bg-gray-100 rounded-full p-1 inline-flex items-center gap-1">
            <button
              @click="billingPeriod = 'monthly'"
              :class="[
                'px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Ежемесячно
            </button>
            <button
              @click="billingPeriod = 'annual'"
              :class="[
                'px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                billingPeriod === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Годовой
              <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Скидка 20%</span>
            </button>
          </div>
        </div>

        <!-- Тарифы -->
        <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
          <!-- Базовый -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300">
            <div class="mb-4">
              <span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Стартовый</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Базовый</h3>
            <p class="text-gray-500 text-sm mb-6">Идеально для знакомства с сервисом</p>
            <div class="mb-6">
              <span class="text-4xl font-black">0 ₽</span>
              <span class="text-gray-500 text-sm ml-1">/ месяц</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Планирование до 7 дней</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>До 10 сохраненных рецептов</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Список покупок</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-400">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span>AI-рекомендации</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-400">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span>Приоритетная поддержка</span>
              </li>
            </ul>
            <button
              @click="handleSelectTariff('basic')"
              class="w-full py-3 px-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Начать бесплатно
            </button>
          </div>

          <!-- Премиум -->
          <div class="bg-white rounded-2xl border-2 border-emerald-400 p-6 lg:p-8 relative shadow-lg shadow-emerald-100/50 hover:shadow-xl transition-shadow duration-300">
            <!-- Популярный бейдж -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                Самый популярный
              </span>
            </div>

            <div class="mb-4">
              <span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Рекомендуемый</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Премиум</h3>
            <p class="text-gray-500 text-sm mb-6">Максимальный комфорт и возможности</p>
            <div class="mb-6">
              <span class="text-4xl font-black">
                {{ billingPeriod === 'monthly' ? '499' : '399' }} ₽
              </span>
              <span class="text-gray-500 text-sm ml-1">/ месяц</span>
              <div v-if="billingPeriod === 'annual'" class="text-xs text-emerald-600 mt-1">
                Экономия 1 200 ₽ в год
              </div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Безлимитное планирование</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Безлимитные рецепты</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>AI-рекомендации блюд</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Приоритетная поддержка 24/7</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Экспорт в PDF и печать</span>
              </li>
            </ul>
            <button
              @click="handleSelectTariff('premium')"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Начать премиум
            </button>
          </div>

          <!-- Семейный -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300">
            <div class="mb-4">
              <span class="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Для всей семьи</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Семейный</h3>
            <p class="text-gray-500 text-sm mb-6">Совместное планирование для всей семьи</p>
            <div class="mb-6">
              <span class="text-4xl font-black">
                {{ billingPeriod === 'monthly' ? '899' : '719' }} ₽
              </span>
              <span class="text-gray-500 text-sm ml-1">/ месяц</span>
              <div v-if="billingPeriod === 'annual'" class="text-xs text-emerald-600 mt-1">
                Экономия 2 160 ₽ в год
              </div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Всё из Премиум-тарифа</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>До 5 пользователей</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Общий список покупок</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Доступ к меню всей семьи</span>
              </li>
              <li class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Отдельные профили и настройки</span>
              </li>
            </ul>
            <button
              @click="handleSelectTariff('family')"
              class="w-full py-3 px-4 rounded-xl border-2 border-purple-200 font-semibold text-purple-700 hover:bg-purple-50 transition-colors duration-200"
            >
              Выбрать семейный
            </button>
          </div>
        </div>

        <!-- Сравнение тарифов -->
        <div class="mt-20">
          <h2 class="text-2xl font-bold text-center mb-8">Сравните все возможности</h2>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="text-left p-4 text-sm font-semibold text-gray-600">Функция</th>
                  <th class="text-center p-4 text-sm font-semibold text-gray-600">Базовый</th>
                  <th class="text-center p-4 text-sm font-semibold text-emerald-600 bg-emerald-50/50">Премиум</th>
                  <th class="text-center p-4 text-sm font-semibold text-gray-600">Семейный</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr>
                  <td class="p-4 text-sm text-gray-600">Планирование меню</td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">Список покупок</td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">Количество рецептов</td>
                  <td class="text-center p-4 text-sm text-gray-500">До 10</td>
                  <td class="text-center p-4 text-sm font-semibold text-emerald-600">Безлимитно</td>
                  <td class="text-center p-4 text-sm font-semibold text-gray-600">Безлимитно</td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">AI-рекомендации</td>
                  <td class="text-center p-4 text-gray-300"><UIcon name="i-lucide-x" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">Приоритетная поддержка</td>
                  <td class="text-center p-4 text-gray-300"><UIcon name="i-lucide-x" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">Количество пользователей</td>
                  <td class="text-center p-4 text-sm text-gray-500">1</td>
                  <td class="text-center p-4 text-sm text-gray-500">1</td>
                  <td class="text-center p-4 text-sm font-semibold text-gray-600">До 5</td>
                </tr>
                <tr>
                  <td class="p-4 text-sm text-gray-600">Общее меню и список</td>
                  <td class="text-center p-4 text-gray-300"><UIcon name="i-lucide-x" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-gray-300"><UIcon name="i-lucide-x" class="w-5 h-5 mx-auto" /></td>
                  <td class="text-center p-4 text-emerald-500"><UIcon name="i-lucide-check" class="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr class="bg-gray-50/50">
                  <td class="p-4 text-sm font-semibold text-gray-900">Цена</td>
                  <td class="text-center p-4 text-sm font-bold">0 ₽</td>
                  <td class="text-center p-4 text-sm font-bold text-emerald-600">
                    {{ billingPeriod === 'monthly' ? '499' : '399' }} ₽
                  </td>
                  <td class="text-center p-4 text-sm font-bold text-gray-700">
                    {{ billingPeriod === 'monthly' ? '899' : '719' }} ₽
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
  
useHead({
  title: 'Тарифы и цены | АуЕда',
  meta: [
    { name: 'description', content: 'Выберите подходящий тариф для планирования питания. Базовый, Премиум или Семейный. Начните с 14-дневного пробного периода бесплатно.', key: 'description' },
    { name: 'keywords', content: 'тарифы, цены, подписка, премиум, семейный план, бесплатно, пробный период', key: 'keywords' },
    { name: 'robots', content: 'index, follow', key: 'robots' },
    { property: 'og:title', content: 'Тарифы и цены | АуЕда', key: 'og:title' },
    { property: 'og:description', content: 'Выберите подходящий тариф для планирования питания', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/logo.png', key: 'og:image' },
    { property: 'og:url', content: 'https://ayeda.ru/pricing', key: 'og:url' },
    { property: 'og:site_name', content: 'АуЕда', key: 'og:site_name' },
    { name: 'twitter:card', content: 'summary_large_image', key: 'twitter:card' },
    { name: 'twitter:title', content: 'Тарифы и цены | АуЕда', key: 'twitter:title' },
    { name: 'twitter:description', content: 'Выберите подходящий тариф для планирования питания', key: 'twitter:description' },
  ],
  link: [
    { rel: 'canonical', href: 'https://ayeda.ru/pricing', key: 'canonical' },
  ],
})

const billingPeriod = ref<'monthly' | 'annual'>('monthly')
const faqOpen = ref<number | null>(null)

const faqItems = [
  {
    question: 'Можно ли отменить подписку в любой момент?',
    answer: 'Да, вы можете отменить подписку в любой момент в настройках своего профиля. После отмены доступ к платным функциям сохраняется до конца оплаченного периода.'
  },
  {
    question: 'Что входит в пробный период?',
    answer: 'Пробный период длится 14 дней и даёт полный доступ ко всем функциям Премиум-тарифа. Вы можете пользоваться сервисом бесплатно и принять решение о покупке подписки в любой момент.'
  },
  {
    question: 'Можно ли перейти на другой тариф?',
    answer: 'Да, вы можете сменить тариф в любой момент. При переходе на более дорогой тариф разница списывается пропорционально оставшемуся периоду. При переходе на более дешёвый — разница возвращается на внутренний счёт.'
  },
  {
    question: 'Безопасны ли мои данные?',
    answer: 'Мы используем современные методы шифрования и строго соблюдаем политику конфиденциальности. Ваши данные никогда не передаются третьим лицам без вашего согласия.'
  },
  {
    question: 'Подходит ли сервис для веганов и людей с аллергией?',
    answer: 'Да! В настройках профиля вы можете указать диетические предпочтения, аллергии и ограничения. AI-рекомендации автоматически учитывают все ваши потребности.'
  }
]

const toggleFaq = (index: number) => {
  faqOpen.value = faqOpen.value === index ? null : index
}

const handleSelectTariff = (tariff: string) => {
  // Логика перехода к оформлению тарифа
  console.log(`Выбран тариф: ${tariff}, период: ${billingPeriod.value}`)
  // Можно использовать useRouter для перехода на страницу оплаты
  // const router = useRouter()
  // router.push(`/checkout?plan=${tariff}&period=${billingPeriod.value}`)
}
</script>

<style scoped>
/* Кастомный скроллбар */
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

/* Плавные переходы для таблицы */
table {
  border-radius: 12px;
  overflow: hidden;
}

table th {
  font-weight: 600;
}

/* Анимация для FAQ */
button .i-lucide-chevron-up,
button .i-lucide-chevron-down {
  transition: transform 0.2s ease;
}

/* Адаптив для таблицы */
@media (max-width: 640px) {
  table td, table th {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
