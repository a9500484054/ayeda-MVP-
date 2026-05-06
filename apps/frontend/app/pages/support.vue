<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

definePageMeta({
  layout: false,
  ssr: false
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
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Левая часть - Брендинг -->
    <div class="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-700 to-teal-800 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full blur-3xl opacity-30"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-30"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <UIcon name="i-lucide-utensils" class="w-5 h-5 text-emerald-600" />
          </div>
          <span class="text-2xl font-bold text-white">AyEda</span>
        </div>
      </div>

      <div class="relative z-10">
        <div class="mb-6">
          <div class="text-7xl mb-4">💬</div>
          <h2 class="text-4xl font-bold text-white mb-3">Мы всегда рядом</h2>
          <p class="text-emerald-100 text-lg leading-relaxed">
            Напишите нам, и мы ответим в течение 24 часов. Ваше мнение важно для нас.
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
            </div>
            <span>Ответ в течение 24 часов</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-message-circle" class="w-3 h-3" />
            </div>
            <span>Поддержка 7 дней в неделю</span>
          </div>
          <div class="flex items-center gap-3 text-white/80 text-sm">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-mail" class="w-3 h-3" />
            </div>
            <span>Свяжитесь с нами любым удобным способом</span>
          </div>
        </div>

        <div class="mt-8 p-5 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
          <p class="text-white/90 text-sm italic">
            "Поддержка ответила за 15 минут и решила мою проблему!"
          </p>
          <p class="text-emerald-200 text-xs mt-2">— Екатерина, пользователь AyEda</p>
        </div>
      </div>

      <div class="relative z-10 text-white/40 text-sm">
        © 2026 AyEda
      </div>
    </div>

    <!-- Правая часть - Контент -->
    <div class="flex flex-col p-8 bg-white overflow-y-auto">
      <div class="max-w-2xl mx-auto w-full">
        <!-- Мобильный логотип -->
        <div class="flex justify-center mb-8 lg:hidden">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <UIcon name="i-lucide-utensils" class="w-5 h-5 text-white" />
            </div>
            <span class="text-2xl font-bold text-gray-900">AyEda</span>
          </div>
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

        <!-- FAQ секция -->
        <div v-if="activeTab === 'faq'" class="space-y-4">
          <div
            v-for="(item, idx) in faqItems"
            :key="idx"
            class="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition"
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
        </div>

        <!-- Контактная форма -->
        <div v-else class="space-y-6">
          <!-- Сообщение об успехе -->
          <Transition name="slide">
            <div v-if="success" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p class="text-sm text-emerald-700 font-medium">Сообщение отправлено!</p>
                  <p class="text-xs text-emerald-600 mt-1">
                    Мы ответим вам в ближайшее время.
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

          <!-- Контактная информация -->
          <div class="mt-8 pt-6 border-t border-gray-100">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Или свяжитесь с нами напрямую:</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <UIcon name="i-lucide-mail" class="w-4 h-4 text-emerald-500" />
                <a href="mailto:support@ayeda.ru" class="hover:text-emerald-600 transition">support@ayeda.ru</a>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <UIcon name="i-lucide-telegram" class="w-4 h-4 text-emerald-500" />
                <a href="#" class="hover:text-emerald-600 transition">@ayeda_support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

form {
  animation: fadeIn 0.5s ease-out;
}

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

