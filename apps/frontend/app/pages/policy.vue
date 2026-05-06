<template>
  <div class="min-h-screen bg-white">
    <!-- Основной контент -->
    <main class="pt-16 pb-20">
      <div class="max-w-4xl mx-auto px-6 lg:px-8">
        <!-- Заголовок -->
        <div class="mb-12">
          <div class="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-4">
            <UIcon name="i-lucide-shield" class="w-4 h-4 text-emerald-600" />
            <span class="text-sm font-semibold text-emerald-600">Документация</span>
          </div>
          <h1 class="text-4xl lg:text-5xl font-black mb-4">
            Политика
            <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">конфиденциальности</span>
          </h1>
          <p class="text-gray-500">Последнее обновление: 15 марта 2026 года</p>
        </div>

        <!-- Содержание -->
        <div class="prose prose-gray max-w-none">
          <!-- Введение -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">1. Общие положения</h2>
            <p class="text-gray-600 mb-3">
              Настоящая Политика конфиденциальности (далее — Политика) действует в отношении всей информации,
              которую АуЕда (далее — Сервис) может получить о пользователе во время использования сайта,
              сервисов, продуктов и услуг.
            </p>
            <p class="text-gray-600">
              Используя Сервис, вы даете согласие на обработку ваших персональных данных в соответствии с настоящей Политикой.
            </p>
          </div>

          <!-- Какие данные собираем -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">2. Какие данные мы собираем</h2>
            <ul class="space-y-2 text-gray-600 list-disc pl-5">
              <li>Контактная информация (имя, email, телефон)</li>
              <li>Данные о предпочтениях в питании (любимые рецепты, диетические ограничения)</li>
              <li>Технические данные (IP-адрес, тип браузера, устройство)</li>
              <li>Cookies и аналогичные технологии</li>
            </ul>
          </div>

          <!-- Как используем -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">3. Как мы используем ваши данные</h2>
            <ul class="space-y-2 text-gray-600 list-disc pl-5">
              <li>Для предоставления услуг по планированию питания</li>
              <li>Для улучшения работы сервиса и персонализации контента</li>
              <li>Для связи с вами (уведомления, новости, акции)</li>
              <li>Для аналитики и предотвращения мошенничества</li>
            </ul>
          </div>

          <!-- Передача данных -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">4. Передача данных третьим лицам</h2>
            <p class="text-gray-600 mb-3">
              Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством,
              или когда это необходимо для функционирования сервиса (например, хостинг-провайдерам).
            </p>
            <p class="text-gray-600">
              Все третьи лица, получающие доступ к данным, обязаны соблюдать конфиденциальность и не использовать данные в иных целях.
            </p>
          </div>

          <!-- Хранение и защита -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">5. Хранение и защита данных</h2>
            <p class="text-gray-600 mb-3">
              Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа,
              изменения, раскрытия или уничтожения. Данные хранятся на защищенных серверах.
            </p>
            <div class="bg-gray-50 rounded-xl p-4 mt-3">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-emerald-600" />
                <span class="font-semibold">Уровень защиты данных: высокий</span>
              </div>
              <p class="text-sm text-gray-500">Шифрование данных, двухфакторная аутентификация для администраторов, регулярные аудиты безопасности</p>
            </div>
          </div>

          <!-- Права пользователя -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">6. Ваши права</h2>
            <ul class="space-y-2 text-gray-600 list-disc pl-5">
              <li>Получить информацию о хранящихся персональных данных</li>
              <li>Изменить или удалить свои данные</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Потребовать прекратить обработку данных для маркетинга</li>
            </ul>
            <p class="text-gray-600 mt-3">
              Для реализации прав обратитесь по адресу: <a href="mailto:privacy@ayeda.ru" class="text-emerald-600 hover:underline">privacy@ayeda.ru</a>
            </p>
          </div>

          <!-- Cookies -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">7. Файлы cookies</h2>
            <p class="text-gray-600 mb-3">
              Мы используем cookies для улучшения работы сервиса, запоминания настроек и анализа трафика.
              Вы можете отключить cookies в настройках браузера, но это может повлиять на функциональность сервиса.
            </p>
            <div class="flex flex-wrap gap-2 mt-3">
              <span class="text-xs bg-gray-100 px-3 py-1 rounded-full">Необходимые</span>
              <span class="text-xs bg-gray-100 px-3 py-1 rounded-full">Аналитические</span>
              <span class="text-xs bg-gray-100 px-3 py-1 rounded-full">Функциональные</span>
              <span class="text-xs bg-gray-100 px-3 py-1 rounded-full">Маркетинговые (отключаемые)</span>
            </div>
          </div>

          <!-- Изменения -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold mb-3">8. Изменения политики</h2>
            <p class="text-gray-600">
              Мы можем периодически обновлять Политику конфиденциальности. О существенных изменениях
              мы уведомим вас через сервис или по электронной почте. Продолжая использовать сервис после изменений,
              вы соглашаетесь с обновленной политикой.
            </p>
          </div>

          <!-- Контакты -->
          <div class="bg-gray-50 rounded-2xl p-6 mt-8">
            <h3 class="text-lg font-bold mb-3">Контакты для вопросов</h3>
            <div class="space-y-2 text-gray-600">
              <p class="flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="w-4 h-4 text-emerald-600" />
                <a href="mailto:privacy@ayeda.ru" class="hover:text-emerald-600">privacy@ayeda.ru</a>
              </p>
              <p class="flex items-center gap-2">
                <UIcon name="i-lucide-phone" class="w-4 h-4 text-emerald-600" />
                <a href="tel:+78001234567" class="hover:text-emerald-600">8 800 123-45-67</a>
              </p>
              <p class="flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-emerald-600" />
                <span>г. Москва, ул. Тверская, д. 10</span>
              </p>
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
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Плавный скролл */
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
