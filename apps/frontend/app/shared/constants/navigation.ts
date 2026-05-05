export const publicNavigation = [
  { label: "Рецепты", to: "/recipes" },
  { label: "Блог", to: "/blog" },
  { label: "О проекте", to: "/about" },
] as const;

export const cabinetNavigation = [
  { label: "Мои рецепты", to: "/cabinet/my-recipes" },
  { label: "Избранное", to: "/cabinet/favorites" },
  { label: "Планировщик", to: "/cabinet/menu-planner" },
  { label: "Покупки", to: "/cabinet/shopping-lists" },
  { label: "Профиль", to: "/cabinet/profile" },
] as const;

export const adminNavigation = [
  { label: "Дашборд", to: "/admin" },
  { label: "Рецепты", to: "/admin/moderate/recipes" },
  { label: "Комментарии", to: "/admin/moderate/comments" },
  { label: "Справочники", to: "/admin/directories" },
] as const;
