import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import Textarea from '../../frontend/app/shared/ui/textarea/Textarea.vue';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Значение текстового поля'
    },
    label: {
      control: 'text',
      description: 'Метка поля'
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер'
    },
    rows: {
      control: 'number',
      description: 'Количество строк',
      min: 1,
      max: 10
    },
    error: {
      control: 'text',
      description: 'Текст ошибки'
    },
    hint: {
      control: 'text',
      description: 'Подсказка под полем'
    },
    required: {
      control: 'boolean',
      description: 'Обязательное поле'
    },
    disabled: {
      control: 'boolean',
      description: 'Отключено'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Компонент многострочного текстового поля с поддержкой ошибок, подсказок и адаптивного дизайна'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Базовое текстовое поле
export const Default: Story = {
  args: {
    label: 'Комментарий',
    placeholder: 'Введите ваш комментарий...',
    rows: 3,
    required: false,
    disabled: false,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :rows="args.rows"
          :required="args.required"
          :disabled="args.disabled"
        />
        <div style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
          Введено символов: {{ value.length }}
        </div>
      </div>
    `,
  }),
};

// С ошибкой
export const WithError: Story = {
  args: {
    label: 'Отзыв',
    placeholder: 'Напишите ваш отзыв...',
    error: 'Отзыв не может быть пустым',
    rows: 4,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :error="args.error"
          :rows="args.rows"
        />
      </div>
    `,
  }),
};

// С подсказкой
export const WithHint: Story = {
  args: {
    label: 'Описание',
    placeholder: 'Опишите вашу проблему...',
    hint: 'Минимум 20 символов, максимум 500',
    rows: 4,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :hint="args.hint"
          :rows="args.rows"
        />
        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
          {{ value.length }}/500 символов
        </div>
      </div>
    `,
  }),
};

// Обязательное поле
export const Required: Story = {
  args: {
    label: 'Сообщение',
    placeholder: 'Введите ваше сообщение...',
    required: true,
    rows: 3,
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :required="args.required"
          :rows="args.rows"
        />
      </div>
    `,
  }),
};

// Отключенное поле
export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    placeholder: 'Это поле недоступно для ввода',
    disabled: true,
    rows: 3,
    modelValue: 'Предустановленный текст, который нельзя изменить',
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :disabled="args.disabled"
          :rows="args.rows"
        />
      </div>
    `,
  }),
};

// Разные размеры (количество строк)
export const DifferentRows: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      const value1 = ref('');
      const value2 = ref('');
      const value3 = ref('');
      const value4 = ref('');

      return { value1, value2, value3, value4 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px;">
        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">1 строка</h3>
          <Textarea
            v-model="value1"
            label="Короткое поле"
            placeholder="Однострочный ввод"
            :rows="1"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">3 строки (по умолчанию)</h3>
          <Textarea
            v-model="value2"
            label="Стандартное поле"
            placeholder="Средний размер"
            :rows="3"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">5 строк</h3>
          <Textarea
            v-model="value3"
            label="Увеличенное поле"
            placeholder="Больше места для текста"
            :rows="5"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">8 строк</h3>
          <Textarea
            v-model="value4"
            label="Большое поле"
            placeholder="Для длинных текстов"
            hint="Идеально для подробных описаний"
            :rows="8"
          />
        </div>
      </div>
    `,
  }),
};

