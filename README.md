# Ayeda — Сервис планирования питания и покупок 🍽️

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-brightgreen)](https://nuxt.com/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Ayeda** — это масштабируемая SaaS-платформа для планирования рациона, которая позволяет пользователям составлять меню, автоматически генерировать списки покупок и обмениваться рецептами внутри сообщества.

## 📦 Технологический стек

### Бэкенд
- **Framework:** NestJS 11
- **ORM:** TypeORM 0.3
- **База данных:** PostgreSQL 15
- **Кэш/Сессии:** Redis 7
- **Аутентификация:** JWT (Access + Refresh tokens)
- **Валидация:** class-validator
- **Документация API:** Swagger (в разработке)

### Фронтенд
- **Framework:** Nuxt 4 (Vue 3)
- **State management:** Pinia
- **Стилизация:** Tailwind CSS
- **PWA:** @vite-pwa/nuxt
- **Валидация форм:** vee-validate + zod

### Инфраструктура
- **Монорепозиторий:** pnpm workspaces
- **Контейнеризация:** Docker & Docker Compose
- **Линтинг:** ESLint 10 + Prettier
- **UI-кит:** Storybook (в разработке)

## 🚀 Быстрый старт

### Предварительные требования
- [Node.js](https://nodejs.org/) (v20 или выше)
- [pnpm](https://pnpm.io/) (v10 или выше)
- [Docker](https://www.docker.com/) (v24 или выше)
- [Docker Compose](https://docs.docker.com/compose/) (v2 или выше)
