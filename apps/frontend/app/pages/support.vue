<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-darkMode-700">
        Поддержка
      </h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-darkMode-500">Мы всегда готовы помочь вам с любыми вопросами</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-gray-200 dark:border-darkMode-300 mb-8">
      <button
        @click="activeTab = 'faq'"
        class="px-6 py-3 text-sm font-medium transition-all duration-200 relative"
        :class="activeTab === 'faq'
          ? 'text-emerald-600 border-b-2 border-emerald-600'
          : 'text-gray-500 hover:text-gray-700 dark:text-darkMode-500 dark:hover:text-darkMode-600'"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-help-circle" class="w-4 h-4" />
          Частые вопросы
        </span>
      </button>
      <button
        @click="activeTab = 'contact'"
        class="px-6 py-3 text-sm font-medium transition-all duration-200 relative"
        :class="activeTab === 'contact'
          ? 'text-emerald-600 border-b-2 border-emerald-600'
          : 'text-gray-500 hover:text-gray-700 dark:text-darkMode-500 dark:hover:text-darkMode-600'"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square" class="w-4 h-4" />
          Написать нам
        </span>
      </button>
    </div>

    <!-- Инфо-карточки (быстрая помощь) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-clock" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Быстрый ответ</span>
        </div>
        <p class="text-xs text-emerald-600 dark:text-emerald-500">Отвечаем в течение 24 часов</p>
      </div>

      <div class="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-calendar-days" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Работаем ежедневно</span>
        </div>
        <p class="text-xs text-emerald-600 dark:text-emerald-500">Поддержка 7 дней в неделю</p>
      </div>

      <div class="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Команда экспертов</span>
        </div>
        <p class="text-xs text-emerald-600 dark:text-emerald-500">Поможем решить любой вопрос</p>
      </div>
    </div>

    <!-- FAQ секция -->
    <div v-if="activeTab === 'faq'" class="space-y-4">
      <div
        v-for="(item, idx) in faqItems"
        :key="idx"
        class="border border-gray-200 dark:border-darkMode-300 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 bg-white dark:bg-darkMode-100"
      >
        <details class="group" @toggle="handleToggle($event, idx)">
          <summary class="flex items-center justify-between p-4 cursor-pointer list-none select-none transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-darkMode-200">
            <span class="font-medium text-gray-800 dark:text-darkMode-700 transition-colors duration-200 group-open:text-emerald-600 dark:group-open:text-emerald-400">
              {{ item.question }}
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="w-5 h-5 text-gray-400 dark:text-darkMode-500 transition-all duration-300 group-open:rotate-180 group-open:text-emerald-600 dark:group-open:text-emerald-400"
            />
          </summary>
          <div class="overflow-hidden">
            <div
              class="p-4 text-gray-600 dark:text-darkMode-500 text-sm border-t border-gray-100 dark:border-darkMode-300 animate-fadeIn"
            >
              {{ item.answer }}
            </div>
          </div>
        </details>
      </div>

      <!-- Дополнительная помощь -->
      <div class="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl text-center transition-all duration-300 hover:shadow-lg">
        <div class="animate-float">
          <UIcon name="i-lucide-message-circle" class="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-darkMode-700 mb-2">Не нашли ответ?</h3>
        <p class="text-gray-600 dark:text-darkMode-500 text-sm mb-4">Свяжитесь с нами напрямую, и мы поможем вам</p>
        <Button
          @click="activeTab = 'contact'"
          color="primary"
          size="md"
          class="transition-all duration-300 hover:scale-105"
        >
          Написать в поддержку
        </Button>
      </div>
    </div>

    <!-- Контактная форма -->
    <div v-else class="bg-white dark:bg-darkMode-100 rounded-xl border border-gray-200 dark:border-darkMode-300 p-6">
      <!-- Сообщение об успехе -->
      <Transition name="slide">
        <div v-if="success" class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p class="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Сообщение отправлено!</p>
              <p class="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                Мы ответим вам в ближайшее время на указанный email.
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <form @submit="onSubmit" class="space-y-5">
        <!-- Имя -->
        <Input
          v-model="name"
          v-bind="nameAttrs"
          label="Имя"
          placeholder="Как вас зовут?"
          icon="i-lucide-user"
          :error="errors.name"
        />

        <!-- Email -->
        <Input
          v-model="email"
          v-bind="emailAttrs"
          label="Email"
          type="email"
          placeholder="your@email.com"
          icon="i-lucide-mail"
          :error="errors.email"
        />

        <!-- Тема -->
        <Input
          v-model="subject"
          v-bind="subjectAttrs"
          label="Тема"
          placeholder="О чем ваше обращение?"
          icon="i-lucide-tag"
          :error="errors.subject"
        />

        <!-- Сообщение -->
        <Textarea
          v-model="message"
          v-bind="messageAttrs"
          label="Сообщение"
          placeholder="Опишите ваш вопрос подробнее..."
          :rows="5"
          :error="errors.message"
        />

        <!-- Server error -->
        <Transition name="slide">
          <div v-if="serverError" class="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
              <p class="text-sm text-red-600 dark:text-red-400">{{ serverError }}</p>
            </div>
          </div>
        </Transition>

        <!-- Submit button -->
        <Button
          type="submit"
          :loading="pending"
          color="primary"
          size="lg"
          block
          icon="i-lucide-send"
        >
          Отправить сообщение
        </Button>
      </form>

      <!-- Альтернативные контакты -->
      <div class="mt-6 pt-6 border-t border-gray-100 dark:border-darkMode-300">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Или свяжитесь с нами напрямую:</h3>
        <div class="flex flex-wrap gap-4 text-sm">
          <a href="mailto:support@ayeda.ru" class="flex items-center gap-2 text-gray-600 dark:text-darkMode-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
            <UIcon name="i-lucide-mail" class="w-4 h-4" />
            support@ayeda.ru
          </a>
          <a href="https://t.me/ayeda_support_bot" class="flex items-center gap-2 text-gray-600 dark:text-darkMode-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
            <UIcon name="i-lucide-telegram" class="w-4 h-4" />
            @ayeda_support_bot
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import Button from "~/shared/ui/button/Button.vue";
import Input from "~/shared/ui/input/Input.vue";
import Textarea from "~/shared/ui/textarea/Textarea.vue";

