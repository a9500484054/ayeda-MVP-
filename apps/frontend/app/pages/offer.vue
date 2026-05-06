<template>
  <div class="min-h-screen bg-white">
    <!-- Основной контент -->
    <main class="pt-16 pb-20">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <!-- Заголовок -->
        <div class="mb-12">
          <div class="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-4">
            <UIcon name="i-lucide-file-text" class="w-4 h-4 text-emerald-600" />
            <span class="text-sm font-semibold text-emerald-600">Юридическая информация</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-black mb-4">
            Публичная
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">оферта</span>
          </h1>
          <p class="text-gray-500">Последнее обновление: 15 марта 2026 года</p>
        </div>

        <!-- Содержание -->
        <div class="prose prose-gray max-w-none">
          <!-- 1. Общие положения -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">1. Общие положения</h2>
            <p class="text-gray-600 mb-3">
              Настоящий документ «Публичная оферта» (далее — Оферта) представляет собой официальное предложение
              Сервиса «АуЕда» (далее — Исполнитель) любому физическому лицу (далее — Заказчик) заключить договор
              на оказание информационно-консультационных услуг по планированию питания на условиях, изложенных ниже.
            </p>
            <p class="text-gray-600">
              В соответствии со статьей 437 Гражданского кодекса РФ, данный документ является публичной офертой.
              Акцептом настоящей Оферты считается регистрация на Сайте Исполнителя.
            </p>
          </div>

          <!-- 2. Термины и определения -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">2. Термины и определения</h2>
            <ul class="space-y-2 text-gray-600 list-disc pl-5">
              <li><span class="font-semibold">Сайт</span> — интернет-сайт, расположенный по адресу ayeda.ru</li>
              <li><span class="font-semibold">Сервис</span> — онлайн-платформа для планирования питания и создания списка покупок</li>
              <li><span class="font-semibold">Пользователь</span> — лицо, прошедшее регистрацию на Сайте</li>
              <li><span class="font-semibold">Тариф</span> — набор услуг, предоставляемых Пользователю за определенную плату</li>
              <li><span class="font-semibold">Пробный период</span> — 14 дней бесплатного использования базового функционала</li>
            </ul>
          </div>

          <!-- 3. Предмет оферты -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">3. Предмет оферты</h2>
            <p class="text-gray-600 mb-3">
              Исполнитель обязуется предоставить Заказчику доступ к Сервису, а Заказчик обязуется
              оплатить услуги в порядке и на условиях, предусмотренных настоящей Офертой.
            </p>
            <div class="bg-gray-50 rounded-xl p-4 mt-3">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-package" class="w-5 h-5 text-emerald-600" />
                <span class="font-semibold">В состав услуг входит:</span>
              </div>
              <ul class="space-y-1 text-sm text-gray-600 list-disc pl-5">
                <li>Планирование меню на неделю</li>
                <li>Создание автоматического списка покупок</li>
                <li>Доступ к базе рецептов (500+ блюд)</li>
                <li>Сохранение и организация любимых рецептов</li>
                <li>Возможность делиться меню с семьей</li>
              </ul>
            </div>
          </div>

          <!-- 4. Тарифы и оплата -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">4. Тарифы и порядок оплаты</h2>
            <div class="grid gap-4 mb-4">
              <div class="border border-gray-200 rounded-xl p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-lg">Базовый</span>
                  <span class="text-emerald-600 font-bold">0 ₽ / месяц</span>
                </div>
                <p class="text-sm text-gray-500">Базовое планирование, до 10 рецептов</p>
              </div>
              <div class="border-2 border-emerald-200 bg-emerald-50/30 rounded-xl p-4">
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-lg">Премиум</span>
                    <span class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Популярный</span>
                  </div>
                  <span class="text-emerald-600 font-bold">499 ₽ / месяц</span>
                </div>
                <p class="text-sm text-gray-500">Безлимитные рецепты, AI-рекомендации, приоритетная поддержка</p>
              </div>
              <div class="border border-gray-200 rounded-xl p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold text-lg">Семейный</span>
                  <span class="text-emerald-600 font-bold">899 ₽ / месяц</span>
                </div>
                <p class="text-sm text-gray-500">До 5 пользователей, общее меню и список покупок</p>
              </div>
            </div>
            <p class="text-gray-600">
              Оплата услуг производится на условиях 100% предоплаты. Денежные средства списываются
              автоматически в начале каждого расчетного периода. Пользователь вправе отменить подписку
              в личном кабинете в любой момент.
            </p>
          </div>

          <!-- 5. Пробный период -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">5. Пробный период</h2>
            <p class="text-gray-600 mb-3">
              При регистрации Пользователю предоставляется пробный период продолжительностью 14 (Четырнадцать)
              календарных дней. В течение пробного периода Пользователь имеет доступ ко всем функциям
              Премиум-тарифа без взимания платы.
            </p>
            <p class="text-gray-600">
              По истечении пробного периода, если Пользователь не отказался от услуг, подписка автоматически
              продлевается на платной основе. Пользователь может отказаться от продления в любой момент до
              окончания пробного периода.
            </p>
            <div class="bg-amber-50 rounded-xl p-3 mt-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="w-4 h-4 text-amber-600" />
                <p class="text-xs text-amber-700">Для отмены подписки перейдите в раздел «Настройки» → «Подписка» → «Отменить»</p>
              </div>
            </div>
          </div>

          <!-- 6. Права и обязанности сторон -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">6. Права и обязанности сторон</h2>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold mb-2 flex items-center gap-1"><UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-600" /> Исполнитель обязуется:</h4>
                <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Обеспечить круглосуточный доступ к Сервису</li>
                  <li>Обеспечить конфиденциальность данных Пользователя</li>
                  <li>Предоставлять техническую поддержку</li>
                  <li>Уведомлять об изменениях условий за 14 дней</li>
                </ul>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="font-semibold mb-2 flex items-center gap-1"><UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-600" /> Пользователь обязуется:</h4>
                <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  <li>Предоставлять достоверные данные при регистрации</li>
                  <li>Своевременно оплачивать услуги</li>
                  <li>Не нарушать работу Сервиса</li>
                  <li>Соблюдать условия настоящей Оферты</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 7. Возврат денежных средств -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">7. Порядок возврата денежных средств</h2>
            <p class="text-gray-600 mb-3">
              Пользователь вправе отказаться от услуг и потребовать возврата денежных средств в следующих случаях:
            </p>
            <ul class="space-y-2 text-gray-600 list-disc pl-5 mb-3">
              <li>Невозможность использования Сервиса по техническим причинам более 3 дней подряд</li>
              <li>Ошибочное списание денежных средств</li>
              <li>Предоставление услуги ненадлежащего качества</li>
            </ul>
            <p class="text-gray-600">
              Для возврата средств необходимо обратиться в службу поддержки по адресу:
              <a href="mailto:support@ayeda.ru" class="text-emerald-600 hover:underline">support@ayeda.ru</a>
            </p>
          </div>

          <!-- 8. Ответственность сторон -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">8. Ответственность сторон</h2>
            <p class="text-gray-600">
              Исполнитель не несет ответственности за перерывы в работе Сервиса, связанные с проведением
              технических работ или сбоями в работе сети Интернет. Совокупная ответственность Исполнителя
              ограничена стоимостью оплаченных, но не оказанных услуг.
            </p>
          </div>

          <!-- 9. Заключительные положения -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">9. Заключительные положения</h2>
            <ul class="space-y-2 text-gray-600 list-disc pl-5">
              <li>Исполнитель вправе вносить изменения в Оферту с уведомлением Пользователя за 14 дней</li>
              <li>Все споры решаются путем переговоров, при невозможности — в суде по месту нахождения Исполнителя</li>
              <li>Признание недействительным одного из условий не влечет недействительности остальных условий</li>
              <li>Действующая редакция Оферты всегда доступна по адресу: ayeda.ru/offer</li>
            </ul>
          </div>

          <!-- Реквизиты -->
          <div class="bg-gray-50 rounded-2xl p-6 mt-8">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-building-2" class="w-5 h-5 text-emerald-600" />
              Реквизиты Исполнителя
            </h3>
            <div class="space-y-2 text-sm text-gray-600">
              <p><span class="font-semibold">ООО «АуЕда»</span></p>
              <p>ИНН: 7701234567</p>
              <p>КПП: 770101001</p>
              <p>ОГРН: 1237700123456</p>
              <p>Юридический адрес: 125009, г. Москва, ул. Тверская, д. 10, офис 501</p>
              <p>E-mail: <a href="mailto:legal@ayeda.ru" class="text-emerald-600 hover:underline">legal@ayeda.ru</a></p>
              <p>Телефон: <a href="tel:+78001234567" class="text-emerald-600 hover:underline">8 800 123-45-67</a></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

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
/* Анимации */
html {
  scroll-behavior: smooth;
}

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

/* Стили для контента */
.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.prose p {
  line-height: 1.6;
}

.prose ul li {
  margin-bottom: 0.5rem;
}
</style>
