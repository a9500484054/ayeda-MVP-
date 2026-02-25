// Роли пользователей
export type UserRole = "GUEST" | "USER" | "MODERATOR" | "ADMIN";

export const ROLES = {
  GUEST: "GUEST",
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

// Статусы рецептов
export type RecipeStatus = "PRIVATE" | "PENDING" | "PUBLIC" | "REJECTED";

// Единицы измерения
export type Unit =
  | "г"
  | "кг"
  | "мл"
  | "л"
  | "шт"
  | "ст.л"
  | "ч.л"
  | "щепотка"
  | "по вкусу";

// Базовые интерфейсы
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Константы
export const UNITS: Unit[] = [
  "г",
  "кг",
  "мл",
  "л",
  "шт",
  "ст.л",
  "ч.л",
  "щепотка",
  "по вкусу",
];
