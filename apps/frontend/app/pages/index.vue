<template>
  <div class="overflow-hidden">
    <!-- ====== HERO - НОВЫЙ ====== -->
    <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-emerald-50 via-teal-50 to-transparent rounded-full blur-3xl opacity-60"></div>
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-40"></div>

      <div class="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Левая часть - Новый текст -->
          <div class="space-y-8">
            <div class="space-y-4 animate-fade-in-up animation-delay-100">
              <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Экономьте 5 часов в неделю
              </span>
              <h1 class="text-5xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight">
                <span class="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Планируйте питание</span>
                <br />
                <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  за 10 минут
                </span>
              </h1>
              <p class="text-xl text-gray-600 leading-relaxed max-w-lg">
                АуЕда — это ваш умный помощник, который составляет меню,
                создает список покупок и
                <span class="font-semibold text-gray-800">экономит до 5 часов вашего времени</span>
                каждую неделю.
              </p>
            </div>

            <!-- CTA -->
            <div class="space-y-4 animate-fade-in-up animation-delay-200">
              <div class="flex flex-col sm:flex-row gap-3">
                <ULink to="/register">
                  <UButton class="!rounded-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white !py-5 !px-10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 !text-lg font-semibold group cursor-pointer">
                    Попробовать бесплатно
                    <UIcon name="i-lucide-arrow-right" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </UButton>
                </ULink>
              </div>
              <!-- <p class="text-xs text-gray-400">🔥 Уже 500+ пользователей экономят время</p> -->
            </div>
          </div>

          <!-- Правая часть - Скриншот -->
          <div class="relative animate-fade-in-right">
            <div class="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <div class="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                🤖 Ваш план
              </div>

              <!-- Демо интерфейса -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-gray-900">План на неделю</h3>
                  <UBadge class="!bg-emerald-100 !text-emerald-700">Баланс 95%</UBadge>
                </div>

                <div v-for="day in demoWeek" :key="day.name" class="group">
                  <div class="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/50 transition-all">
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-sm font-bold text-emerald-600 w-12">{{ day.name }}</span>
                      <div>
                        <div class="font-medium text-gray-900">{{ day.lunch }}</div>
                        <div class="text-xs text-gray-500">{{ day.dinner }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-emerald-600 font-medium">{{ day.calories }} ккал</span>
                    </div>
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

            <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-200 rounded-full blur-2xl opacity-50"></div>
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-teal-200 rounded-full blur-2xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== КАК ЭТО РАБОТАЕТ - ВИЗУАЛЬНАЯ ДЕМОНСТРАЦИЯ ====== -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30" id="how-it-works">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Простой процесс
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            Всё начинается с<br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">трёх простых шагов</span>
          </h2>
          <p class="text-gray-500 mt-4 text-lg">От выбора блюд до готового списка покупок за 10 минут</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 relative">
          <div class="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 transform -translate-y-1/2"></div>
          <div class="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-emerald-400/30 transform -translate-y-1/2 animate-pulse-line"></div>

          <div v-for="(step, index) in workflowSteps" :key="index" class="group relative">
            <div class="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:border-emerald-200 h-full flex flex-col items-center text-center">
              <div class="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {{ index + 1 }}
              </div>

              <div class="relative">
                <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                  <span class="group-hover:scale-110 transition-transform duration-500">{{ step.icon }}</span>
                </div>
                <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {{ step.title }}
              </h3>
              <p class="text-gray-500 text-sm leading-relaxed flex-1">
                {{ step.description }}
              </p>
            </div>

            <div v-if="index < workflowSteps.length - 1" class="hidden md:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <div class="w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== ПОЧЕМУ ЭТО РАБОТАЕТ - МЕТРИКИ ====== -->
    <section class="py-20 md:py-28 bg-white" id="results">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Результаты
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            Почему это <br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">работает</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
              ⏱️
            </div>
            <div class="text-4xl font-black text-emerald-600 mb-2">5 часов</div>
            <div class="text-sm text-gray-600">экономии времени в неделю</div>
          </div>

          <div class="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
              💰
            </div>
            <div class="text-4xl font-black text-emerald-600 mb-2">-35%</div>
            <div class="text-sm text-gray-600">трат на доставку и спонтанные покупки</div>
          </div>

          <div class="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
              🥗
            </div>
            <div class="text-4xl font-black text-emerald-600 mb-2">95%</div>
            <div class="text-sm text-gray-600">сбалансированное меню</div>
          </div>

          <div class="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
              😌
            </div>
            <div class="text-4xl font-black text-emerald-600 mb-2">94%</div>
            <div class="text-sm text-gray-600">пользователей продолжают использовать через месяц</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== БЛОК С РЕЦЕПТАМИ (SSR) ====== -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-white to-emerald-50/30" id="recipes">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Вдохновение
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            Популярные <br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">рецепты</span>
          </h2>
          <p class="text-gray-500 mt-4 text-lg">Выберите блюда и добавьте в свой план на неделю</p>
        </div>

        <!-- Скелетон -->
        <div v-if="recipesPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-gray-100 rounded-2xl h-72 animate-pulse"></div>
        </div>

        <!-- Рецепты -->
        <div v-else-if="recipesData?.data?.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="recipe in recipesData.data.slice(0, 4)" :key="recipe.id"
               class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
            <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                v-if="recipe.photo?.src"
                :src="recipe.photo?.src"
                :alt="recipe.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 to-teal-50">
                🍳
              </div>
              <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ recipe.cooking_time || recipe.cookingTime || '30' }} мин
              </div>
            </div>

            <div class="p-4">
              <h3 class="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {{ recipe.title }}
              </h3>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <UIcon name="i-lucide-users" class="w-4 h-4" />
                  <span>{{ recipe.servings || 2 }} порц.</span>
                </div>
                <div class="flex items-center gap-1 text-emerald-400">
                  <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-3.5 h-3.5 fill-current"
                         :class="{ 'text-gray-200': i > (recipe.rating || 4) }" />
                </div>
              </div>
              <ULink :to="`/recipes/${recipe.id}`" class="block mt-3 text-end">
                <UButton size="xs" variant="outline" class="cursor-pointer !rounded-xl text-sm border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
                  Смотреть рецепт
                </UButton>
              </ULink>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-400">Рецепты скоро появятся</p>
        </div>

        <div class="text-center mt-8">
          <ULink to="/recipes">
            <UButton variant="outline" class="cursor-pointer  !rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300">
              Смотреть все рецепты
              <UIcon name="i-lucide-arrow-right" class="ml-2 w-4 h-4" />
            </UButton>
          </ULink>
        </div>
      </div>
    </section>


    <!-- ====== БЛОК: ДОСТАВКА ОТ ПАРТНЁРА ====== -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 to-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Полный цикл
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            От меню до <br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">готовых продуктов</span>
          </h2>
          <p class="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Составьте план питания, получите список покупок и закажите продукты у наших партнёров — всё в несколько кликов
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 text-center group">
            <div class="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              📋
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">1. Составьте меню</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Выберите рецепты из каталога и соберите свой идеальный план на неделю
            </p>
          </div>

          <div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 text-center group">
            <div class="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🛒
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">2. Получите список покупок</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Все ингредиенты автоматически собираются в умный список по отделам магазина
            </p>
          </div>

          <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-center group relative overflow-hidden">
            <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative">
              <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                🚚
              </div>
              <h3 class="text-xl font-bold text-white mb-3">3. Закажите у партнёра</h3>
              <p class="text-emerald-100 text-sm leading-relaxed">
                Перейдите к нашему партнёру и закажите продукты с доставкой на дом
              </p>
              <div class="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Доступно в Москве и СПб
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <!-- <div class="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
            <span class="text-sm text-gray-500">Партнёры:</span>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-700">🍽️ Доставка-Еда</span>
              <span class="w-px h-6 bg-gray-200"></span>
              <span class="text-sm font-medium text-gray-700">🛍️ Продукт-Маркет</span>
              <span class="w-px h-6 bg-gray-200"></span>
              <span class="text-sm font-medium text-gray-700">🥬 Зелёный Дом</span>
            </div>
          </div> -->
          <p class="text-xs text-gray-400 mt-4">
            * Доставка осуществляется партнёрами сервиса. Условия и стоимость уточняйте на сайтах партнёров.
          </p>
        </div>
      </div>
    </section>

    <!-- ====== ФИНАЛЬНЫЙ CTA ====== -->
    <section class="relative py-24 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-900 to-teal-900"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>

      <div class="relative max-w-4xl mx-auto text-center px-6 lg:px-8">
        <h2 class="text-4xl lg:text-6xl font-black text-white mb-6">
          Готовы попробовать?
        </h2>
        <p class="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
          Перестаньте тратить время на рутину. Создайте свой первый план питания за 10 минут.
        </p>

        <ULink to="/register">
          <UButton class="!rounded-2xl !bg-white !text-emerald-900 !px-10 !py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group cursor-pointer">
            Начать сейчас →
          </UButton>
        </ULink>
      </div>
    </section>

        <!-- ====== БЛОК СО СТАТЬЯМИ (SSR) ====== -->
    <section class="py-20 md:py-28 bg-white" id="blog">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Блог
          </span>
          <h2 class="text-4xl md:text-5xl font-black leading-tight">
            Полезные <br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">статьи о питании</span>
          </h2>
          <p class="text-gray-500 mt-4 text-lg">Советы и лайфхаки для здорового образа жизни</p>
        </div>
        <!-- Скелетон -->
        <div v-if="articlesPending" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
        </div>

        <!-- Статьи -->

        <div v-else-if="articlesData?.items?.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="article in articlesData.items.slice(0, 3)" :key="article.id"
               class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
            <div class="relative aspect-[16/9] overflow-hidden bg-gray-100">
              <img
                v-if="article.photo?.src"
                :src="article.photo?.src"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 to-teal-50">
                📝
              </div>
              <div class="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-emerald-600">
                {{ article.category || 'Советы' }}
              </div>
            </div>

            <div class="p-5">
              <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                <span>{{ formatDate(article.created_at || article.createdAt) }}</span>
              </div>
              <h3 class="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {{ article.title }}
              </h3>
              <p class="text-gray-500 text-sm mt-2 line-clamp-2">
                {{ article.description || article.excerpt || 'Читайте полезные советы' }}
              </p>
              <ULink :to="`/blog/${article.slug || article.id}`" class="block mt-4 text-end">
                <UButton size="xs" variant="outline" class="cursor-pointer  !rounded-xl text-sm border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
                  Читать статью
                </UButton>
              </ULink>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-400">Статьи скоро появятся</p>
        </div>

        <div class="text-center mt-8">
          <ULink to="/blog">
            <UButton variant="outline" class=" cursor-pointer !rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300">
              Смотреть все статьи
              <UIcon name="i-lucide-arrow-right" class="ml-2 w-4 h-4" />
            </UButton>
          </ULink>
        </div>
      </div>
    </section>

    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
