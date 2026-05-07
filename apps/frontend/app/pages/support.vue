<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  layout: "cabinet",
})

const pending = ref(false);
const success = ref(false);
const serverError = ref("");
const activeTab = ref('faq');

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

const onSubmit = handleSubmit(async (values) => {
  pending.value = true;
  serverError.value = "";

  try {
    // Здесь будет запрос в поддержку
    // await $fetch('/api/support', { method: 'POST', body: values })

    // Имитация запроса
    await new Promise(resolve => setTimeout(resolve, 1500));

    success.value = true;
    resetForm();

    setTimeout(() => {
      success.value = false;
    }, 5000);
  } catch (err: any) {
    serverError.value = err.message || "Не удалось отправить сообщение. Попробуйте позже.";
  } finally {
    pending.value = false;
  }
});

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

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Заголовок страницы -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Поддержка</h1>
      <p class="text-gray-600">Мы всегда готовы помочь вам с любыми вопросами</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-gray-200 mb-8">
      <button
        @click="activeTab = 'faq'"
        class="px-6 py-3 text-sm font-medium transition-all duration-200 relative"
        :class="activeTab === 'faq'
          ? 'text-emerald-600 border-b-2 border-emerald-600'
          : 'text-gray-500 hover:text-gray-700'"
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
          : 'text-gray-500 hover:text-gray-700'"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square" class="w-4 h-4" />
          Написать нам
        </span>
      </button>
    </div>

    <!-- Инфо-карточки (быстрая помощь) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <UIcon name="i-lucide-clock" class="w-4 h-4 text-emerald-600" />
          </div>
          <span class="text-sm font-medium text-emerald-700">Быстрый ответ</span>
        </div>
        <p class="text-xs text-emerald-600">Отвечаем в течение 24 часов</p>
      </div>

      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <UIcon name="i-lucide-calendar-days" class="w-4 h-4 text-emerald-600" />
          </div>
          <span class="text-sm font-medium text-emerald-700">Работаем ежедневно</span>
        </div>
        <p class="text-xs text-emerald-600">Поддержка 7 дней в неделю</p>
      </div>

      <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-emerald-600" />
          </div>
          <span class="text-sm font-medium text-emerald-700">Команда экспертов</span>
        </div>
        <p class="text-xs text-emerald-600">Поможем решить любой вопрос</p>
      </div>
    </div>

    <!-- FAQ секция -->
    <div v-if="activeTab === 'faq'" class="space-y-4">
      <div
        v-for="(item, idx) in faqItems"
        :key="idx"
        class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white"
      >
        <details class="group">
          <summary class="flex items-center justify-between p-4 cursor-pointer list-none">
            <span class="font-medium text-gray-800">{{ item.question }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div class="p-4 pt-0 text-gray-600 text-sm border-t border-gray-100">
            {{ item.answer }}
          </div>
        </details>
      </div>

      <!-- Дополнительная помощь -->
      <div class="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-center">
        <UIcon name="i-lucide-message-circle" class="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Не нашли ответ?</h3>
        <p class="text-gray-600 text-sm mb-4">Свяжитесь с нами напрямую, и мы поможем вам</p>
        <button
          @click="activeTab = 'contact'"
          class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          Написать в поддержку
        </button>
      </div>
    </div>

    <!-- Контактная форма -->
    <div v-else class="bg-white rounded-xl border border-gray-200 p-6">
      <!-- Сообщение об успехе -->
      <Transition name="slide">
        <div v-if="success" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p class="text-sm text-emerald-700 font-medium">Сообщение отправлено!</p>
              <p class="text-xs text-emerald-600 mt-1">
                Мы ответим вам в ближайшее время на указанный email.
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <form @submit="onSubmit" class="space-y-5">
        <!-- Имя -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
          <div class="relative">
            <UIcon name="i-lucide-user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-bind="nameAttrs"
              v-model="name"
              type="text"
              placeholder="Как вас зовут?"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              :class="{ 'border-red-300': errors.name }"
            />
          </div>
          <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div class="relative">
            <UIcon name="i-lucide-mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-bind="emailAttrs"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              :class="{ 'border-red-300': errors.email }"
            />
          </div>
          <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
        </div>

        <!-- Тема -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Тема</label>
          <div class="relative">
            <UIcon name="i-lucide-tag" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-bind="subjectAttrs"
              v-model="subject"
              type="text"
              placeholder="О чем ваше обращение?"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              :class="{ 'border-red-300': errors.subject }"
            />
          </div>
          <p v-if="errors.subject" class="text-xs text-red-500 mt-1">{{ errors.subject }}</p>
        </div>

        <!-- Сообщение -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Сообщение</label>
          <div class="relative">
            <UIcon name="i-lucide-message-square" class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              v-bind="messageAttrs"
              v-model="message"
              rows="5"
              placeholder="Опишите ваш вопрос подробнее..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition resize-none"
              :class="{ 'border-red-300': errors.message }"
            ></textarea>
          </div>
          <p v-if="errors.message" class="text-xs text-red-500 mt-1">{{ errors.message }}</p>
        </div>

        <!-- Server error -->
        <Transition name="slide">
          <div v-if="serverError" class="p-3 bg-red-50 rounded-xl border border-red-200">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
              <p class="text-sm text-red-600">{{ serverError }}</p>
            </div>
          </div>
        </Transition>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="pending"
          class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!pending" class="flex items-center justify-center gap-2">
            Отправить сообщение
            <UIcon name="i-lucide-send" class="w-4 h-4" />
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            Отправка...
          </span>
        </button>
      </form>

      <!-- Альтернативные контакты -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Или свяжитесь с нами напрямую:</h3>
        <div class="flex flex-wrap gap-4 text-sm">
          <a href="mailto:support@ayeda.ru" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
            <UIcon name="i-lucide-mail" class="w-4 h-4" />
            support@ayeda.ru
          </a>
          <a href="#" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
            <UIcon name="i-lucide-telegram" class="w-4 h-4" />
            @ayeda_support
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

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
</style>
