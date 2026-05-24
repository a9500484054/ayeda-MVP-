import type { NavigationMenuItem } from '@nuxt/ui';


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
  { label: 'Дашборд', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Пользователи', icon: 'i-lucide-users', to: '/admin/users' },
  { label: 'Рецепты', icon: 'i-lucide-utensils', to: '/admin/recipes' },
  { label: 'Блог', icon: 'i-lucide-newspaper', to: '/admin/articles' },
  { label: 'Модерация',
    icon: 'i-lucide-shield-check',
    defaultOpen: true,
    children: [
      { label: 'Рецепты', icon: 'i-lucide-ruler', to: '/admin/moderate/recipes' },
      { label: 'Сообщения', icon: 'i-lucide-carrot', to: '/admin/moderate/comments' },
    ]
  },
  {
    label: 'Справочники',
    icon: 'i-lucide-book-open',
    defaultOpen: true,
    children: [
      { label: 'Единицы измерения', icon: 'i-lucide-ruler', to: '/admin/units' },
      { label: 'Ингредиенты', icon: 'i-lucide-carrot', to: '/admin/ingredients' },
      { label: 'Категории', icon: 'i-lucide-tags', to: '/admin/categories' },
    ]
  },
] satisfies NavigationMenuItem[];