definePageMeta({
  layout: "cabinet",
})

useHead({
  title: 'Поддержка | AyEda',
  meta: [
    { name: 'description', content: 'Помощь и поддержка пользователей AyEda. Часто задаваемые вопросы, контакты службы поддержки. Ответим в течение 24 часов.', key: 'description' },
    { name: 'keywords', content: 'поддержка, помощь, FAQ, контакты, служба поддержки', key: 'keywords' },
    { name: 'robots', content: 'noindex, follow', key: 'robots' },
    { property: 'og:title', content: 'Поддержка | AyEda', key: 'og:title' },
    { property: 'og:description', content: 'Помощь и поддержка пользователей AyEda', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/logo.png', key: 'og:image' },
    { property: 'og:image:alt', content: 'Поддержка AyEda', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/cabinet/support', key: 'og:url' },
    { property: 'og:site_name', content: 'AyEda', key: 'og:site_name' },
  ],
})

const pending = ref(false);
const success = ref(false);
const serverError = ref("");
const activeTab = ref('faq');

// Конфигурация Telegram бота
const TELEGRAM_BOT_TOKEN = '8568457132:AAHbjeYBKRP64FZznyfvXuT8vfzRVOF1wJY'; // Замените на ваш токен
const TELEGRAM_CHAT_ID = '365136832'; // Замените на ваш chat ID
// const botToken = process.env.TELEGRAM_BOT_TOKEN;
// const chatId = process.env.TELEGRAM_CHAT_ID;

// console.log("Telegram Bot Token:", botToken);
// console.log("Telegram Chat ID:", chatId);
// Схема валидации для формы обратной связи
const zodSchema = z.object({
  name: z.string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя слишком длинное"),
  email: z.string()
    .min(1, "Email обязателен")
    .email("Введите корректный email"),
  subject: z.string()
    .min(1, "Укажите тему обращения")
    .min(3, "Тема должна содержать минимум 3 символа"),
  message: z.string()
    .min(1, "Сообщение обязательно")
    .min(10, "Сообщение должно содержать минимум 10 символов")
});

const validationSchema = toTypedSchema(zodSchema);

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    email: "",
    subject: "",
    message: ""
  }
});