import CookieConsent from '~/components/CookieConsent.vue'

// ====== SSR: РЕЦЕПТЫ ======
const { data: recipesData, pending: recipesPending } = await useAsyncData(
  'home-recipes',
  async () => {
    const api = useRecipesApi()
    const response = await api.getRecipes({
      status: 'public',
      page: 1,
      limit: 4,
    })
    return response
  },
  {
    server: true,
    lazy: false,
  }
)
const articlesApi = useArticlesApi()

// ====== SSR: СТАТЬИ ======
const { data: articlesData, pending: articlesPending } = await useAsyncData(
  'home-articles',
  async () => {
    const response = await articlesApi.getArticles({
      status: 'published',
      page: 1,
      limit: 3
    })
    return response
  },
  {
    server: true,
    lazy: false
  }
)

// ====== ФУНКЦИИ ======
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ====== ДАННЫЕ ======
const demoWeek = [
  { name: 'ПН', lunch: 'Киноа с овощами', dinner: 'Лосось на гриле', calories: 450 },
  { name: 'ВТ', lunch: 'Суп-пюре из тыквы', dinner: 'Паста с морепродуктами', calories: 520 },
  { name: 'СР', lunch: 'Боул с нутом', dinner: 'Курица с розмарином', calories: 480 },
  { name: 'ЧТ', lunch: 'Том ям', dinner: 'Рис с овощами', calories: 390 },
  { name: 'ПТ', lunch: 'Греческий салат', dinner: 'Стейк из индейки', calories: 430 }
]

