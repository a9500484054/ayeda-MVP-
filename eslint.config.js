import { defineConfig, globalIgnores } from "eslint/config";
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default defineConfig([
  // 1. Глобальные игноры — применяются ко всем конфигам ниже
  globalIgnores([
    '**/dist/',        // игнорировать всю папку dist
    '**/.nuxt/',
    '**/.output/',
    '**/node_modules/',
    '**/coverage/',
    '**/.git/',
    '**/tmp/',
    '**/temp/',
  ]),

  // 2. Базовая конфигурация для всех JS/TS/Vue файлов
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        tsconfigRootDir: process.cwd(),
        project: [
          './tsconfig.json',
          './apps/*/tsconfig.json',
        ],
      },
    },
  },

  // 3. Базовые рекомендованные наборы правил
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // 4. Специальная обработка для .vue файлов
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // Отключаем правило на однословные имена компонентов
      'vue/multi-word-component-names': 'off',
    },
  },

  // 5. Для файлов Storybook (отключаем type-aware линтинг)
  {
    files: ['apps/storybook/.storybook/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: null, // Отключаем проверку типов для этих файлов
      },
    },
  },

  // 6. Для конфигурационных файлов (добавляем Node.js глобалы)
  {
    files: [
      'eslint.config.js',
      '*.config.ts',
      '*.config.js',
      'apps/**/*.config.ts',
      'apps/**/*.config.js',
      '.storybook/**/*.ts',
      '.storybook/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 7. Для тестовых файлов (если появятся)
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  // 8. Для файлов в корне проекта (дополнительные Node.js глобалы)
  {
    files: ['*.js', '*.ts', 'scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
