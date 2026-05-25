import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import Input from '../../frontend/app/shared/ui/input/Input.vue';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Значение инпута'
    },
    type: {
      control: 'select',
      options: ['text', 'number', 'email', 'password', 'tel']
    },
    label: {
      control: 'text'
    },
    placeholder: {
      control: 'text'
    },
    icon: {
      control: 'text'
    },
    error: {
      control: 'text'
    },
    hint: {
      control: 'text'
    },
    required: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Базовый инпут с контролами
export const Default: Story = {
  args: {
    label: 'Обычное поле',
    placeholder: 'Введите текст...',
    type: 'text',
    disabled: false,
    required: false,
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :type="args.type"
        :disabled="args.disabled"
        :required="args.required"
      />
    `,
  }),
};

// С иконкой
export const WithIcon: Story = {
  args: {
    label: 'Поиск',
    placeholder: 'Поиск...',
    icon: 'i-lucide-search',
    type: 'text',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :icon="args.icon"
        :type="args.type"
      />
    `,
  }),
};

// С ошибкой
export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@mail.com',
    type: 'email',
    error: 'Введите корректный email адрес',
    icon: 'i-lucide-mail',
    modelValue: 'некорректный email',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :type="args.type"
        :error="args.error"
        :icon="args.icon"
      />
    `,
  }),
};

// С подсказкой
export const WithHint: Story = {
  args: {
    label: 'Пароль',
    placeholder: 'Введите пароль',
    type: 'password',
    hint: 'Пароль должен содержать минимум 8 символов',
    icon: 'i-lucide-lock',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :type="args.type"
        :hint="args.hint"
        :icon="args.icon"
      />
    `,
  }),
};

// Обязательное поле
export const Required: Story = {
  args: {
    label: 'Имя',
    placeholder: 'Введите ваше имя',
    required: true,
    icon: 'i-lucide-user',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :required="args.required"
        :icon="args.icon"
      />
    `,
  }),
};

// Отключенное поле
export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    placeholder: 'Недоступно для ввода',
    disabled: true,
    icon: 'i-lucide-ban',
    modelValue: 'Заблокированное значение',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <Input
        v-model="value"
        :label="args.label"
        :placeholder="args.placeholder"
        :disabled="args.disabled"
        :icon="args.icon"
      />
    `,
  }),
};

// Разные типы полей (без контролов)
export const InputTypes: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const text = ref('');
      const email = ref('');
      const password = ref('');
      const number = ref(0);
      const tel = ref('');

      return { text, email, password, number, tel };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h3 style="font-weight: 500;">Разные типы полей:</h3>

        <Input
          v-model="text"
          label="Текст"
          placeholder="Обычный текст"
          icon="i-lucide-file-text"
        />

        <Input
          v-model="email"
          label="Email"
          type="email"
          placeholder="example@mail.com"
          icon="i-lucide-mail"
        />

        <Input
          v-model="password"
          label="Пароль"
          type="password"
          placeholder="Введите пароль"
          icon="i-lucide-lock"
          hint="Минимум 8 символов"
        />

        <Input
          v-model="number"
          label="Число"
          type="number"
          placeholder="0"
          icon="i-lucide-hash"
        />

        <Input
          v-model="tel"
          label="Телефон"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          icon="i-lucide-phone"
        />
      </div>
    `,
  }),
};

// Все состояния (без контролов)
export const AllStates: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const defaultVal = ref('');
      const errorVal = ref('некорректный ввод');
      const disabledVal = ref('правильный ввод');

      return { defaultVal, errorVal, disabledVal };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Обычное состояние</h3>
          <Input
            v-model="defaultVal"
            label="Обычное поле"
            placeholder="Введите текст"
            icon="i-lucide-user"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Состояние ошибки</h3>
          <Input
            v-model="errorVal"
            label="Поле с ошибкой"
            placeholder="Ошибочное значение"
            error="Пожалуйста, проверьте введенные данные"
            icon="i-lucide-alert-circle"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Отключенное состояние</h3>
          <Input
            v-model="disabledVal"
            label="Отключенное поле"
            placeholder="Недоступно"
            disabled
            icon="i-lucide-lock"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Обязательное поле</h3>
          <Input
            v-model="defaultVal"
            label="Обязательное поле"
            placeholder="Это поле обязательно"
            required
            icon="i-lucide-asterisk"
          />
        </div>

        <div>
          <h3 style="margin-bottom: 0.5rem; font-weight: 500;">С иконкой справа</h3>
          <Input
            v-model="defaultVal"
            label="Поле с иконкой"
            placeholder="Иконка слева"
            icon="i-lucide-search"
          />
        </div>
      </div>
    `,
  }),
};

// Пример формы
export const FormExample: Story = {
  render: () => ({
    components: { Input },
    setup() {
      const form = ref({
        name: '',
        email: '',
        phone: '',
        password: ''
      });

      const errors = ref({
        email: '',
        phone: ''
      });

      const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.value.email && !emailRegex.test(form.value.email)) {
          errors.value.email = 'Введите корректный email';
        } else {
          errors.value.email = '';
        }
      };

      const validatePhone = () => {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (form.value.phone && !phoneRegex.test(form.value.phone)) {
          errors.value.phone = 'Введите корректный номер телефона';
        } else {
          errors.value.phone = '';
        }
      };

      const handleSubmit = () => {
        console.log('Form submitted:', form.value);
        alert('Форма отправлена! Проверьте консоль.');
      };

      return { form, errors, validateEmail, validatePhone, handleSubmit };
    },
    template: `
      <div style="max-width: 400px;">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 600;">Регистрация</h2>

        <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 1rem;">
          <Input
            v-model="form.name"
            label="Имя"
            placeholder="Введите ваше имя"
            required
            icon="i-lucide-user"
          />

          <Input
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="example@mail.com"
            required
            :error="errors.email"
            icon="i-lucide-mail"
            @blur="validateEmail"
          />

          <Input
            v-model="form.phone"
            label="Телефон"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            :error="errors.phone"
            icon="i-lucide-phone"
            hint="В формате +7XXXXXXXXXX"
            @blur="validatePhone"
          />

          <Input
            v-model="form.password"
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            required
            icon="i-lucide-lock"
            hint="Минимум 8 символов"
          />

          <button
            type="submit"
            style="margin-top: 1rem; padding: 0.75rem; background: #10b981; color: white; border-radius: 0.75rem; font-weight: 500; border: none; cursor: pointer; transition: background 0.2s;"
            @mouseenter="(e) => e.target.style.background = '#059669'"
            @mouseleave="(e) => e.target.style.background = '#10b981'"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    `,
  }),
};

// Полностью интерактивный с работающими контролами
export const Interactive: Story = {
  args: {
    label: 'Интерактивное поле',
    placeholder: 'Введите что-нибудь...',
    icon: 'i-lucide-edit',
    type: 'text',
    disabled: false,
    required: false,
    hint: '',
    error: '',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('');
      const logValue = () => {
        console.log('Current value:', value.value);
      };

      return { args, value, logValue };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <Input
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :icon="args.icon"
          :type="args.type"
          :disabled="args.disabled"
          :required="args.required"
          :hint="args.hint"
          :error="args.error"
        />

        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 0.875rem; color: #6b7280;">
            Текущее значение:
            <strong style="color: #10b981;">{{ value || 'пусто' }}</strong>
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
