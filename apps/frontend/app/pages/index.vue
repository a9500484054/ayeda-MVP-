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
            <!-- Бейдж с социальным доказательством -->
            <!-- <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100 animate-fade-in-up">
              <div class="flex -space-x-2">
                <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-300 to-gray-400"></div>
              </div>
              <span class="text-sm font-medium text-gray-700">
                <span class="font-bold text-emerald-600">2,847</span> человек планируют неделю прямо сейчас
              </span>
            </div> -->

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
            АуЕда - ваш шеф-повар, который планирует меню,
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
                    Забрать доступ
                    <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </UButton>
                </ULink>
              </div>

              <!-- Триггеры доверия -->
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-500" />
                  <span>Полностью бесплатно</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-credit-card" class="w-4 h-4 text-emerald-500" />
                  <span>Карта не нужна</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-lucide-x-circle" class="w-4 h-4 text-emerald-500" />
                  <span>Отмена в 1 клик</span>
                </div>
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
                🤖 AI план
                <!-- 🤖 Твой план -->
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

    <!-- ПРОБЛЕМА-РЕШЕНИЕ: Визуальное сравнение -->
    <section class="py-24 bg-gray-50" id="features">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <!-- <div class="inline-flex gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <span class="text-red-500">⬅️ Было</span>
            <span class="text-gray-300">|</span>
            <span class="text-emerald-500">Стало ➡️</span>
          </div> -->
          <h2 class="text-4xl lg:text-5xl font-black mb-4">
            Как АуЕда меняет
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">жизнь</span>
          </h2>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- До -->
          <div class="bg-white rounded-2xl p-8 shadow-lg border-l-8 border-red-500 transform -rotate-1 hover:rotate-0 transition">
            <div class="text-red-500 text-5xl mb-4">😫😫😫</div>
            <h3 class="text-2xl font-bold mb-4">Без АуЕда</h3>
            <div class="space-y-3">
              <div v-for="problem in problems" :key="problem.text" class="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                <span class="text-red-500">✗</span>
                <span class="text-gray-700">{{ problem.text }}</span>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-100">
              <div class="text-center text-gray-500">⏱️ Тратите {{ timeLostTotal }} часов/неделю</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-red-500 h-2 rounded-full" :style="{ width: (timeLostTotal / 15) * 100 + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- После -->
          <div class="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-xl transform rotate-1 hover:rotate-0 transition text-white">
            <div class="text-5xl mb-4">😊✨</div>
            <h3 class="text-2xl font-bold mb-4">С АуЕда</h3>
            <div class="space-y-3">
              <div v-for="solution in solutions" :key="solution.text" class="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur">
                <span class="text-emerald-300">✓</span>
                <span>{{ solution.text }}</span>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-white/20">
              <div class="text-center">⏱️ Всего 12 минут в неделю!</div>
              <div class="w-full bg-white/20 rounded-full h-2 mt-2">
                <div class="bg-white h-2 rounded-full w-1/4"></div>
              </div>
            </div>
            <ULink to="/register">
              <UButton class="w-full mt-6 py-3 bg-white text-emerald-600 rounded-xl font-bold transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:text-white hover:shadow-xl hover:scale-[1.02] group">
                <span class="flex items-center justify-center gap-2">
                  <span class="text-lg group-hover:scale-110 transition-transform duration-300">✨</span>
                  <span class="group-hover:tracking-wider transition-all duration-300">Начать экономить время</span>
                  <UIcon name="i-lucide-arrow-right" class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </UButton>
            </ULink>
          </div>
        </div>

        <!-- Статистика -->
        <!-- <div class="flex justify-center gap-8 mt-12">
          <div class="text-center">
            <div class="text-3xl font-black text-red-500">-78%</div>
            <div class="text-sm text-gray-500">времени</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black text-red-500">-35%</div>
            <div class="text-sm text-gray-500">трат</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black text-emerald-500">+94%</div>
            <div class="text-sm text-gray-500">удовольствия</div>
          </div>
        </div> -->
      </div>
    </section>

    <!-- КАК ЭТО РАБОТАЕТ (Интерактивный таймлайн) -->
    <section ref="howSection" class="py-24" id="how-it-works">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <UBadge class="!bg-emerald-100 !text-emerald-600 mb-4">🗓️ 12 минут в неделю</UBadge>
          <h2 class="text-4xl lg:text-5xl font-black mb-6">Как АуЕда меняет вашу жизнь</h2>
        </div>

        <div class="relative">
          <!-- Прогресс-бар (визуализация прогресса) -->
          <div class="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full hidden lg:block"></div>
          <div class="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 h-0 transition-all duration-1000 hidden lg:block" :style="{ height: progressHeight + '%' }"></div>

          <div class="space-y-20">
            <div v-for="(step, idx) in workflow" :key="idx" :ref="el => { if (el) stepRefs[idx] = el }" class="relative lg:flex items-center gap-12" :class="idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'">
              <!-- Круг с номером -->
              <div class="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 z-10 hidden lg:flex">
                {{ idx + 1 }}
              </div>

              <!-- Контент -->
              <div class="lg:w-1/2 mb-8 lg:mb-0" :class="idx % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'">
                <div :class="idx % 2 === 0 ? 'flex flex-col items-end' : ''">
                  <div class="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-4" :class="idx % 2 === 0 ? 'lg:float-right' : ''">
                    <UIcon :name="step.icon" class="w-5 h-5 text-emerald-600" />
                    <span class="text-sm font-semibold text-emerald-600">{{ step.badge }}</span>
                  </div>
                  <h3 class="text-2xl font-bold mb-3">{{ step.title }}</h3>
                </div>
                <p class="text-gray-600">{{ step.description }}</p>
              </div>

              <!-- Иллюстрация -->
              <div class="lg:w-1/2">
                <div class="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg">
                  <img :src="step.image" :alt="step.title" class="w-full rounded-xl">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- СОЦИАЛЬНОЕ ДОКАЗАТЕЛЬСТВО (Отзывы в формате кейсов) -->
    <section class="py-20 bg-gray-50" id="stories">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <UBadge class="!bg-amber-100 !text-amber-600 mb-4">❤️ Реальные истории</UBadge>
          <h2 class="text-4xl lg:text-5xl font-black mb-6">Уже многие<br>нашли свой ритм питания</h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="testimonial in testimonials" :key="testimonial.name" class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                {{ testimonial.name[0] }}
              </div>
              <div>
                <div class="font-bold">{{ testimonial.name }}</div>
                <div class="text-sm text-gray-500">{{ testimonial.role }}</div>
              </div>
            </div>
            <div class="flex text-amber-400 mb-3">
              <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-4 h-4 fill-current" />
            </div>
            <p class="text-gray-700 leading-relaxed mb-4">"{{ testimonial.text }}"</p>
            <div class="flex items-center gap-2 text-sm text-emerald-600">
              <UIcon name="i-lucide-trending-up" class="w-4 h-4" />
              <span>Экономит {{ testimonial.savings }} в месяц</span>
            </div>
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
            <div class="text-3xl font-black text-emerald-600">5.0★</div>
            <div class="text-sm text-gray-600">пользовательский<br> рейтинг</div>
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


    <!-- БЛОГ: Свежие статьи -->
    <section class="py-24 bg-gray-50" id="blog">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-12">
          <!-- <div class="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <span class="text-emerald-600 text-lg">📖</span>
            <span class="text-sm font-semibold">Блог об организации питания</span>
          </div> -->
          <h2 class="text-3xl lg:text-4xl font-black">Читайте <span class="text-emerald-600">полезные статьи</span></h2>
        </div>

        <div class="max-w-4xl mx-auto space-y-4">
          <div v-for="post in blogList" :key="post.title" class="bg-white rounded-xl p-5 hover:shadow-md transition group">
            <ULink :to="post.link" class="flex flex-col md:flex-row justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs text-emerald-600 font-semibold">{{ post.category }}</span>
                  <span class="text-xs text-gray-400">{{ post.date }}</span>
                </div>
                <h3 class="font-bold text-gray-800 group-hover:text-emerald-600 transition">{{ post.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ post.description }}</p>
              </div>
              <div class="flex items-center gap-2 text-emerald-600">
                <span class="text-sm">Читать</span>
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </ULink>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- Уведомление о cookie -->
  <CookieConsent />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CookieConsent from '~/components/CookieConsent.vue'

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
      text: 'Раньше я сходила с ума, пытаясь накормить всех. Теперь муж сам ходит в магазин по списку из АуЕда!',
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
      text: 'Рекомендую всем клиентам. АуЕда автоматизирует 80% работы по составлению рациона.',
      savings: '5 000₽'
    }
  ]


  const blogList = [
    { title: '5 ошибок при планировании питания', description: 'И как их избежать', category: 'Советы', date: '15.03.2026', link: '/blog/5-mistakes' },
    { title: 'Как заморозить продукты на неделю', description: 'Экономьте время на готовке', category: 'Лайфхак', date: '12.03.2026', link: '/blog/freezing-tips' },
    { title: 'Быстрый завтрак за 5 минут', description: 'Идеи для занятого утра', category: 'Рецепты', date: '10.03.2026', link: '/blog/quick-breakfast' },
    { title: 'Что такое умный список покупок', description: 'И почему он экономит время', category: 'О сервисе', date: '8.03.2026', link: '/blog/smart-shopping-list' }
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
  </style>
