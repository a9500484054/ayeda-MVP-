import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginPrettier from "eslint-plugin-prettier";

export default tseslint.config(
  // Глобальные настройки
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx,vue}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },

  // Рекомендованные правила
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],

  // Специальные настройки для Vue файлов
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // TypeScript специфичные правила
  {
    files: ["**/*.{ts,tsx,vue}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  // Игнорируемые папки
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.output/**",
      "**/coverage/**",
      "**/.nuxt/**",
    ],
  },
);
