import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src/**/*.ts", "src/**/*.vue"],
      exclude: ["src/**/*.stories.ts"],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AyedaUI",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
        // 👇 Важно: сохраняем имена CSS файлов
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "style.css";
          return assetInfo.name;
        },
      },
    },
    // 👇 Важно: не разделять CSS на части
    cssCodeSplit: false,
    // 👇 Опционально: генерация sourcemap для отладки
    sourcemap: true,
  },
  // 👇 Добавляем поддержку SCSS глобальных переменных (опционально)
  css: {
    preprocessorOptions: {
      scss: {
        // Если хочешь, чтобы переменные были доступны во всех SCSS файлах без импорта
        // additionalData: `@import "./src/styles/_variables.scss";`
      },
    },
  },
});
