<template>
  <div class="overflow-hidden">
    <!-- HERO - Эмоциональный удар первой секунды -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <!-- Декоративные элементы -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-emerald-50 via-teal-50 to-transparent rounded-full blur-3xl opacity-60"></div>
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-3xl opacity-40"></div>

      <div class="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Левая часть - Продающий текст -->
          <div class="space-y-8">
            <!-- Главный заголовок с подсветкой -->
            <div class="space-y-4 animate-fade-in-up animation-delay-100">
              <h1 class="text-5xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight">
                <span class="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Перестаньте</span>
                <br />
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              гадать, что съесть
                </span>
              </h1>
              <p class="text-xl text-gray-600 leading-relaxed max-w-lg">
            AyEda - ваш шеф-повар, который планирует меню,
            <span class="font-semibold text-gray-800">экономит 5 часов в неделю</span>
            и убирает пищевой стресс навсегда.
              </p>
            </div>

            <!-- Конверсионная форма (главный CTA) -->
            <div class="space-y-4 animate-fade-in-up animation-delay-200">
              <div class="flex flex-col sm:flex-row gap-3">
                <!-- <div class="relative flex-1">
                  <UIcon name="i-lucide-mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Ваш email"
                    class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                  />
                </div> -->
                <ULink to="/register">
                  <UButton class="!rounded-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white !py-4 !px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 !text-lg font-semibold group cursor-pointer">
                    Начать планировать
                    <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </UButton>
                </ULink>
              </div>

            </div>

            <!-- Дополнительные преимущества -->
            <div class="flex gap-6 pt-4 animate-fade-in-up animation-delay-300">
              <!-- <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span class="text-amber-600 font-bold">4.9</span>
                </div>
                <div>
                  <div class="flex text-amber-400">
                    <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-3 h-3 fill-current" />
                  </div>
                  <span class="text-xs text-gray-500">на основе 847 отзывов</span>
                </div>
              </div>
              <div class="w-px bg-gray-200"></div> -->
              <!-- <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="w-5 h-5 text-emerald-600" />
                <div>
                  <div class="font-bold text-gray-900">12 минут</div>
                  <span class="text-xs text-gray-500">на планирование недели</span>
                </div>
              </div> -->
            </div>
          </div>

          <!-- Правая часть - Визуальная демонстрация продукта -->
          <div class="relative animate-fade-in-right">
            <!-- Основной виджет -->
            <div class="relative z-10 bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <!-- AI Badge -->
              <div class="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                <!-- 🤖 AI план -->
                🤖 план
              </div>

              <!-- Демо меню -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-gray-900">Ваша неделя питания</h3>
                  <UBadge class="!bg-emerald-100 !text-emerald-700">Баланс 95%</UBadge>
                </div>

                <div v-for="day in demoWeek" :key="day.name" class="group cursor-pointer">
                  <div class="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-all">
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-sm font-bold text-emerald-600 w-12">{{ day.name }}</span>
                      <div>
                        <div class="font-medium text-gray-900">{{ day.lunch }}</div>
                        <div class="text-xs text-gray-500">{{ day.dinner }}</div>
                      </div>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600">🛒 В список покупок:</span>
                    <span class="font-semibold text-emerald-600">24 ингредиента</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Декоративные элементы -->
            <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-200 rounded-full blur-2xl opacity-50"></div>
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-amber-200 rounded-full blur-2xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== ПРОБЛЕМА → РЕШЕНИЕ ========== -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/80" id="features">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Трансформация
        </span>
        <h2 class="text-4xl md:text-5xl font-black leading-tight">
          Как Ay<span class="text-emerald-400">Eda</span>
          меняет вашу жизнь
        </h2>
      </div>

      <div class="grid lg:grid-cols-2 gap-8 items-stretch">
        <!-- Блок "Без AyEda" -->
        <div class="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-red-200/50">
          <!-- Декоративный элемент -->
          <div class="absolute -top-3 -left-3 w-24 h-24 bg-red-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

          <div class="relative">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                😫
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800">Без AyEda</h3>
                <p class="text-sm text-gray-500">Как вы живете сейчас</p>
              </div>
            </div>

            <div class="space-y-3">
              <div v-for="problem in problems" :key="problem"
                  class="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50/50 to-rose-50/30 rounded-xl border border-red-100/50 group-hover:border-red-200 transition-all">
                <span class="text-red-400 text-lg leading-none mt-0.5">✕</span>
                <span class="text-gray-700 text-sm">{{ problem.text }}</span>
              </div>
            </div>

            <div class="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">⏱️ Потеря времени</span>
                <span class="text-sm font-bold text-red-500">~10 часов/неделю</span>
              </div>
              <div class="w-full bg-red-200/50 rounded-full h-2.5 overflow-hidden">
                <div class="bg-gradient-to-r from-red-400 to-rose-400 h-2.5 rounded-full w-[85%] animate-progress"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-400 mt-1.5">
                <span>0%</span>
                <span>Вы теряете время</span>
                <span>100%</span>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <span class="w-2 h-2 rounded-full bg-gray-300"></span>
              <span>Стресс и хаос в каждом дне</span>
            </div>
          </div>
        </div>

        <!-- Блок "С AyEda" -->
        <div class="group relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">

          <div class="relative">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg">
                ✨
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">С AyEda</h3>
                <p class="text-sm text-emerald-100/80">Новый уровень жизни</p>
              </div>
            </div>

            <div class="space-y-3">
              <div v-for="solution in solutions" :key="solution"
                  class="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all group-hover:border-white/20">
                <span class="text-emerald-300 text-lg leading-none mt-0.5">✓</span>
                <span class="text-white text-sm font-medium">{{ solution.text }}</span>
              </div>
            </div>

            <div class="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-emerald-100">⏱️ Экономия времени</span>
                <span class="text-sm font-bold text-white">~12 минут/неделю</span>
              </div>
              <div class="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div class="bg-white h-2.5 rounded-full w-[8%] animate-progress-reverse"></div>
              </div>
              <div class="flex justify-between text-xs text-emerald-200/60 mt-1.5">
                <span>0%</span>
                <span>Минимум времени</span>
                <span>100%</span>
              </div>
            </div>

            <ULink to="/register">
              <UButton class="w-full mt-6 py-4 bg-white text-emerald-700 rounded-xl font-bold transition-all duration-300 hover:bg-emerald-50 hover:shadow-xl hover:scale-[1.02] group-hover:shadow-2xl cursor-pointer relative overflow-hidden">
                <span class="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                <span class="flex items-center justify-center gap-3 relative">
                  <span class="text-xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                  <span class="font-semibold group-hover:tracking-wider transition-all duration-300">Начать экономить время</span>
                  <UIcon name="i-lucide-arrow-right" class="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </span>
              </UButton>
            </ULink>

          </div>
        </div>
      </div>

      </div>
    </section>

    <!-- ========== КАК ЭТО РАБОТАЕТ ========== -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30" id="how-it-works">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Простой процесс
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            Планируйте питание <br class="hidden sm:block" />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">в три шага</span>
          </h2>
          <p class="text-gray-500 mt-4 text-lg">От выбора блюд до готового списка покупок за 10 минут</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 relative">
          <!-- Декоративные соединительные линии -->
          <div class="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 transform -translate-y-1/2"></div>
          <div class="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-emerald-400/30 transform -translate-y-1/2 animate-pulse-line"></div>

          <div v-for="(step, index) in workflowSteps" :key="index"
              class="group relative">
            <!-- Карточка -->
            <div class="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:border-emerald-200 h-full flex flex-col items-center text-center">
              <!-- Номер с анимацией -->
              <div class="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {{ index + 1 }}
              </div>

              <!-- Иконка -->
              <div class="relative">
                <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                  <span class="group-hover:scale-110 transition-transform duration-500">{{ step.icon }}</span>
                </div>
                <!-- Пульсирующий круг -->
                <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {{ step.title }}
              </h3>
              <p class="text-gray-500 text-sm leading-relaxed flex-1">
                {{ step.description }}
              </p>

              <!-- Индикатор прогресса -->
              <div class="w-full mt-6 pt-4 border-t border-gray-100">
                <div class="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Шаг {{ index + 1 }} из 3</span>
                  <span class="text-emerald-600 font-medium">{{ step.time }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full transition-all duration-1000 group-hover:w-full"
                      :style="{ width: ((index + 1) / 3 * 100) + '%' }"></div>
                </div>
              </div>


            </div>

            <!-- Стрелка между карточками -->
            <div v-if="index < workflowSteps.length - 1"
                class="hidden md:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <div class="w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- Бонусная информация -->
        <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div class="flex items-center justify-center gap-2.5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <span class="text-xl">📚</span>
            <span class="text-sm text-gray-600">Каталог <span class="font-bold text-emerald-600">рецептов</span> </span>
          </div>
          <div class="flex items-center justify-center gap-2.5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <span class="text-xl">📋</span>
            <span class="text-sm text-gray-600">Готовый <span class="font-bold text-emerald-600">план на неделю</span></span>
          </div>
          <div class="flex items-center justify-center gap-2.5 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <span class="text-xl">🛒</span>
            <span class="text-sm text-gray-600">Умный <span class="font-bold text-emerald-600">список покупок</span></span>
          </div>
        </div>
        <!-- Статистика -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200">
          <div class="text-center">
            <div class="text-3xl font-black text-emerald-600">94%</div>
            <div class="text-sm text-gray-600">продолжают<br>использовать через месяц</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black text-emerald-600">3.2ч</div>
            <div class="text-sm text-gray-600">экономии времени<br>в неделю</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black text-emerald-600">-35%</div>
            <div class="text-sm text-gray-600">трат на доставку<br>и спонтанные покупки</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black text-emerald-600">12 мин</div>
            <div class="text-sm text-gray-600">на планирование<br> всей недели</div>
          </div>




        </div>
      </div>
    </section>


    <!-- ФИНАЛЬНЫЙ CTA (Ультимативный оффер) -->
    <section class="relative py-24 overflow-hidden" id="faq">
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-900 to-teal-900"></div>
      <!-- <div class="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div> -->

      <!-- Анимированные круги -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>

      <div class="relative max-w-4xl mx-auto text-center px-6 lg:px-8">
        <!-- <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <span class="text-2xl">🎁</span>
          <span class="text-white font-medium">Ограниченное предложение</span>
        </div> -->

        <h2 class="text-4xl lg:text-6xl font-black text-white mb-6">
          Начните экономить <br>5 часов уже сегодня
        </h2>
        <p class="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
          Присоединяйтесь к пользователей, которые уже забыли про пищевой стресс и спонтанные траты.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <!-- <UButton class="!rounded-2xl !bg-white !text-emerald-900 !px-8 !py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
            🚀 Узнать больше
            <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </UButton> -->
          <ULink to="/register">
            <UButton class="!rounded-2xl !bg-white !text-emerald-900 !px-8 !py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group cursor-pointer">
              Узнать больше
              <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </UButton>
          </ULink>
          <!-- <UButton variant="outline" class="!rounded-2xl !border-white/30 !text-white hover:!bg-white/10 !px-8 !py-6 text-lg">
            📞 Узнать больше
          </UButton> -->
        </div>

        <!-- <div class="flex items-center justify-center gap-6 text-sm text-emerald-200">
          <span>✅ Без карты</span>
          <span>💳 Отмена в 1 клик</span>
          <span>⚡ Доступ сразу</span>
        </div> -->
      </div>
    </section>



  </div>
  <!-- Уведомление о cookie -->
  <CookieConsent />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CookieConsent from '~/components/CookieConsent.vue'

useHead({
  title: 'AyEda - Планировщик питания, который экономит ваше время',
  meta: [
    { name: 'description', content: 'AyEda - умный планировщик питания. Составляйте меню на неделю за 12 минут, экономьте до 5 часов в неделю и 35% бюджета. Забудьте о пищевом стрессе.' },
    { name: 'keywords', content: 'планирование питания, меню на неделю, список покупок, экономия времени, здоровое питание, meal planner', key: 'keywords' },
    { property: 'og:title', content: 'AyEda - Планировщик питания, который экономит ваше время' },
    { property: 'og:description', content: 'Составляйте меню на неделю за 12 минут. Экономьте до 5 часов в неделю и 35% бюджета.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://ayeda.ru/og-home.jpg' },
    { property: 'og:image:alt', content: 'AyEda - умный планировщик питания' },
    { property: 'og:url', content: 'https://ayeda.ru' },
    { property: 'og:site_name', content: 'AyEda' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'AyEda - Планировщик питания' },
    { name: 'twitter:description', content: 'Экономьте 5 часов в неделю на планировании питания' },
  ],
  link: [
    { rel: 'canonical', href: 'https://ayeda.ru' },
  ],
})

  const scrolled = ref(false)
  const progressHeight = ref(0)
  const howSection = ref(null)
  const stepRefs = ref<unknown[]>([])

  const navItems = [
    { label: 'Возможности', href: '#features' },
    { label: 'Как это работает', href: '#how-it-works' },
    { label: 'Истории', href: '#stories' },
    { label: 'FAQ', href: '#faq' }
  ]

  const demoWeek = [
    { name: 'ПН', lunch: 'Киноа с овощами', dinner: 'Лосось на гриле' },
    { name: 'ВТ', lunch: 'Суп-пюре из тыквы', dinner: 'Паста с морепродуктами' },
    { name: 'СР', lunch: 'Боул с нутом', dinner: 'Курица с розмарином' },
    { name: 'ЧТ', lunch: 'Том ям', dinner: 'Рис с овощами' },
    { name: 'ПТ', lunch: 'Греческий салат', dinner: 'Стейк из индейки' }
  ]

  const pains = [
    { icon: '😫', title: 'Каждый день один и тот же вопрос', text: '"Что приготовить?" отнимает больше времени, чем сама готовка' },
    { icon: '💸', title: 'Спонтанные траты на доставку', text: 'Отсутствие плана = фастфуд + лишние 5000₽ в месяц' },
    { icon: '🍕', title: 'Вредные привычки в питании', text: 'Когда нет плана, еда становится хаотичной и нездоровой' }
  ]

  const workflow = [
    {
      icon: 'i-lucide-book-open',
      badge: 'Шаг 1 — 2 минуты',
      title: 'Добавьте любимые рецепты',
      description: 'Импортируйте или добавьте свои.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      alt: 'Кулинарная книга с рецептами'
    },
    {
      icon: 'i-lucide-brain',
      badge: 'Шаг 2 — 30 секунд',
      title: 'Составите идеальное меню',
      description: 'Учитывайте ваши предпочтения, бюджет и время на готовку. Баланс БЖУ под контролем.',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop',
      alt: 'Планирование меню'
    },
    {
      icon: 'i-lucide-shopping-cart',
      badge: 'Шаг 3 — Готово!',
      title: 'Получите умный список покупок',
      description: 'Экономия 30% времени в магазине.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      alt: 'Список покупок'
    }
  ]

  const testimonials = [
    {
      name: 'Анна Смирнова',
      role: 'Мама двоих детей',
      text: 'Раньше я сходила с ума, пытаясь накормить всех. Теперь муж сам ходит в магазин по списку из AyEda!',
      savings: '8 500₽'
    },
    {
      name: 'Дмитрий Волков',
      role: 'IT-предприниматель',
      text: 'Даже не представлял, что можно так эффективно планировать питание. Трейд-офф времени и качества просто невероятный.',
      savings: '12 000₽'
    },
    {
      name: 'Елена Морозова',
      role: 'Фитнес-тренер',
      text: 'Рекомендую всем клиентам. AyEda автоматизирует 80% работы по составлению рациона.',
      savings: '5 000₽'
    }
  ]


  const blogList = [
    { title: '5 ошибок при планировании питания', description: 'И как их избежать', category: 'Советы', date: '15.03.2026', link: '/blog/5-mistakes' },
    { title: 'Как заморозить продукты на неделю', description: 'Экономьте время на готовке', category: 'Лайфхак', date: '12.03.2026', link: '/blog/freezing-tips' },
    { title: 'Быстрый завтрак за 5 минут', description: 'Идеи для занятого утра', category: 'Рецепты', date: '10.03.2026', link: '/blog/quick-breakfast' },
    { title: 'Что такое умный список покупок', description: 'И почему он экономит время', category: 'О сервисе', date: '8.03.2026', link: '/blog/smart-shopping-list' }
  ]

  const workflowSteps = [
    {
      icon: '📚',
      title: 'Выберите блюда из каталога',
      description: 'Изучите коллекцию рецептов, отфильтруйте по предпочтениям и добавьте понравившиеся блюда в свой план на неделю.',
      time: '3 минуты'
    },
    {
      icon: '📋',
      title: 'Сформируйте план питания',
      description: 'Соберите меню на неделю из выбранных рецептов. Система автоматически сбалансирует рацион по дням.',
      time: '2 минуты'
    },
    {
      icon: '🛒',
      title: 'Получите список покупок',
      description: 'Все ингредиенты автоматически собираются в удобный список с группировкой по отделам магазина. Готово к походу в супермаркет или заказать у партнеров доставку!',
      time: 'Готово!'
    }
  ]
  onMounted(() => {
    // Scroll эффект для хедера
    window.addEventListener('scroll', () => {
      scrolled.value = window.scrollY > 50
    })

    // Анимация прогресса при скролле
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const rect = entry.target.getBoundingClientRect()
          const scrollPercent = (rect.top * -1) / rect.height
          progressHeight.value = Math.min(100, Math.max(0, scrollPercent * 100))
        }
      })
    }, { threshold: 0.1 })

    if (howSection.value) {
      observer.observe(howSection.value)
    }
  })
  const problems = [
    { text: 'Каждый день думаете "Что приготовить?"' },
    { text: 'Тратите кучу времени в магазине' },
    { text: 'Заказываете доставку из-за лени' },
    { text: 'Продукты портятся в холодильнике' }
  ]

  const solutions = [
    { text: 'Готовое меню на неделю за 10 минут' },
    { text: 'Умный список по отделам магазина' },
    { text: 'Экономия до 35% бюджета' },
    { text: 'Никакого стресса и хаоса' }
  ]

  const timeLostTotal = 8
  </script>


  <style scoped>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    opacity: 0;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.3s forwards;
    opacity: 0;
  }

  .animation-delay-100 {
    animation-delay: 0.1s;
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }

  .animation-delay-300 {
    animation-delay: 0.3s;
  }

  .animation-delay-1000 {
    animation-delay: 1s;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
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
  @keyframes pulse-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes float-icon {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.animate-pulse-line {
  animation: pulse-line 2s ease-in-out infinite;
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}

.group:hover .group-hover\:rotate-6 {
  transform: rotate(6deg);
}

.group:hover .group-hover\:text-emerald-600 {
  color: #059669;
}

.group:hover .group-hover\:w-full {
  width: 100%;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\:-translate-y-2 {
  transform: translateX(-50%) translateY(-8px);
}

/* Анимация для иконок */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group .group-hover\:transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}
  </style>