// Все состояния
export const AllStates: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      const normal = ref('');
      const error = ref('Текст с ошибкой');
      const success = ref('Правильный текст');
      const disabled = ref('Отключенное поле');

      return { normal, error, success, disabled };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 500px;">
        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Обычное состояние</h3>
          <Textarea
            v-model="normal"
            label="Обычное поле"
            placeholder="Введите текст..."
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Состояние ошибки</h3>
          <Textarea
            v-model="error"
            label="Поле с ошибкой"
            placeholder="Ошибочное значение"
            error="Пожалуйста, исправьте ошибку"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">С подсказкой</h3>
          <Textarea
            v-model="success"
            label="Поле с подсказкой"
            placeholder="Введите текст"
            hint="Полезная подсказка для пользователя"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Обязательное поле</h3>
          <Textarea
            v-model="normal"
            label="Обязательное поле"
            placeholder="Это поле обязательно"
            required
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Отключенное состояние</h3>
          <Textarea
            v-model="disabled"
            label="Отключенное поле"
            placeholder="Недоступно"
            disabled
          />
        </div>
      </div>
    `,
  }),
};

// Пример формы обратной связи
export const FeedbackForm: Story = {
  render: () => ({
    components: { Textarea },
    setup() {
      const form = ref({
        name: '',
        email: '',
        message: ''
      });

      const errors = ref({
        message: ''
      });

      const validateMessage = () => {
        if (form.value.message.length < 10) {
          errors.value.message = 'Сообщение должно содержать минимум 10 символов';
        } else if (form.value.message.length > 500) {
          errors.value.message = 'Сообщение не должно превышать 500 символов';
        } else {
          errors.value.message = '';
        }
      };

      const handleSubmit = () => {
        validateMessage();
        if (!errors.value.message && form.value.message) {
          console.log('Form submitted:', form.value);
          alert('Спасибо за ваше сообщение!');
          form.value = { name: '', email: '', message: '' };
        } else {
          alert('Пожалуйста, заполните форму правильно');
        }
      };

      return { form, errors, validateMessage, handleSubmit };
    },
    template: `
      <div style="max-width: 500px;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 600;">Обратная связь</h2>

        <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Имя</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ваше имя"
              style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; outline: none; transition: all 0.2s;"
              @focus="(e) => e.target.style.borderColor = '#10b981'"
              @blur="(e) => e.target.style.borderColor = '#e5e7eb'"
            />
          </div>

          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500;">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; outline: none; transition: all 0.2s;"
              @focus="(e) => e.target.style.borderColor = '#10b981'"
              @blur="(e) => e.target.style.borderColor = '#e5e7eb'"
            />
          </div>

          <Textarea
            v-model="form.message"
            label="Сообщение"
            placeholder="Опишите ваш вопрос или проблему..."
            :error="errors.message"
            hint="Минимум 10 символов, максимум 500"
            :rows="5"
            required
            @blur="validateMessage"
          />

          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button
              type="submit"
              style="flex: 1; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 0.75rem; font-weight: 500; cursor: pointer; transition: background 0.2s;"
              @mouseenter="(e) => e.target.style.background = '#059669'"
              @mouseleave="(e) => e.target.style.background = '#10b981'"
            >
              Отправить
            </button>

            <button
              type="button"
              @click="form.message = ''"
              style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.75rem; font-weight: 500; cursor: pointer; transition: background 0.2s;"
              @mouseenter="(e) => e.target.style.background = '#4b5563'"
              @mouseleave="(e) => e.target.style.background = '#6b7280'"
            >
              Очистить
            </button>
          </div>
        </form>

        <div style="margin-top: 1rem; padding: 0.75rem; background: #f3f4f6; border-radius: 0.75rem; font-size: 0.875rem;">
          <strong>Статистика:</strong> {{ form.message.length }}/500 символов
        </div>
      </div>
    `,
  }),
};

// Интерактивный пример с контролами
export const Interactive: Story = {
  args: {
    label: 'Текстовое поле',
    placeholder: 'Введите текст...',
    rows: 4,
    required: false,
    disabled: false,
    hint: '',
    error: '',
  },
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref('');
      const logValue = () => {
        console.log('Current value:', value.value);
      };

      return { args, value, logValue };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 500px;">
        <Textarea
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :rows="args.rows"
          :required="args.required"
          :disabled="args.disabled"
          :hint="args.hint"
          :error="args.error"
        />

        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 0.875rem; color: #6b7280;">
            Текущее значение:
            <strong style="color: #10b981;">{{ value || 'пусто' }}</strong>
          </span>

          <span style="font-size: 0.875rem; color: #6b7280;">
            Символов: {{ value.length }}
          </span>

          <button
            @click="logValue"
            style="padding: 0.375rem 0.75rem; background: #3b82f6; color: white; border-radius: 0.5rem; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.2s;"
            @mouseenter="(e) => e.target.style.background = '#2563eb'"
            @mouseleave="(e) => e.target.style.background = '#3b82f6'"
          >
            Лог в консоль
          </button>
        </div>
      </div>
    `,
  }),
};