const workflowSteps = [
  {
    icon: '📚',
    title: 'Выбираете',
    description: 'Изучаете рецепты и добавляете любимые блюда в план на неделю'
  },
  {
    icon: '📋',
    title: 'Планируете',
    description: 'Собираете сбалансированное меню на всю неделю за пару минут'
  },
  {
    icon: '🛒',
    title: 'Покупаете',
    description: 'Получаете список покупок и идёте в магазин или заказываете у партнеров'
  }
]

// ====== SEO ======
useHead({
  title: 'АуЕда - Планируйте питание за 10 минут',
  meta: [
    { name: 'description', content: 'АуЕда - умный планировщик питания. Составляйте меню на неделю за 10 минут, экономьте 5 часов в неделю. Забудьте о пищевом стрессе.' },
    { property: 'og:title', content: 'АуЕда - Планируйте питание за 10 минут' },
    { property: 'og:description', content: 'Составляйте меню на неделю за 10 минут. Экономьте 5 часов в неделю.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://ayeda.ru/og-home.jpg' },
    { property: 'og:url', content: 'https://ayeda.ru' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: 'https://ayeda.ru' },
  ],
})
</script>

<style scoped>
/* ====== АНИМАЦИИ ====== */
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

.animation-delay-100 { animation-delay: 0.1s; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-300 { animation-delay: 0.3s; }
.animation-delay-1000 { animation-delay: 1s; }

.animate-pulse-line {
  animation: pulse-line 2s ease-in-out infinite;
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* ====== LINE CLAMP ====== */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}
</style>
