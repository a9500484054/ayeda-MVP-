// Роли пользователей — значения совпадают с UserRole в
// apps/backend/src/modules/users/entities/user.entity.ts
export type UserRole = "user" | "moderator" | "admin";

export const ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

// Статусы рецептов — значения совпадают с RecipeStatus в
// apps/backend/src/modules/recipes/enums/recipe.enums.ts
export type RecipeStatus =
  | "draft"
  | "private"
  | "pending"
  | "public"
  | "rejected";

// Единицы измерения — справочник units — это CRUD-таблица в БД
// (apps/backend/src/modules/units), а не фиксированный набор строк.
// UnitType здесь — то, что реально закрытым списком (совпадает с UnitType
// в apps/backend/src/modules/units/entities/unit.entity.ts); сами единицы
// (код/название) приходят из API, а не хардкодятся тут.
export type UnitType = "mass" | "volume" | "piece" | "other";

// Базовые интерфейсы
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