const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [subject, subjectAttrs] = defineField("subject");
const [message, messageAttrs] = defineField("message");

// Функция отправки в Telegram
const sendToTelegram = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  // Форматируем сообщение для Telegram
  const text = `
🆕 <b>Новое обращение в поддержку</b>

👤 <b>Отправитель:</b> ${escapeHtml(data.name)}
📧 <b>Email:</b> ${escapeHtml(data.email)}
📋 <b>Тема:</b> ${escapeHtml(data.subject)}
💬 <b>Сообщение:</b>
${escapeHtml(data.message)}

🕐 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
  `;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.description || 'Ошибка отправки в Telegram');
  }

  return await response.json();
};

// Функция для экранирования HTML
const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Альтернативный вариант через API маршрут (рекомендуемый)
const sendToTelegramViaAPI = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await $fetch('/api/support/telegram', {
    method: 'POST',
    body: data,
  });
  return response;
};

const onSubmit = handleSubmit(async (values) => {
  pending.value = true;
  serverError.value = "";

  try {
    // Отправка в Telegram (прямой запрос)
    await sendToTelegram(values);

    // Или через API маршрут (более безопасно)
    // await sendToTelegramViaAPI(values);

    // Имитация дополнительной задержки (опционально)
    // await new Promise(resolve => setTimeout(resolve, 500));

    success.value = true;
    resetForm();

    setTimeout(() => {
      success.value = false;
    }, 5000);
  } catch (err: any) {
    console.error('Telegram send error:', err);
    serverError.value = err.message || "Не удалось отправить сообщение. Попробуйте позже.";
  } finally {
    pending.value = false;
  }
});

const handleToggle = (event: Event, idx: number) => {
  // Опциональная логика при открытии/закрытии FAQ
  console.log(`FAQ ${idx} toggled`);
};

const faqItems = [
  {
    question: "Как начать пользоваться сервисом?",
    answer: "Просто зарегистрируйтесь на сайте, и вы получите 14 дней бесплатного доступа. После регистрации вы сможете добавлять рецепты, планировать меню и создавать списки покупок."
  },
  {
    question: "Как отменить подписку?",
    answer: "Вы можете отменить подписку в любой момент в разделе «Настройки» → «Подписка». Отмена происходит мгновенно, и вы больше не будете платить."
  },
  {
    question: "Могу ли я использовать сервис бесплатно?",
    answer: "Да, у нас есть бесплатный тариф с базовым функционалом. Также все новые пользователи получают 14 дней бесплатного доступа к Премиум-тарифу."
  },
  {
    question: "Как добавить свой рецепт?",
    answer: "Перейдите в раздел «Рецепты» и нажмите кнопку «Добавить рецепт». Заполните название, ингредиенты, инструкцию и сохраните."
  },
  {
    question: "Безопасны ли мои данные?",
    answer: "Да, мы используем современные методы шифрования и не передаём ваши данные третьим лицам. Подробнее в Политике конфиденциальности."
  }
];
</script>

<style scoped>
/* Стили для details/summary */
details summary::-webkit-details-marker {
  display: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Анимация для появления ответа */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Анимация для иконки */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
